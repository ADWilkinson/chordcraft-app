/**
 * ChordCraft - Deduplicate Progressions Script
 *
 * This script identifies duplicate chord progressions in Firestore and keeps only the highest quality version.
 * Duplicates are identified by having the same key, scale, and chords array.
 *
 * Usage:
 *   node deduplicate-progressions.js [--dry-run] [--verbose]
 *
 * Options:
 *   --dry-run    Show what would be deleted without actually removing data
 *   --verbose    Show detailed information about each duplicate set
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const chalk = require("chalk");
const args = yargs(hideBin(process.argv))
  .option("dry-run", {
    alias: "d",
    type: "boolean",
    description: "Show what would be deleted without actually removing data",
    default: false,
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Show detailed information about each duplicate set",
    default: false,
  })
  .option("threshold", {
    alias: "t",
    type: "number",
    description: "Minimum number of chords that must match to consider progressions as duplicates",
    default: 4,
  })
  .help().argv;

// Initialize Firebase Admin with service account
const serviceAccountPath = path.resolve(__dirname, "./service-account.json");
let serviceAccount;

try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (error) {
  console.log("Service account file not found at:", serviceAccountPath);
  console.log("Trying alternative paths...");

  // Try alternative paths
  const altPaths = [
    path.resolve(__dirname, "../functions/service-account.json"),
    path.resolve(__dirname, "../service-account.json"),
  ];

  let initialized = false;

  for (const altPath of altPaths) {
    try {
      if (fs.existsSync(altPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(altPath, "utf8"));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("Successfully initialized with service account from:", altPath);
        initialized = true;
        break;
      }
    } catch (e) {
      console.log("Failed to initialize with service account from:", altPath);
    }
  }

  if (!initialized) {
    // Try to use application default credentials
    try {
      admin.initializeApp();
      console.log("Initialized with application default credentials");
    } catch (e) {
      console.error("Failed to initialize Firebase Admin SDK:", e);
      console.error("Please ensure you have a valid service-account.json file");
      process.exit(1);
    }
  }
}

const db = admin.firestore();
const PROGRESSIONS_COLLECTION = "progressions";

// Helper function to create a unique key for a progression based on its content
function createProgressionKey(progression) {
  // Get the key and scale
  const key = progression.key || "";
  const scale = progression.scale || "";

  // Generate a hash of the chords array
  let chordsString = "";

  if (Array.isArray(progression.chords)) {
    // Handle different chord formats (string or object)
    chordsString = progression.chords
      .map((chord) => {
        if (typeof chord === "string") {
          return chord;
        } else if (chord && chord.name) {
          return chord.name;
        } else {
          return JSON.stringify(chord);
        }
      })
      .join("|");
  }

  // Return a combined key for deduplication
  return `${key}|${scale}|${chordsString}`;
}

/**
 * Calculate a quality score for a progression
 *
 * This uses the same logic as in the Firebase functions to ensure consistency
 */
function getProgressionQuality(progression) {
  // If it has a quality score, use that
  if (typeof progression.qualityScore === "number") {
    return progression.qualityScore;
  }

  // Otherwise, calculate a basic quality score
  let score = 100; // Start with perfect score
  const issues = [];

  // Check chord count
  if (!progression.chords || progression.chords.length < 4) {
    issues.push("Insufficient chord count");
    score -= 20;
  }

  // Check insights count
  if (!progression.insights || progression.insights.length < 3) {
    issues.push("Insufficient insights");
    score -= 20;
  }

  // Check insight quality
  if (progression.insights) {
    const shortInsights = progression.insights.filter((insight) => typeof insight === "string" && insight.length < 100);
    if (shortInsights.length > 0) {
      issues.push("Some insights are too short");
      score -= 15;
    }
  }

  // Deduct points for each issue
  if (issues.length > 0) {
    score -= issues.length * 5; // Additional penalty for multiple issues
  }

  // Bonus points for longer progressions (up to +10)
  if (progression.chords && progression.chords.length > 8) {
    score += Math.min((progression.chords.length - 8) * 2, 10);
  }

  // Bonus points for more insights (up to +10)
  if (progression.insights && progression.insights.length > 3) {
    score += Math.min((progression.insights.length - 3) * 3, 10);
  }

  // Bonus points for detailed insights (up to +10)
  if (progression.insights && progression.insights.length > 0) {
    const avgLength =
      progression.insights.reduce((sum, insight) => sum + (typeof insight === "string" ? insight.length : 0), 0) /
      progression.insights.length;
    if (avgLength > 150) {
      score += Math.min((avgLength - 150) / 10, 10);
    }
  }

  // Penalty for reported progressions
  if (progression.reported) {
    score -= 30;
  }

  // Penalty for flagged progressions
  if (progression.flags && progression.flags > 0) {
    score -= Math.min(progression.flags * 5, 20); // Up to 20 points penalty for flags
  }

  // Boost for liked progressions
  if (progression.likes && progression.likes > 0) {
    score += Math.min(progression.likes * 2, 20); // Up to 20 points boost for likes
  }

  // Cap score between 0 and 100
  return Math.max(0, Math.min(100, score));
}

