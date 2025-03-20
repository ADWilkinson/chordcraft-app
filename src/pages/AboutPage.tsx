import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { 
  MusicalNoteIcon, 
  LightBulbIcon, 
  SparklesIcon,
  BookOpenIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

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
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ChordCraft
          </h1>
          <p className="text-xl text-zinc-700 max-w-2xl mx-auto leading-relaxed">
            AI-powered chord progressions for musicians and songwriters
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 border border-zinc-200 hover:shadow-2xl transition-all duration-500"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                <MusicalNoteIcon className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-800 tracking-tight">Create</h2>
            </div>
            <p className="text-zinc-700 mb-6 leading-relaxed">
              Select your parameters and let our AI generate chord progressions that match your creative vision. Explore different keys, scales, moods, and styles to find the perfect progression for your next song.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Key', 'Scale', 'Mood', 'Style'].map(param => (
                <span key={param} className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {param}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl p-8 border border-zinc-200 hover:shadow-2xl transition-all duration-500"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-md">
                <LightBulbIcon className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-zinc-800 tracking-tight">Learn</h2>
            </div>
            <p className="text-zinc-700 mb-6 leading-relaxed">
              Every progression comes with music theory insights that explain why certain chords work together. Understand the theory behind your music while you create.
            </p>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <p className="text-zinc-700 italic">
                "The progression uses a I-vi-IV-V pattern, a classic chord sequence found in many pop and rock songs. The vi chord adds emotional depth while the V chord creates tension that resolves back to the I."
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-2xl p-10 border border-zinc-200 mb-16 relative overflow-hidden shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 -mt-10 -mr-10 bg-indigo-100 rounded-full opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 -mb-8 -ml-8 bg-purple-100 rounded-full opacity-50"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-8 tracking-tight">How ChordCraft Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md border border-zinc-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="text-indigo-700 font-bold">1</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-800 mb-3">Inspire Me</h3>
                <p className="text-zinc-600">
                  Click the "Inspire Me" button to discover curated chord progressions from our database.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-zinc-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="text-indigo-700 font-bold">2</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-800 mb-3">Listen & Analyze</h3>
                <p className="text-zinc-600">
                  Play the progression and explore the music theory insights to understand how it works.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-zinc-100">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <span className="text-indigo-700 font-bold">3</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-800 mb-3">Save & Share</h3>
                <p className="text-zinc-600">
                  Save your favorite progressions and share them with other musicians and songwriters.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div
            className="bg-white rounded-xl shadow-md p-6 border border-zinc-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <SparklesIcon className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-800 mb-2">AI-Powered</h3>
            <p className="text-zinc-600">
              Our advanced AI understands music theory and creates progressions that sound great in your chosen style.
            </p>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-md p-6 border border-zinc-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <BookOpenIcon className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-800 mb-2">Educational</h3>
            <p className="text-zinc-600">
              Learn music theory concepts through practical examples and detailed progression analysis.
            </p>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-xl shadow-md p-6 border border-zinc-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <ShareIcon className="h-8 w-8 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-800 mb-2">Collaborative</h3>
            <p className="text-zinc-600">
              Share your discoveries with other musicians and build on each other's creative ideas.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-10 text-center mb-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Start Creating</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Ready to find your next chord progression? Head back to the home page and start creating music.
          </p>
          <Link 
            to="/" 
            className="inline-block bg-white text-indigo-700 px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-md font-medium"
          >
            Create Chord Progressions
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AboutPage;
