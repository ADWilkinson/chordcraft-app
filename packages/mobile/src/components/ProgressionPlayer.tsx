import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  ChordProgression, 
  initAudio, 
  playProgression, 
  stopAllAudio,
  getChordName
} from '@chordcraft/common';

interface ProgressionPlayerProps {
  progression: ChordProgression;
  onChordChange?: (index: number) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

const ProgressionPlayer: React.FC<ProgressionPlayerProps> = ({
  progression,
  onChordChange,
  onPlayStateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(-1);
  const [tempo, setTempo] = useState(80);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Reference to the player controller
  const playerRef = React.useRef<{ stop: () => Promise<void>; isPlaying: () => boolean } | null>(null);
  
  // Initialize audio when component mounts
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await initAudio();
        setAudioInitialized(true);
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };
    
    initializeAudio();
    
    // Cleanup when component unmounts
    return () => {
      if (playerRef.current?.isPlaying()) {
        playerRef.current.stop();
      }
      stopAllAudio();
    };
  }, []);
  
  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      // Stop playback
      if (playerRef.current) {
        await playerRef.current.stop();
        playerRef.current = null;
      }
      setIsPlaying(false);
      setCurrentChordIndex(-1);
      if (onChordChange) onChordChange(-1);
      if (onPlayStateChange) onPlayStateChange(false);
    } else {
      // Start playback
      try {
        if (!audioInitialized) {
          await initAudio();
          setAudioInitialized(true);
        }
        
        const player = await playProgression(
          progression.chords,
          tempo,
          (index) => {
            setCurrentChordIndex(index);
            if (onChordChange) onChordChange(index);
          },
          () => {
            setIsPlaying(false);
            setCurrentChordIndex(-1);
            if (onChordChange) onChordChange(-1);
            if (onPlayStateChange) onPlayStateChange(false);
            playerRef.current = null;
          }
        );
        
        playerRef.current = player;
        setIsPlaying(true);
        if (onPlayStateChange) onPlayStateChange(true);
      } catch (error) {
        console.error('Error playing progression:', error);
      }
    }
  }, [isPlaying, progression, tempo, audioInitialized, onChordChange, onPlayStateChange]);
  
  // Reset playback
  const handleReset = useCallback(async () => {
    if (playerRef.current) {
      await playerRef.current.stop();
      playerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentChordIndex(-1);
    if (onChordChange) onChordChange(-1);
    if (onPlayStateChange) onPlayStateChange(false);
  }, [onChordChange, onPlayStateChange]);
  
  // Adjust tempo
  const adjustTempo = useCallback((amount: number) => {
    setTempo(prev => {
      const newTempo = prev + amount;
      return Math.max(40, Math.min(240, newTempo)); // Clamp between 40-240 BPM
    });
  }, []);
  
  // Extract chord names for display
  const chordNames = progression.chords.map(chord => 
    typeof chord === 'string' ? chord : chord.name
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.chordDisplay}>
        {chordNames.map((chord, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.chordBox,
              index === currentChordIndex && styles.currentChord
            ]}
            disabled={isPlaying}
          >
            <Text style={styles.chordText}>{chord}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.controls}>
        <View style={styles.tempoControls}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => adjustTempo(-5)}
            disabled={isPlaying}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.tempoText}>{tempo} BPM</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => adjustTempo(5)}
            disabled={isPlaying}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.transportControls}>
          <TouchableOpacity 
            style={[styles.button, styles.mainButton]} 
            onPress={togglePlay}
          >
            <Text style={styles.buttonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
            disabled={!isPlaying}
          >
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  chordDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chordBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    margin: 4,
    minWidth: 50,
    alignItems: 'center',
  },
  currentChord: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  chordText: {
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    marginTop: 8,
  },
  tempoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tempoText: {
    fontSize: 14,
    marginHorizontal: 12,
  },
  transportControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  mainButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 24,
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
  },
  buttonText: {
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ProgressionPlayer;