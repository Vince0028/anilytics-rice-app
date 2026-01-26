import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Brain, 
  ShoppingCart, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Leaf,
  LineChart,
  Package,
  Clock,
  X,
  Check
} from 'lucide-react';

// Main Flask app URL on Render
const FLASK_APP_URL = 'https://anilytics-rice-app.onrender.com';

const LandingPage: React.FC = () => {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Close modals on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTrialModalOpen(false);
        setIsPrivacyModalOpen(false);
        setIsTermsModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Container animation with staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  // Item fade up animation
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      } 
    }
  };

  // Fade in from left
  const fadeInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  // Fade in from right
  const fadeInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  // Button hover animation
  const buttonHover = {
    scale: 1.02,
    y: -3,
    transition: { duration: 0.2 }
  };

  const buttonTap = {
    scale: 0.98
  };

  // Card hover animation
  const cardHover = {
    y: -8,
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.3, ease: "easeOut" }
  };

  // Floating animation
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Trial Modal */}
      <AnimatePresence>
        {isTrialModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTrialModalOpen(false)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsTrialModalOpen(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Setting up your trial...</h3>
                <p className="text-slate-600 mb-6">Please wait while we prepare your analytics dashboard</p>
                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>Initializing your workspace</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <span>Configuring analytics modules</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span>Setting up data pipelines</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-emerald-100 via-white to-white"></div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="text-center lg:text-left"
            >
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center px-3 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium mb-6"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                New: AI-Powered Rice Analytics
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight"
              >
                Optimize Sales. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Reduce Waste.
                </span>
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                AniLytics empowers rice distributors and retailers with intelligent analytics to track inventory, analyze market trends, and predict sales demand.
              </motion.p>
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button 
                  onClick={() => setIsTrialModalOpen(true)}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200"
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.button>
                <motion.a 
                  href={`${FLASK_APP_URL}/consumer`}
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-full transition-all duration-200"
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  I'm a Consumer
                </motion.a>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="mt-10 flex items-center justify-center lg:justify-start space-x-8 text-slate-400 text-sm"
              >
                <div className="flex items-center"><ShieldCheck className="h-4 w-4 mr-2 text-emerald-500" /> Secure Data</div>
                <div className="flex items-center"><LineChart className="h-4 w-4 mr-2 text-emerald-500" /> Real-time Analytics</div>
                <div className="flex items-center"><Brain className="h-4 w-4 mr-2 text-emerald-500" /> AI Models</div>
              </motion.div>
            </motion.div>

            {/* Dashboard Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
            >
              <motion.div 
                className="relative rounded-2xl shadow-2xl bg-white border border-slate-100 overflow-hidden"
                animate={floatingAnimation}
              >
                {/* Window Header */}
                <div className="absolute top-0 w-full h-8 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center px-4 space-x-2">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 transition-colors cursor-pointer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.0, duration: 0.3 }}
                  />
                  <div className="flex-1"></div>
                  <div className="text-xs text-slate-400 font-medium">AniLytics Dashboard</div>
                </div>

                <div className="p-6 pt-14 bg-gradient-to-br from-slate-50 to-white">
                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <motion.div 
                      className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 font-medium">Total Sales</span>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">₱2.4M</div>
                      <div className="text-xs text-emerald-600 font-medium">+12.5% ↑</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 font-medium">Inventory</span>
                        <Package className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">1,847</div>
                      <div className="text-xs text-slate-500 font-medium">sacks</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 font-medium">Waste</span>
                        <Leaf className="h-4 w-4 text-orange-500" />
                      </div>
                      <div className="text-lg font-bold text-slate-900">3.2%</div>
                      <div className="text-xs text-orange-600 font-medium">-2.1% ↓</div>
                    </motion.div>
                  </div>

                  {/* Main Chart */}
                  <motion.div 
                    className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Weekly Sales Trend</h3>
                        <p className="text-xs text-slate-500">Rice varieties performance</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md font-medium">Jasmine</span>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">Dinorado</span>
                      </div>
                    </div>
                    <div className="h-32 relative">
                      <div className="absolute bottom-0 left-0 right-0 h-28 flex items-end justify-between gap-1">
                        {[45, 65, 55, 85, 70, 90, 75].map((height, i) => (
                          <motion.div 
                            key={i}
                            className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                            initial={{ height: 0 }}
                            animate={{ height: `${height}%` }}
                            transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </motion.div>

                  {/* Bottom Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-blue-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Orders Today</p>
                          <p className="text-xl font-bold text-slate-900">127</p>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm hover:shadow-md transition-all hover:border-orange-300"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3, duration: 0.5 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Avg. Velocity</p>
                          <p className="text-xl font-bold text-slate-900">4.2d</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating blobs */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-base text-emerald-600 font-semibold tracking-wide uppercase">Features</motion.h2>
            <motion.p variants={itemVariants} className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              Everything you need to grow your rice business
            </motion.p>
            <motion.p variants={itemVariants} className="mt-4 text-lg text-slate-500">
              Our platform combines traditional inventory management with cutting-edge AI to give you the competitive edge.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
          >
            {[
              {
                icon: Brain,
                title: "AI Demand Prediction",
                description: "Forecast future rice demand based on historical data, population demographics, and purchasing power. Never overstock or run out again."
              },
              {
                icon: TrendingUp,
                title: "Market Trends",
                description: "Visualize rice sales patterns, waste percentages, and revenue growth over daily, weekly, or monthly periods."
              },
              {
                icon: Leaf,
                title: "Waste Reduction",
                description: "Smart algorithms calculate unsold rice stock and efficiency scores to help you minimize food waste and maximize sustainability."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={cardHover}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-300 group"
              >
                <motion.div 
                  className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:bg-emerald-500 transition-colors duration-300"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors" />
                </motion.div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
            <motion.div 
              className="lg:col-span-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInLeft}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Data-driven decisions made simple
              </h2>
              <p className="text-lg text-slate-400 mb-8">
                Stop guessing. Use hard data to determine your rice pricing strategy, stock levels, and marketing efforts. Our dashboard provides:
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Rice Sales Velocity", desc: "Track how fast different rice varieties move in your inventory." },
                  { title: "Competitor Analysis", desc: "Compare your rice prices and performance against local market benchmarks." },
                  { title: "Revenue Forecasting", desc: "Projected rice earnings based on current trends and seasonal patterns." }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex group cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full border border-emerald-500 text-emerald-500 mt-1 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <Check className="h-3 w-3" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="mt-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <motion.a 
                  href={`${FLASK_APP_URL}/register`}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center"
                  whileHover={{ x: 5 }}
                >
                  Explore Analytics Features <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative lg:col-span-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInRight}
            >
              {/* Floating accent blobs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              
              {/* Dashboard Images Grid */}
              <div className="grid grid-cols-1 gap-6">
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative">
                    <img 
                      src={`${FLASK_APP_URL}/static/../image/Landing%20page%20img/Data-driven%20decisions%20made%20simple.png`}
                      alt="Data-driven Analytics Dashboard"
                      className="w-full rounded-2xl shadow-2xl border border-slate-700/50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-2xl pointer-events-none"></div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                  <div className="relative">
                    <img 
                      src={`${FLASK_APP_URL}/static/../image/Landing%20page%20img/Data-driven%20decisions%20made%20simple2.png`}
                      alt="Advanced Analytics Features"
                      className="w-full rounded-2xl shadow-2xl border border-slate-700/50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-2xl pointer-events-none"></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold text-slate-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Connecting Retailers and Consumers
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div 
              variants={itemVariants}
              whileHover={cardHover}
              className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100"
            >
              <motion.div 
                className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1 }}
              >
                <BarChart3 className="h-6 w-6 text-emerald-700" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">For Retailers</h3>
              <ul className="text-left text-slate-600 space-y-3 mb-8">
                {['Manage rice inventory stock efficiently', 'Input daily sales data', 'Receive waste reduction alerts', 'View competitor price comparisons'].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    • {item}
                  </motion.li>
                ))}
              </ul>
              <motion.a 
                href={`${FLASK_APP_URL}/register`}
                className="block w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors text-center"
                whileHover={buttonHover}
                whileTap={buttonTap}
              >
                Register as Retailer
              </motion.a>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              whileHover={cardHover}
              className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100"
            >
              <motion.div 
                className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: -10 }}
              >
                <ShoppingCart className="h-6 w-6 text-blue-700" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">For Consumers</h3>
              <ul className="text-left text-slate-600 space-y-3 mb-8">
                {['Browse rice prices in your area', 'Find retailers with stock availability', 'Compare variety qualities', 'Support local businesses'].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    • {item}
                  </motion.li>
                ))}
              </ul>
              <motion.a 
                href={`${FLASK_APP_URL}/consumer`}
                className="block w-full py-3 bg-white border border-emerald-600 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-center"
                whileHover={buttonHover}
                whileTap={buttonTap}
              >
                Register as Consumer
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <motion.div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
          >
            Ready to optimize your rice business?
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-lg text-slate-600 mb-10"
          >
            Join rice distributors and retailers using AniLytics to reduce waste and increase profits.
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex justify-center gap-4"
          >
            <motion.a 
              href={`${FLASK_APP_URL}/register`}
              className="px-8 py-4 text-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-lg transition-all"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Now
            </motion.a>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
