import React, { useState, useEffect } from 'react';
import { Menu, X, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-emerald-500 p-1.5 rounded-lg mr-2">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
              RiceVision
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
            <a href="#analytics" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Analytics</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">How it Works</a>
            
            <div className="flex items-center space-x-4 ml-4">
              <a 
                href="/login" 
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Log in
              </a>
              <a 
                href="/register" 
                className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all shadow-lg shadow-emerald-200"
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-emerald-600 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-md">Features</a>
            <a href="#analytics" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-md">Analytics</a>
            <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-md">How it Works</a>
            <div className="border-t border-slate-100 my-2 pt-2">
              <a href="/login" className="block px-3 py-3 text-base font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-md">Log in</a>
              <a href="/register" className="block px-3 py-3 text-base font-medium text-emerald-600 hover:bg-emerald-50 rounded-md">Create Account</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;