import { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, NavbarSection, NavbarSpacer, NavbarItem } from './ui-kit/navbar';
import { Divider } from './ui-kit/divider';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="bg-black shadow-md py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
        <Navbar className="container mx-auto">
          <NavbarSection>
            <NavbarItem>
              <RouterLink to="/" className="flex items-center group">
                <motion.span 
                  className="text-2xl font-bold text-white tracking-tight flex items-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.span 
                    className="mr-1"
                    animate={{ 
                      rotate: [0, 5, 0, -5, 0],
                      scale: [1, 1.1, 1, 1.1, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatDelay: 5,
                      duration: 0.5 
                    }}
                  >
                    🎵
                  </motion.span>
                  <span className="text-white">Chord</span>
                  <span className="text-zinc-400">Craft</span>
                </motion.span>
              </RouterLink>
            </NavbarItem>
          </NavbarSection>
          
          <NavbarSpacer />
          
          <NavbarSection className="hidden sm:flex">
            <NavbarItem>
              <RouterLink to="/" className="relative text-white hover:text-zinc-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10 group">
                <span>Home</span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-zinc-400 group-hover:w-full" 
                  transition={{ duration: 0.2 }}
                  whileHover={{ width: '100%' }}
                />
              </RouterLink>
            </NavbarItem>
            <NavbarItem>
              <RouterLink to="/favorites" className="relative text-white hover:text-zinc-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10 group">
                <span>Favorites</span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-zinc-400 group-hover:w-full" 
                  transition={{ duration: 0.2 }}
                  whileHover={{ width: '100%' }}
                />
              </RouterLink>
            </NavbarItem>
            <NavbarItem>
              <RouterLink to="/about" className="relative text-white hover:text-zinc-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10 group">
                <span>How It Works</span>
                <motion.span 
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-zinc-400 group-hover:w-full" 
                  transition={{ duration: 0.2 }}
                  whileHover={{ width: '100%' }}
                />
              </RouterLink>
            </NavbarItem>
          </NavbarSection>
          
          <NavbarItem className="sm:hidden">
            <div className="text-white p-2 rounded-md hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
          </NavbarItem>
        </Navbar>
      </header>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-zinc-900 text-zinc-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <motion.h3 
                className="text-xl font-semibold text-white mb-4 flex items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <span className="mr-2">🎵</span>
                <span className="text-white">ChordCraft</span>
              </motion.h3>
              <p className="text-sm">Create beautiful chord progressions with the power of AI.</p>
              <div className="mt-4">
                <p className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} ChordCraft</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <RouterLink to="/" className="hover:text-white transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </RouterLink>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <RouterLink to="/favorites" className="hover:text-white transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Favorites
                  </RouterLink>
                </motion.li>
                <motion.li whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <RouterLink to="/about" className="hover:text-white transition-colors flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How It Works
                  </RouterLink>
                </motion.li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
              <div className="flex space-x-4">
                <motion.a 
                  href="#" 
                  className="text-zinc-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-zinc-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.2, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </motion.a>
              </div>
              <p className="mt-4 text-sm">
                Made with <span className="text-red-500">❤️</span> for musicians
              </p>
            </div>
          </div>
          <Divider className="my-6 border-zinc-800" />
        </div>
      </footer>
    </div>
  );
};

export default Layout;
