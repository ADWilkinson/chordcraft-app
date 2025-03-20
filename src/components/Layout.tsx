import { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar, NavbarSection, NavbarItem } from "./ui-kit/navbar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#e5d8ce]/30">
      <header className=" mx-auto py-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
        <Navbar className="container mx-auto">
          {/* Nav links centered */}
          <NavbarSection className="flex justify-center items-center gap-8">
            <NavbarItem className="hidden sm:block">
              <RouterLink
                to="/"
                className="relative text-[#241c1c] hover:text-[#49363b] px-3 py-2 rounded-sm text-sm font-medium transition-colors duration-200 hover:bg-[#e5d8ce]/80 group"
              >
                <span>Create</span>
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#49363b] group-hover:w-full"
                  transition={{ duration: 0.2 }}
                  whileHover={{ width: "100%" }}
                />
              </RouterLink>
            </NavbarItem>

            <NavbarItem className="hidden sm:block">
              <RouterLink
                to="/favorites"
                className="relative text-[#241c1c] hover:text-[#49363b] px-3 py-2 rounded-sm text-sm font-medium transition-colors duration-200 hover:bg-[#e5d8ce]/80 group"
              >
                <span>Favorites</span>
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#49363b] group-hover:w-full"
                  transition={{ duration: 0.2 }}
                  whileHover={{ width: "100%" }}
                />
              </RouterLink>
            </NavbarItem>
          </NavbarSection>

          {/* Mobile menu button */}
          <NavbarItem className="sm:hidden absolute right-4">
            <div className="text-[#241c1c] p-2 rounded-sm hover:bg-[#e5d8ce]/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </div>
          </NavbarItem>
        </Navbar>
      </header>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      <footer className="bg-[#49363b] text-[#e5d8ce]/70 py-4 px-4 sm:px-6 lg:px-8 border-t border-[#877a74]/20">
        <div className="container mx-auto flex justify-center">
          <motion.a
            href="https://github.com/ADWilkinson"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#e5d8ce]/80 hover:text-[#e5d8ce] transition-colors flex items-center"
            whileHover={{ scale: 1.05, rotate: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <svg className="h-8 w-8 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </motion.a>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
