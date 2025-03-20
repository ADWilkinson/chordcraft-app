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
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-black shadow-md py-3 px-4 sm:px-6 lg:px-8">
        <Navbar className="container mx-auto">
          <NavbarSection>
            <NavbarItem>
              <RouterLink to="/" className="flex items-center group">
                <motion.span 
                  className="text-2xl font-bold text-white tracking-tight"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <span className="border-b-2 border-transparent group-hover:border-white transition-all duration-300">Chord</span>
                  <span className="text-white">Craft</span>
                </motion.span>
              </RouterLink>
            </NavbarItem>
          </NavbarSection>
          
          <NavbarSpacer />
          
          <NavbarSection className="hidden sm:flex">
            <NavbarItem>
              <RouterLink to="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10">
                Home
              </RouterLink>
            </NavbarItem>
            <NavbarItem>
              <RouterLink to="/about" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 hover:bg-white/10">
                About
              </RouterLink>
            </NavbarItem>
          </NavbarSection>
          
          <NavbarItem className="sm:hidden">
            <button className="text-white p-2 rounded-md hover:bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </NavbarItem>
        </Navbar>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
      
      <footer className="py-5 px-4 sm:px-6 lg:px-8 bg-black mt-auto">
        <div className="container mx-auto text-center text-white/80 text-sm">
          <p className="text-white/80">{new Date().getFullYear()} ChordCraft. All rights reserved.</p>
          <Divider className="my-2 border-white/10" />
          <p className="text-white/80">
            Crafted with AI to help musicians create beautiful chord progressions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
