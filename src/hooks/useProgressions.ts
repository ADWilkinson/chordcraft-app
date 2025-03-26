import { useState, useEffect, useCallback } from "react";
import { ChordProgression, GenerationParams } from "../types";
import { findProgressions } from "../services/progressionService";

interface UseProgressionsResult {
  progressions: ChordProgression[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

interface UseProgressionsOptions {
  pageSize?: number;
  initialLoad?: boolean;
}

/**
 * Hook for paginated progression loading
 */
export const useProgressions = (
  params: GenerationParams,
  options: UseProgressionsOptions = {}
): UseProgressionsResult => {
  const { pageSize = 10, initialLoad = true } = options;

  const [progressions, setProgressions] = useState<ChordProgression[]>([]);
  const [loading, setLoading] = useState(initialLoad);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (initialLoad) {
      refresh();
    }
  }, [initialLoad, JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh progressions (clear and reload)
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Reset pagination
      setLastDocId(null);

      // Get first page
      const result = await findProgressions({
        ...params,
        limit: pageSize,
      });

      setProgressions(result);
      setHasMore(result.length === pageSize);

      if (result.length > 0) {
        setLastDocId(result[result.length - 1].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load progressions"));
      console.error("Error refreshing progressions:", err);
    } finally {
      setLoading(false);
    }
  }, [params, pageSize]);

  // Load more progressions (pagination)
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const result = await findProgressions({
        ...params,
        limit: pageSize,
        startAfter: lastDocId || undefined,
      });

      if (result.length > 0) {
        setProgressions((prev) => [...prev, ...result]);
        setLastDocId(result[result.length - 1].id);
      }

      setHasMore(result.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more progressions"));
      console.error("Error loading more progressions:", err);
    } finally {
      setLoading(false);
    }
  }, [params, pageSize, lastDocId, loading, hasMore]);

  return {
    progressions,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
};