// Main function to find and remove duplicates
async function deduplicateProgressions() {
  console.log("=== ChordCraft Progression Deduplication Tool ===");
  console.log("Starting progression deduplication process...");

  if (args.dryRun) {
    console.log("DRY RUN MODE: No data will be deleted");
  }

  try {
    // Fetch all progressions
    const snapshot = await db.collection(PROGRESSIONS_COLLECTION).get();
    console.log(`Found ${snapshot.size} total progressions in the database`);

    if (snapshot.empty) {
      console.log("No progressions found to deduplicate.");
      return;
    }

    // Group by progression content
    const progressionGroups = new Map();

    snapshot.forEach((doc) => {
      const progression = doc.data();
      progression.id = doc.id; // Add document ID to the data

      const progressionKey = createProgressionKey(progression);

      if (!progressionGroups.has(progressionKey)) {
        progressionGroups.set(progressionKey, []);
      }

      progressionGroups.get(progressionKey).push(progression);
    });

    // Find groups with more than one progression (duplicates)
    let totalDuplicates = 0;
    let totalToDelete = 0;
    const duplicateGroups = [];

    for (const [key, progressions] of progressionGroups.entries()) {
      if (progressions.length > 1) {
        totalDuplicates += progressions.length;
        totalToDelete += progressions.length - 1; // We'll keep one progression from each group
        duplicateGroups.push({ key, progressions });
      }
    }

    console.log(`Found ${duplicateGroups.length} groups of duplicate progressions`);
    console.log(`Total duplicates: ${totalDuplicates}`);
    console.log(`Progressions to delete: ${totalToDelete}`);

    if (duplicateGroups.length === 0) {
      console.log("No duplicate progressions found!");
      return;
    }

    // Process each duplicate group
    let deletedCount = 0;
    let batch = db.batch();
    let batchCount = 0;
    const batchSize = 500; // Firestore batch limit

    for (const group of duplicateGroups) {
      const progressions = group.progressions;

      // Sort by quality score (highest first)
      progressions.sort((a, b) => {
        const qualityA = getProgressionQuality(a);
        const qualityB = getProgressionQuality(b);
        return qualityB - qualityA;
      });

      // Keep the highest quality progression
      const keepProgression = progressions[0];
      const deleteProgressions = progressions.slice(1);

      if (args.verbose) {
        console.log("\n========================");
        console.log(`Duplicate Set: ${group.key.substring(0, 50)}...`);
        console.log(`Found ${progressions.length} duplicates`);
        console.log(`Keeping: ${keepProgression.id} (Quality: ${getProgressionQuality(keepProgression)})`);
        console.log("Deleting:");
        deleteProgressions.forEach((prog) => {
          console.log(`  - ${prog.id} (Quality: ${getProgressionQuality(prog)})`);
        });
      }

      // Delete all but the highest quality progression
      if (!args.dryRun) {
        for (const progression of deleteProgressions) {
          const docRef = db.collection(PROGRESSIONS_COLLECTION).doc(progression.id);
          batch.delete(docRef);
          batchCount++;
          deletedCount++;

          // Commit batch if it reaches the limit
          if (batchCount >= batchSize) {
            await batch.commit();
            console.log(`Committed batch of ${batchCount} deletions`);
            batch = db.batch();
            batchCount = 0;
          }
        }
      }
    }

    // Commit any remaining operations
    if (batchCount > 0 && !args.dryRun) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} deletions`);
    }

    console.log("\n=== Deduplication Summary ===");
    console.log(`Total duplicate groups: ${duplicateGroups.length}`);
    console.log(`Total duplicate progressions: ${totalDuplicates}`);

    if (args.dryRun) {
      console.log(`Would delete: ${totalToDelete} progressions`);
      console.log("No changes were made (dry run)");
    } else {
      console.log(`Deleted: ${deletedCount} progressions`);
      console.log(`Unique progressions remaining: ${snapshot.size - deletedCount}`);
    }
  } catch (error) {
    console.error("Error deduplicating progressions:", error);
  }
}

// Run the deduplication process
deduplicateProgressions()
  .then(() => {
    console.log("Deduplication process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deduplication process failed:", error);
    process.exit(1);
  });
