import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Main Flask app URL on Render
const FLASK_APP_URL = 'https://anilytics-rice-app.onrender.com';

const Footer: React.FC = () => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

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
    <>
      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {isPrivacyModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPrivacyModalOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Privacy Policy</h2>
                <button onClick={() => setIsPrivacyModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(85vh-100px)] px-8 py-6">
                <div className="prose prose-slate max-w-none">
                  <p className="text-sm text-slate-500 mb-6">Last updated: November 20, 2025</p>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1. Information We Collect</h3>
                  <p className="text-slate-600 mb-4">AniLytics collects information you provide directly to us, including:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Account registration information (name, email, business details)</li>
                    <li>Rice inventory and sales data you input into the platform</li>
                    <li>Usage data and analytics on how you interact with our services</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">2. How We Use Your Information</h3>
                  <p className="text-slate-600 mb-4">We use the information we collect to:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Provide, maintain, and improve our analytics services</li>
                    <li>Generate insights and predictions for your rice business</li>
                    <li>Send you technical notices and support messages</li>
                    <li>Detect and prevent fraudulent or unauthorized activity</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">3. Data Security</h3>
                  <p className="text-slate-600 mb-4">We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. Your business data is stored securely and is never shared with third parties without your consent.</p>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">4. Your Rights</h3>
                  <p className="text-slate-600 mb-4">You have the right to access, update, or delete your personal information at any time. You can manage your data through your account settings or contact our support team.</p>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">5. Contact Us</h3>
                  <p className="text-slate-600">If you have questions about this Privacy Policy, please contact us through the platform.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {isTermsModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTermsModalOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Terms of Service</h2>
                <button onClick={() => setIsTermsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(85vh-100px)] px-8 py-6">
                <div className="prose prose-slate max-w-none">
                  <p className="text-sm text-slate-500 mb-6">Last updated: November 20, 2025</p>
                  
                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">1. Acceptance of Terms</h3>
                  <p className="text-slate-600 mb-4">By accessing and using AniLytics, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our services.</p>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">2. Service Description</h3>
                  <p className="text-slate-600 mb-4">AniLytics provides rice analytics and inventory management tools for retailers and distributors. Our platform offers:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Real-time inventory tracking and analytics</li>
                    <li>Sales velocity and demand forecasting</li>
                    <li>Competitor analysis and market insights</li>
                    <li>Waste reduction recommendations</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">3. User Responsibilities</h3>
                  <p className="text-slate-600 mb-4">You agree to:</p>
                  <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Use the service only for lawful business purposes</li>
                    <li>Not attempt to interfere with or disrupt the service</li>
                  </ul>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">4. Subscription and Payments</h3>
                  <p className="text-slate-600 mb-4">Access to certain features may require a paid subscription. Subscription fees are billed in advance on a recurring basis. You may cancel your subscription at any time.</p>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">5. Limitation of Liability</h3>
                  <p className="text-slate-600 mb-4">AniLytics provides analytics and recommendations as-is. We are not responsible for business decisions made based on our analytics or for any losses incurred.</p>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">6. Changes to Terms</h3>
                  <p className="text-slate-600 mb-4">We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>

                  <h3 className="text-lg font-semibold text-slate-900 mt-6 mb-3">7. Contact</h3>
                  <p className="text-slate-600">For questions about these Terms of Service, please contact us through the platform.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                className="flex items-center gap-3 mb-4"
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  className="bg-white p-2 rounded-xl shadow-lg border border-slate-700"
                  whileHover={{ scale: 1.05 }}
                >
                  <img 
                    src={`${FLASK_APP_URL}/static/../image/AnaLytics.png`}
                    alt="AniLytics" 
                    className="h-6 w-auto"
                  />
                </motion.div>
                <span className="text-lg font-bold text-white">AniLytics</span>
              </motion.div>
              <p className="text-sm text-slate-400 mb-6">
                Empowering rice retailers with AI-driven insights to reduce waste and optimize sales.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                {[
                  { href: '#features', label: 'Features' },
                  { href: '#analytics', label: 'Analytics' },
                  { href: `${FLASK_APP_URL}/register`, label: 'Get Started' }
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
                {['About Us', 'Contact'].map((label, i) => (
                  <motion.li key={i} whileHover={{ x: 5 }}>
                    <a href="#" className="hover:text-emerald-400 transition-colors">{label}</a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <motion.li whileHover={{ x: 5 }}>
                  <button 
                    onClick={() => setIsPrivacyModalOpen(true)} 
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>
                </motion.li>
                <motion.li whileHover={{ x: 5 }}>
                  <button 
                    onClick={() => setIsTermsModalOpen(true)} 
                    className="hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    Terms of Service
                  </button>
                </motion.li>
              </ul>
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="border-t border-slate-800 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-sm text-slate-500">
              &copy; 2025 AniLytics. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
