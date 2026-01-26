import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// Main Flask app URL on Render
const FLASK_APP_URL = 'https://anilytics-rice-app.onrender.com';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClasses = `fixed w-full z-50 transition-all duration-300 ${
    isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
  }`;

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      height: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  return (
    <motion.nav 
      className={navClasses}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="bg-white p-2 rounded-xl shadow-lg group-hover:shadow-emerald-300/50 transition-all duration-300 border border-emerald-100"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src={`${FLASK_APP_URL}/static/../image/AnaLytics.png`}
                alt="AniLytics" 
                className="h-8 w-auto"
              />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              AniLytics
            </span>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {['Features', 'Analytics', 'How it Works'].map((item, i) => (
              <motion.a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors relative group"
                custom={i}
                initial="hidden"
                animate="visible"
                variants={navItemVariants}
                whileHover={{ y: -2 }}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            ))}
            
            <motion.div 
              className="flex items-center space-x-4 ml-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <motion.a 
                href={`${FLASK_APP_URL}/login`} 
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors relative group"
                whileHover={{ scale: 1.05 }}
              >
                Log in
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
              <motion.a 
                href={`${FLASK_APP_URL}/register`} 
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all shadow-lg shadow-emerald-200"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.a>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-emerald-600 focus:outline-none"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-6 w-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              {[
                { href: '#features', label: 'Features' },
                { href: '#analytics', label: 'Analytics' },
                { href: '#how-it-works', label: 'How it Works' }
              ].map((item, i) => (
                <motion.a 
                  key={item.href}
                  href={item.href} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-3 py-3 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-md"
                  custom={i}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileTap={{ scale: 0.98, backgroundColor: "rgb(236 253 245)" }}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.div 
                className="border-t border-slate-100 my-2 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.a 
                  href={`${FLASK_APP_URL}/login`} 
                  className="block px-3 py-3 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-md"
                  custom={3}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  Log in
                </motion.a>
                <motion.a 
                  href={`${FLASK_APP_URL}/register`} 
                  className="block px-3 py-3 text-base font-medium text-emerald-600 hover:bg-emerald-50 rounded-md"
                  custom={4}
                  variants={mobileItemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  Create Account
                </motion.a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
