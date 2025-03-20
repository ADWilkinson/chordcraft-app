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
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateWithAI = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsGeneratingWithAI(true);
    onGenerateWithAI(params)
      .finally(() => setIsGeneratingWithAI(false));
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
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mb-8 border border-zinc-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-center mb-4 text-black">
        {params.key || params.scale || params.startingChord || params.mood || params.style 
          ? 'Customize Your Search' 
          : 'Find Chord Progressions'}
      </h2>
      
      <form>
        <div className="grid grid-cols-1 ">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="col-span-2 sm:col-span-1"
          >
            <Field>
              <Label htmlFor="key" className="text-sm">
                Key
              </Label>
              <select
                id="key"
                name="key"
                value={params.key}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-300 rounded-md py-1.5 px-3 text-sm text-black focus:outline-hidden focus:ring-2 focus:ring-black transition-shadow"
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
            className="col-span-2 sm:col-span-1"
          >
            <Field>
              <Label htmlFor="scale" className="text-sm">
                Scale
              </Label>
              <select
                id="scale"
                name="scale"
                value={params.scale}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-300 rounded-md py-1.5 px-3 text-sm text-black focus:outline-hidden focus:ring-2 focus:ring-black transition-shadow"
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
        </div>
        
        <div className="grid grid-cols-1 ">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="col-span-2 sm:col-span-1"
          >
            <Field>
              <Label htmlFor="mood" className="text-sm">
                Mood
              </Label>
              <select
                id="mood"
                name="mood"
                value={params.mood}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-300 rounded-md py-1.5 px-3 text-sm text-black focus:outline-hidden focus:ring-2 focus:ring-black transition-shadow"
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
            className="col-span-2 sm:col-span-1"
          >
            <Field>
              <Label htmlFor="style" className="text-sm">
                Style
              </Label>
              <select
                id="style"
                name="style"
                value={params.style}
                onChange={handleChange}
                className="w-full bg-white border border-zinc-300 rounded-md py-1.5 px-3 text-sm text-black focus:outline-hidden focus:ring-2 focus:ring-black transition-shadow"
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

        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="col-span-2 sm:col-span-1"
        >
          <Field>
  
            <Input
              type="text"
              id="startingChord"
              name="startingChord"
              value={params.startingChord}
              onChange={handleChange}
              placeholder="Starting Chord e.g., C, Am, G7"
              className="!border !border-zinc-300 rounded text-sm mt-6 mb-2"
            />
          </Field>
        </motion.div>

        <motion.div 
          className="pt-4 flex flex-col sm:flex-row gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {(params.key || params.scale || params.startingChord || params.mood || params.style) && (
            <Button
              type="button"
              onClick={resetForm}
              className="sm:w-1/4 py-1.5 text-sm"
              color="white"
            >
              Reset
            </Button>
          )}
          
          <Button
            type="button"
            onClick={handleGenerateWithAI}
            disabled={loading}
            className="flex-1 py-1.5 text-sm"
            color="indigo"
          >
            {isGeneratingWithAI ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finding Progressions...
              </>
            ) : (
              <>
                <SparklesIcon className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">Find Progressions</span>
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default GeneratorForm;
