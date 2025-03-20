import { useState } from 'react';
import { motion } from 'framer-motion';
import { GenerationParams } from '../types';
import { KEYS, SCALES, MOODS, STYLES } from '../constants/music';
import { Button } from './ui-kit/button';
import { Input } from './ui-kit/input';
import { Field, Label } from './ui-kit/fieldset';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface GeneratorFormProps {
  onGenerateWithAI: (params: GenerationParams) => Promise<void>;
  loading: boolean;
}

const GeneratorForm = ({ onGenerateWithAI, loading }: GeneratorFormProps) => {
  const [params, setParams] = useState<GenerationParams>({
    key: '',
    scale: '',
    startingChord: '',
    mood: '',
    style: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateWithAI = (e: React.MouseEvent) => {
    e.preventDefault();
    onGenerateWithAI(params)
      .finally(() => {});
  };

  const resetForm = () => {
    setParams({
      key: '',
      scale: '',
      startingChord: '',
      mood: '',
      style: '',
    });
  };

  return (
    <motion.div 
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6 mb-8 border border-zinc-100 hover:shadow-lg transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-zinc-900">
        {params.key || params.scale || params.startingChord || params.mood || params.style 
          ? 'Customize Your Search' 
          : 'Find Chord Progressions'}
      </h2>
      
      <form>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-1"
          >
            <Field>
              <Label htmlFor="key" className="text-sm font-medium text-zinc-700">
                Key
              </Label>
              <select
                id="key"
                name="key"
                value={params.key}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              >
                <option value="">Any Key</option>
                {KEYS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </Field>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="col-span-1"
          >
            <Field>
              <Label htmlFor="scale" className="text-sm font-medium text-zinc-700">
                Scale
              </Label>
              <select
                id="scale"
                name="scale"
                value={params.scale}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              >
                <option value="">Any Scale</option>
                {SCALES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </Field>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="col-span-2"
          >
            <Field>
              <Label htmlFor="startingChord" className="text-sm font-medium text-zinc-700">
                Starting Chord <span className="text-zinc-400 text-xs">(Optional)</span>
              </Label>
              <Input
                id="startingChord"
                name="startingChord"
                placeholder="e.g. C, Am, F#m7"
                value={params.startingChord}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
            </Field>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="col-span-1"
          >
            <Field>
              <Label htmlFor="mood" className="text-sm font-medium text-zinc-700">
                Mood
              </Label>
              <select
                id="mood"
                name="mood"
                value={params.mood}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              >
                <option value="">Any Mood</option>
                {MOODS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </Field>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="col-span-1"
          >
            <Field>
              <Label htmlFor="style" className="text-sm font-medium text-zinc-700">
                Style
              </Label>
              <select
                id="style"
                name="style"
                value={params.style}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-200 rounded-lg py-2 px-3 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              >
                <option value="">Any Style</option>
                {STYLES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </Field>
          </motion.div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGenerateWithAI}
            disabled={loading}
            className="flex items-center justify-center py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Find Progressions
              </>
            )}
          </Button>
          
          <Button
            onClick={resetForm}
            className="flex items-center justify-center py-2 px-6 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-medium transition-colors"
          >
            Reset
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default GeneratorForm;
