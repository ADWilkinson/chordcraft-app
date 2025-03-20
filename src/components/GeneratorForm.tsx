import { useState } from 'react';
import { motion } from 'framer-motion';
import { GenerationParams } from '../types';
import { KEYS, SCALES, MOODS, STYLES } from '../constants/music';
import { Button } from './ui-kit/button';
import { Input } from './ui-kit/input';
import { Field, Label } from './ui-kit/fieldset';

interface GeneratorFormProps {
  onSubmit: (params: GenerationParams) => Promise<void>;
  loading: boolean;
}

interface FormControl {
  id: keyof GenerationParams;
  label: string;
  type: 'select' | 'input';
  options?: Array<{ value: string; name: string }>;
  value: string;
  placeholder: string;
}

const GeneratorForm = ({ onSubmit, loading }: GeneratorFormProps) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(params);
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

  const formControls: FormControl[] = [
    {
      id: 'key',
      label: 'Key (Optional)',
      type: 'select',
      options: KEYS,
      value: params.key || '',
      placeholder: 'Select a key',
    },
    {
      id: 'scale',
      label: 'Scale (Optional)',
      type: 'select',
      options: SCALES,
      value: params.scale || '',
      placeholder: 'Select a scale',
    },
    {
      id: 'startingChord',
      label: 'Starting Chord (Optional)',
      type: 'input',
      value: params.startingChord || '',
      placeholder: 'e.g., C, Am, G7',
    },
    {
      id: 'mood',
      label: 'Mood (Optional)',
      type: 'select',
      options: MOODS,
      value: params.mood || '',
      placeholder: 'Select a mood',
    },
    {
      id: 'style',
      label: 'Style (Optional)',
      type: 'select',
      options: STYLES,
      value: params.style || '',
      placeholder: 'Select a style',
    },
  ];

  return (
    <motion.div 
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mb-8 border border-zinc-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold text-center mb-6 text-black">
        {params.key || params.scale || params.startingChord || params.mood || params.style 
          ? 'Customize Your Search' 
          : 'Find Chord Progressions'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {formControls.map((control, index) => (
          <motion.div 
            key={control.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="mb-4"
          >
            <Field>
              <Label htmlFor={control.id}>
                {control.label}
              </Label>
              
              {control.type === 'select' && control.options ? (
                <select
                  id={control.id}
                  name={control.id}
                  value={control.value}
                  onChange={handleChange}
                  className="w-full bg-white border border-zinc-300 rounded-md py-2 px-3 text-black focus:outline-hidden focus:ring-2 focus:ring-black transition-shadow"
                >
                  <option value="">{control.placeholder}</option>
                  {control.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  type="text"
                  id={control.id}
                  name={control.id}
                  value={control.value}
                  onChange={handleChange}
                  placeholder={control.placeholder}
                  className="border-zinc-300"
                />
              )}
            </Field>
          </motion.div>
        ))}

        <motion.div 
          className="pt-4 flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {(params.key || params.scale || params.startingChord || params.mood || params.style) && (
            <Button
              type="button"
              onClick={resetForm}
              className="sm:w-1/3"
              color="white"
            >
              Reset
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"

          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              'Generate Progressions'
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default GeneratorForm;
