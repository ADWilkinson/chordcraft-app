import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f5f1] dark:bg-[#241c1c] transition-colors duration-200">
      {/* Header with warm color scheme */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-10 bg-[#f9f5f1] dark:bg-[#241c1c] shadow-sm">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
            </div>
            <nav className="flex space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/"
                    ? "bg-[#e5d8ce] text-[#49363b] dark:bg-[#49363b] dark:text-[#e5d8ce]"
                    : "text-[#49363b] hover:bg-[#e5d8ce]/50 hover:text-[#49363b] dark:text-[#e5d8ce] dark:hover:bg-[#49363b]/50 dark:hover:text-[#e5d8ce]"
                }`}
              >
                home
              </Link>
              <Link
                to="/favorites"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === "/favorites"
                    ? "bg-[#e5d8ce] text-[#49363b] dark:bg-[#49363b] dark:text-[#e5d8ce]"
                    : "text-[#49363b] hover:bg-[#e5d8ce]/50 hover:text-[#49363b] dark:text-[#e5d8ce] dark:hover:bg-[#49363b]/50 dark:hover:text-[#e5d8ce]"
                }`}
              >
                favorites
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer with warm color scheme */}
      <footer className="text-[#49363b] dark:text-[#e5d8ce] py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-center">
          <p className="text-sm">
          
          </p>
        </div>
      </footer>
      
      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
};

export default Layout;
