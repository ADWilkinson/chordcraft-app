import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const AboutPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4 tracking-tight">
            About <span className="inline-block">ChordCraft</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Crafting beautiful chord progressions with the power of AI
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
            variants={fadeIn}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Our Mission</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              ChordCraft was created to help musicians, songwriters, and producers discover inspiring chord progressions
              for their music. By leveraging AI technology, we generate progressions that are musically sound and
              emotionally resonant.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Whether you're stuck in a creative rut or looking to explore new harmonic territories, ChordCraft provides
              a simple way to generate fresh musical ideas tailored to your preferences.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
            variants={fadeIn}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">How It Works</h2>
            </div>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm font-bold mr-3 mt-0.5">1</span>
                <span><span className="font-medium text-black">Select your parameters:</span> Choose a key, scale, mood, and style that match your creative vision.</span>
              </li>
              <li className="flex items-start">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm font-bold mr-3 mt-0.5">2</span>
                <span><span className="font-medium text-black">Generate progressions:</span> Our AI creates chord progressions that align with your selected parameters.</span>
              </li>
              <li className="flex items-start">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm font-bold mr-3 mt-0.5">3</span>
                <span><span className="font-medium text-black">Explore insights:</span> Each progression comes with musical insights that explain the theory behind it.</span>
              </li>
              <li className="flex items-start">
                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-sm font-bold mr-3 mt-0.5">4</span>
                <span><span className="font-medium text-black">Like or flag:</span> Help us improve by liking progressions you enjoy or flagging ones that don't sound right.</span>
              </li>
            </ol>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="bg-black text-white rounded-xl shadow-xl p-8 mb-16 overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="white" d="M45.7,-76.2C58.9,-69.2,69.2,-56.7,76.9,-42.8C84.6,-28.9,89.8,-14.5,88.9,-0.5C88,13.5,81.1,26.9,72.7,39C64.3,51,54.4,61.6,42.2,68.5C29.9,75.4,15,78.5,0.2,78.2C-14.5,77.9,-29,74.2,-42.2,67.2C-55.5,60.2,-67.5,49.9,-74.3,36.9C-81.1,23.8,-82.8,7.9,-80.2,-6.9C-77.6,-21.7,-70.8,-35.5,-61.2,-46.7C-51.6,-57.9,-39.2,-66.5,-26.1,-73.8C-13,-81.1,0.8,-87.1,15.3,-86.5C29.8,-85.9,45,-83.7,45.7,-76.2Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">The Piano-Inspired Experience</h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              Our design philosophy draws inspiration from the elegant simplicity of a piano keyboard. The contrast between black and white keys creates a visual harmony that mirrors the musical harmony we help you create.
            </p>
            
            <div className="flex items-center justify-center my-10">
              <div className="flex h-20">
                {[1, 2, 3, 4, 5, 6, 7].map((key) => (
                  <motion.div 
                    key={key}
                    className="w-12 h-full bg-white border border-gray-300 rounded-b-md relative flex items-end justify-center pb-2 text-black font-medium"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    {key === 1 ? 'C' : key === 2 ? 'D' : key === 3 ? 'E' : key === 4 ? 'F' : key === 5 ? 'G' : key === 6 ? 'A' : 'B'}
                    {[1, 2, 4, 5, 6].includes(key) && (
                      <motion.div 
                        className="absolute -right-3 top-0 w-6 h-12 bg-black rounded-b-md z-10"
                        whileHover={{ y: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            
            <p className="text-lg text-white/80 leading-relaxed">
              Just as a pianist combines individual keys to create beautiful music, ChordCraft helps you combine individual chords to create captivating progressions that resonate with your audience.
            </p>
          </div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          variants={staggerChildren}
          initial="initial"
          animate="animate"
        >
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
            variants={fadeIn}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Music Theory Basics</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black">Keys & Scales</h3>
                <p className="text-gray-700 leading-relaxed">
                  The key determines the home note and overall tonal center of your progression, while scales are sequences of notes that form its foundation. Major scales tend to sound happy, while minor scales often sound sad or contemplative.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-black">Chord Functions</h3>
                <p className="text-gray-700 leading-relaxed">
                  Chords serve different functions in a progression. Some create tension (dominant), others provide resolution (tonic), and some act as bridges between other chords (subdominant).
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
            variants={fadeIn}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-black">Moods & Styles</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-black">Emotional Impact</h3>
                <p className="text-gray-700 leading-relaxed">
                  Different chord combinations evoke different emotions. Major seventh chords often feel dreamy, diminished chords create tension, and suspended chords give a sense of anticipation.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-black">Genre Characteristics</h3>
                <p className="text-gray-700 leading-relaxed">
                  Musical genres have characteristic chord progressions. Jazz uses complex extended chords, pop often relies on simple four-chord loops, and classical music employs sophisticated cadential patterns.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-black mb-4">Ready to Create?</h2>
          <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto mb-6">
            Start generating beautiful chord progressions tailored to your musical vision. No account required.
          </p>
          <motion.a 
            href="/"
            className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.a>
        </motion.div>
      </div>
    </Layout>
  );
};

export default AboutPage;
