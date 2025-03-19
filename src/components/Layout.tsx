import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="py-4 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">
              Chord<span className="text-white">Craft</span>
            </span>
          </Link>
          <nav className="flex space-x-4">
            <Link to="/" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Home
            </Link>
            <Link to="/about" className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              About
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="py-6 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="container mx-auto text-center text-white text-sm">
          <p> {new Date().getFullYear()} ChordCraft. All rights reserved.</p>
          <p className="mt-2">
            Crafted with AI to help musicians create beautiful chord progressions.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
