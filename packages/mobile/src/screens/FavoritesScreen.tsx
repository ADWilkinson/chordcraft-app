import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  useFavorites, 
  useProgression,
  ChordProgression 
} from '@chordcraft/common';
import ProgressionDetail from '../components/ProgressionDetail';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

export default function FavoritesScreen() {
  // Hooks
  const { favorites, loading: favoritesLoading, removeFavorite, loadFavorites } = useFavorites();
  const { like } = useProgression();
  
  // State
  const [selectedProgression, setSelectedProgression] = useState<ChordProgression | null>(null);
  
  // Load favorites when the screen is focused
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);
  
  // Handle selecting a progression
  const handleSelectProgression = useCallback((progression: ChordProgression) => {
    setSelectedProgression(progression);
  }, []);
  
  // Handle removing a favorite
  const handleRemoveFavorite = useCallback(async () => {
    if (!selectedProgression) return;
    
    try {
      await removeFavorite(selectedProgression.id);
      setSelectedProgression(null);
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }, [selectedProgression, removeFavorite]);
  
  // Render a progression card
  const renderItem = useCallback(({ item }: { item: ChordProgression }) => {
    const chordNames = item.chords.map(chord => 
      typeof chord === 'string' ? chord : chord.name
    ).join(' - ');
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => handleSelectProgression(item)}
      >
        <Text style={styles.cardTitle}>{item.key} {item.scale}</Text>
        <Text style={styles.chords}>{chordNames}</Text>
        {item.mood && <Text style={styles.cardTag}>Mood: {item.mood}</Text>}
        {item.style && <Text style={styles.cardTag}>Style: {item.style}</Text>}
      </TouchableOpacity>
    );
  }, [handleSelectProgression]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      {selectedProgression ? (
        <View style={styles.detailContainer}>
          <ProgressionDetail
            progression={selectedProgression}
            onToggleFavorite={handleRemoveFavorite}
            isFavorite={true}
          />
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSelectedProgression(null)}
          >
            <Text style={styles.backButtonText}>Back to Favorites</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Your Favorites</Text>
          </View>
          
          {favoritesLoading ? (
            <LoadingState message="Loading your favorites..." />
          ) : favorites.length > 0 ? (
            <FlatList
              data={favorites}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <EmptyState
              title="No Favorites Yet"
              message="Progressions you save will appear here. Go discover some progressions and add them to your favorites!"
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 8,
  },
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chords: {
    marginTop: 8,
    fontSize: 16,
  },
  cardTag: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailContainer: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontWeight: '500',
  },
});