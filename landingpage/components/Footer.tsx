import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Twitter, Linkedin, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-1">
            <motion.div 
              className="flex items-center mb-4"
              whileHover={{ x: 5 }}
            >
              <motion.div 
                className="bg-emerald-500 p-1.5 rounded-lg mr-2"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Sprout className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight">
                RiceVision
              </span>
            </motion.div>
            <p className="text-sm text-slate-400 mb-6">
              Empowering retailers with AI-driven insights to reduce waste and optimize sales.
            </p>
            <div className="flex space-x-4">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <motion.a 
                  key={i}
                  href="#" 
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '#features', label: 'Features' },
                { href: '#pricing', label: 'Pricing' },
                { href: '/api/docs', label: 'API' },
                { href: '#', label: 'Success Stories' }
              ].map((link, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <a href={link.href} className="hover:text-emerald-400 transition-colors">{link.label}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              {['About Us', 'Careers', 'Blog', 'Contact'].map((label, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <a href="#" className="hover:text-emerald-400 transition-colors">{label}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((label, i) => (
                <motion.li key={i} whileHover={{ x: 5 }}>
                  <a href="#" className="hover:text-emerald-400 transition-colors">{label}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} RiceVision Analytics. All rights reserved.
          </p>
          <motion.div 
            className="flex items-center mt-4 md:mt-0 text-sm text-slate-500"
            whileHover={{ color: "rgb(52 211 153)" }}
          >
            <Mail className="h-4 w-4 mr-2" />
            <span>support@ricevision.local</span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;