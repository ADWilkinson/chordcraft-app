import Layout from '../components/Layout';

const AboutPage = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">About ChordCraft</h1>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-gray-300 mb-4">
            ChordCraft was created to help musicians, songwriters, and producers discover inspiring chord progressions
            for their music. By leveraging AI technology, we generate chord progressions that are musically sound and
            emotionally resonant.
          </p>
          <p className="text-gray-300">
            Whether you're stuck in a creative rut or looking to explore new harmonic territories, ChordCraft provides
            a simple way to generate fresh musical ideas tailored to your preferences.
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <ol className="list-decimal list-inside text-gray-300 space-y-3">
            <li>
              <span className="font-medium text-white">Select your parameters:</span> Choose a key, scale, mood, and style
              that match your creative vision (all fields are optional).
            </li>
            <li>
              <span className="font-medium text-white">Generate progressions:</span> Our AI analyzes your preferences and
              creates chord progressions that align with your selected parameters.
            </li>
            <li>
              <span className="font-medium text-white">Explore insights:</span> Each progression comes with musical insights
              that explain why certain chords work together and how they create emotional effects.
            </li>
            <li>
              <span className="font-medium text-white">Like or flag:</span> Help us improve by liking progressions you enjoy
              or flagging ones that don't sound right.
            </li>
          </ol>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Music Theory Basics</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-medium text-white">Keys</h3>
              <p>
                The key determines the home note and overall tonal center of your progression. Common keys include C major,
                A minor, G major, etc.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white">Scales</h3>
              <p>
                Scales are sequences of notes that form the foundation of your chord progression. Major scales tend to sound
                happy, while minor scales often sound sad or contemplative.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white">Chord Functions</h3>
              <p>
                Chords serve different functions in a progression. Some create tension (dominant), others provide resolution
                (tonic), and some act as bridges between other chords (subdominant).
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-white">Moods and Styles</h3>
              <p>
                Different chord combinations evoke different emotions and fit various musical genres. Our AI understands these
                relationships and generates progressions accordingly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
