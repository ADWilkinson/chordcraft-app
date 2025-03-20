import { useState } from 'react';
import { motion } from 'framer-motion';
import { LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './ui-kit/button';

interface FeatureSuggestionProps {
  onDismiss: () => void;
  onSubmit: (suggestion: string) => void;
}

const FeatureSuggestion = ({ onDismiss, onSubmit }: FeatureSuggestionProps) => {
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestion.trim()) {
      onSubmit(suggestion);
      setSubmitted(true);
      setTimeout(() => {
        onDismiss();
      }, 3000);
    }
  };
  
  return (
    <motion.div
      className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-6 mb-8 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <button 
        onClick={onDismiss}
        className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
      
      <div className="flex items-center mb-4">
        <div className="bg-amber-100 p-2 rounded-full mr-4">
          <LightBulbIcon className="h-6 w-6 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">Suggest a Feature</h3>
      </div>
      
      {submitted ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-4"
        >
          <p className="text-green-600 font-medium mb-2">Thank you for your suggestion!</p>
          <p className="text-zinc-600">We appreciate your feedback and will consider it for future updates.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-zinc-700 mb-4">
            We're constantly improving ChordCraft. What feature would you like to see next?
          </p>
          
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            placeholder="Describe your feature idea..."
            className="w-full border border-zinc-200 rounded-lg p-3 mb-4 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm min-h-[100px]"
            required
          />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Submit Suggestion
            </Button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default FeatureSuggestion;
