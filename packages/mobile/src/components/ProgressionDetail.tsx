import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChordProgression, useSwipe } from '@chordcraft/common';
import ProgressionPlayer from './ProgressionPlayer';

interface ProgressionDetailProps {
  progression: ChordProgression;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

const ProgressionDetail: React.FC<ProgressionDetailProps> = ({
  progression,
  onNext,
  onPrevious,
  onToggleFavorite,
  isFavorite = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);

  // Set up swipe handlers
  const { handleGesture } = useSwipe({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
  });

  // Reset chord index when progression changes
  useEffect(() => {
    setCurrentChordIndex(-1);
    setIsPlaying(false);
  }, [progression]);

  // Extract key details for display
  const keyAndScale = `${progression.key} ${progression.scale}`;
  const chordNames = Array.isArray(progression.chords)
    ? progression.chords.map(chord => (typeof chord === 'string' ? chord : chord.name))
    : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{keyAndScale}</Text>
        <View style={styles.tagsContainer}>
          {progression.mood && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{progression.mood}</Text>
            </View>
          )}
          {progression.style && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{progression.style}</Text>
            </View>
          )}
        </View>
      </View>

      <ProgressionPlayer
        progression={progression}
        onChordChange={setCurrentChordIndex}
        onPlayStateChange={setIsPlaying}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onPrevious}
          disabled={!onPrevious}
        >
          <Text style={styles.actionButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, isFavorite ? styles.favoriteActive : {}]}
          onPress={onToggleFavorite}
        >
          <Text style={styles.actionButtonText}>
            {isFavorite ? 'Favorited' : 'Favorite'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onNext}
          disabled={!onNext}
        >
          <Text style={styles.actionButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {progression.insights && progression.insights.length > 0 && (
        <ScrollView style={styles.insights}>
          <Text style={styles.insightsTitle}>Insights</Text>
          {progression.insights.map((insight, index) => (
            <Text key={index} style={styles.insightText}>
              • {insight}
            </Text>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 14,
    color: '#555',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  actionButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontWeight: '500',
  },
  favoriteActive: {
    backgroundColor: '#ffe0b2',
  },
  insights: {
    flex: 1,
    marginTop: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default ProgressionDetail;