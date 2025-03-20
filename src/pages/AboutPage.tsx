import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const AboutPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6 tracking-tight">
            <span className="inline-block text-zinc-700">ChordCraft</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            AI-powered chord progressions for musicians and songwriters
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            className="bg-white rounded-md shadow-lg p-8 border border-zinc-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-zinc-800 rounded-md flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Create</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Select your parameters and let our AI generate chord progressions that match your creative vision. Explore different keys, scales, moods, and styles to find the perfect progression for your next song.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Key', 'Scale', 'Mood', 'Style'].map(param => (
                <span key={param} className="inline-block bg-zinc-100 text-zinc-800 px-3 py-1 rounded-md text-sm">
                  {param}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-md shadow-lg p-8 border border-zinc-200"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-zinc-800 rounded-md flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Learn</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Every progression comes with music theory insights that explain why certain chords work together. Understand the theory behind your music while you create.
            </p>
            <div className="p-3 bg-zinc-50 rounded-md border border-zinc-200">
              <p className="text-sm text-zinc-700 italic">
                "The progression uses a I-vi-IV-V pattern, a classic chord sequence found in many pop and rock songs. The vi chord adds emotional depth while the V chord creates tension that resolves back to the I."
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="bg-zinc-100 rounded-md p-8 border border-zinc-200 mb-16 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 -mt-8 -mr-8 bg-zinc-200 rounded-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 -mb-6 -ml-6 bg-zinc-200 rounded-full opacity-50"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">How ChordCraft Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-md shadow-sm">
                <div className="w-10 h-10 bg-zinc-200 rounded-md flex items-center justify-center mb-4">
                  <span className="text-zinc-800 font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Parameters</h3>
                <p className="text-gray-700 text-sm">
                  Choose a key, scale, mood, and style that match your creative vision.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-md shadow-sm">
                <div className="w-10 h-10 bg-zinc-200 rounded-md flex items-center justify-center mb-4">
                  <span className="text-zinc-800 font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate</h3>
                <p className="text-gray-700 text-sm">
                  Our AI creates progressions that align with your parameters, drawing from music theory principles.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-md shadow-sm">
                <div className="w-10 h-10 bg-zinc-200 rounded-md flex items-center justify-center mb-4">
                  <span className="text-zinc-800 font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Save & Share</h3>
                <p className="text-gray-700 text-sm">
                  Save your favorite progressions and share them with other musicians and songwriters.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="bg-white rounded-md shadow-lg p-8 border border-zinc-200 text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-black mb-4">Start Creating</h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Ready to find your next chord progression? Head back to the home page and start creating music.
          </p>
          <a 
            href="/" 
            className="inline-block bg-zinc-800 text-white px-6 py-3 rounded-md hover:bg-black transition-colors"
          >
            Create Chord Progressions
          </a>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AboutPage;
