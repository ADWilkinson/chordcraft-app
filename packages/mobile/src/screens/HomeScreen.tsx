import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChordProgression,
  useProgression,
  useFavorites,
  useProgressionNavigation
} from '@chordcraft/common';
import GeneratorForm from '../components/GeneratorForm';
import ProgressionDetail from '../components/ProgressionDetail';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

export default function HomeScreen() {
  // Hooks
  const { 
    fetchRandomProgression, 
    requestChordProgression, 
    like, 
    report 
  } = useProgression();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const {
    progressions,
    currentProgression,
    currentIndex,
    goToNextProgression,
    goToPreviousProgression,
    addProgression,
    setCurrentIndex,
  } = useProgressionNavigation();

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationCount, setGenerationCount] = useState(0);
  const [currentIsFavorite, setCurrentIsFavorite] = useState(false);

  // Check if current progression is a favorite
  useEffect(() => {
    if (!currentProgression) return;

    const checkFavorite = async () => {
      const favorite = await isFavorite(currentProgression.id);
      setCurrentIsFavorite(favorite);
    };

    checkFavorite();
  }, [currentProgression, isFavorite]);

  // Generate a progression
  const handleGenerate = useCallback(async (): Promise<ChordProgression | null> => {
    try {
      setLoading(true);
      setError(null);

      // Choose whether to use AI or random
      const newCount = generationCount + 1;
      setGenerationCount(newCount);
      
      let progression;
      if (newCount >= 5) {
        // Use AI generation
        progression = await requestChordProgression({});
      } else {
        // Use random progression
        progression = await fetchRandomProgression();
      }

      if (progression) {
        addProgression(progression);
      }
      
      return progression || null;
    } catch (err) {
      console.error('Error generating progression:', err);
      setError('Failed to generate progression');
      return null;
    } finally {
      setLoading(false);
    }
  }, [generationCount, requestChordProgression, fetchRandomProgression, addProgression]);

  // Toggle favorite status
  const handleToggleFavorite = useCallback(async () => {
    if (!currentProgression) return;

    try {
      if (currentIsFavorite) {
        await removeFavorite(currentProgression.id);
        setCurrentIsFavorite(false);
      } else {
        await addFavorite(currentProgression);
        await like(currentProgression.id);
        setCurrentIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [currentProgression, currentIsFavorite, addFavorite, removeFavorite, like]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>ChordCraft</Text>
          <Text style={styles.subtitle}>Discover chord progressions</Text>
        </View>
        
        <GeneratorForm
          onGenerate={handleGenerate}
          generationCount={generationCount}
        />
        
        {loading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState 
            title="Error" 
            message={error || "Something went wrong. Please try again."} 
          />
        ) : currentProgression ? (
          <ProgressionDetail
            progression={currentProgression}
            onNext={currentIndex < progressions.length - 1 ? goToNextProgression : undefined}
            onPrevious={currentIndex > 0 ? goToPreviousProgression : undefined}
            onToggleFavorite={handleToggleFavorite}
            isFavorite={currentIsFavorite}
          />
        ) : (
          <EmptyState
            title="No Progression Selected"
            message="Click 'Inspire Me' to discover a chord progression"
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
});