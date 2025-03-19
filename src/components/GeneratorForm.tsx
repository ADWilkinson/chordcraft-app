import { useState } from 'react';
import { GenerationParams } from '../types';
import { KEYS, SCALES, MOODS, STYLES } from '../constants/music';

interface GeneratorFormProps {
  onGenerate: (params: GenerationParams) => void;
  isLoading: boolean;
}

const GeneratorForm = ({ onGenerate, isLoading }: GeneratorFormProps) => {
  const [params, setParams] = useState<GenerationParams>({
    key: '',
    scale: '',
    startingChord: '',
    mood: '',
    style: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(params);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">Generate Chord Progression</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="key" className="block text-sm font-medium text-gray-200 mb-1">
            Key (Optional)
          </label>
          <select
            id="key"
            name="key"
            value={params.key}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a key</option>
            {KEYS.map((key) => (
              <option key={key.value} value={key.value}>
                {key.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scale" className="block text-sm font-medium text-gray-200 mb-1">
            Scale (Optional)
          </label>
          <select
            id="scale"
            name="scale"
            value={params.scale}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a scale</option>
            {SCALES.map((scale) => (
              <option key={scale.value} value={scale.value}>
                {scale.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="startingChord" className="block text-sm font-medium text-gray-200 mb-1">
            Starting Chord (Optional)
          </label>
          <input
            type="text"
            id="startingChord"
            name="startingChord"
            value={params.startingChord}
            onChange={(e) => setParams({ ...params, startingChord: e.target.value })}
            placeholder="e.g., C, Am, G7"
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="mood" className="block text-sm font-medium text-gray-200 mb-1">
            Mood (Optional)
          </label>
          <select
            id="mood"
            name="mood"
            value={params.mood}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a mood</option>
            {MOODS.map((mood) => (
              <option key={mood.value} value={mood.value}>
                {mood.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium text-gray-200 mb-1">
            Style (Optional)
          </label>
          <select
            id="style"
            name="style"
            value={params.style}
            onChange={handleChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a style</option>
            {STYLES.map((style) => (
              <option key={style.value} value={style.value}>
                {style.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Progression'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneratorForm;
