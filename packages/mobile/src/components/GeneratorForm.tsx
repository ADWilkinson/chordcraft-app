import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChordProgression } from '@chordcraft/common';

interface GeneratorFormProps {
  onGenerate: () => Promise<ChordProgression | null>;
  generationCount: number;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onGenerate,
  generationCount,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = async () => {
    try {
      setLoading(true);
      setError(null);
      await onGenerate();
    } catch (err) {
      console.error('Error generating progression:', err);
      setError('Failed to generate progression. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Need inspiration?</Text>
      
      <TouchableOpacity
        style={[styles.generateButton, loading && styles.generateButtonDisabled]}
        onPress={handleGenerateClick}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>Inspire Me</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Text style={styles.infoText}>
        {generationCount >= 5
          ? "Our AI will create a unique progression just for you!"
          : `Random progressions from our library (${generationCount}/5)`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    minHeight: 48,
  },
  generateButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#f44336',
    marginTop: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default GeneratorForm;