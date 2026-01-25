import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Brain, 
  ShoppingCart, 
  BarChart3, 
  ShieldCheck, 
  ArrowRight, 
  Leaf,
  LineChart
} from 'lucide-react';

const LandingPage: React.FC = () => {
  
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

  // Scale up animation
  const scaleUp = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  // Button hover animation
  const buttonHover = {
    scale: 1.05,
    transition: { duration: 0.2 }
  };

  const buttonTap = {
    scale: 0.98
  };

  // Card hover animation
  const cardHover = {
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-100 via-white to-white"></div>
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
                New: AI-Powered Demand Prediction
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight"
              >
                Maximize Profits. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Minimize Waste.
                </span>
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                The comprehensive platform for rice retailers to track inventory, analyze market trends, and predict sales using advanced analytics.
              </motion.p>
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.a 
                  href="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all duration-200"
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.a>
                <motion.a 
                  href="/consumer" 
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

            <motion.div 
              initial={{ opacity: 0, scale: 0.85, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
            >
              <motion.div 
                className="relative rounded-2xl shadow-2xl bg-white border border-slate-100 overflow-hidden"
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
              >
                <div className="absolute top-0 w-full h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 space-x-2">
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-red-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-amber-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, duration: 0.3 }}
                  />
                  <motion.div 
                    className="w-3 h-3 rounded-full bg-emerald-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.0, duration: 0.3 }}
                  />
                </div>
                {/* Abstract Dashboard UI Representation */}
                <div className="p-6 pt-12 grid grid-cols-2 gap-4">
                  <motion.div 
                    className="col-span-2 h-48 bg-slate-50 rounded-xl p-4 border border-slate-100 relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-500/10 to-transparent"></div>
                    <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <motion.path 
                        d="M0,40 L0,30 C10,25 20,35 30,20 C40,10 50,25 60,15 C70,5 80,20 90,10 L100,0 L100,40 Z" 
                        fill="currentColor" 
                        opacity="0.2"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.8, duration: 1.5 }}
                      />
                      <motion.path 
                        d="M0,30 C10,25 20,35 30,20 C40,10 50,25 60,15 C70,5 80,20 90,10 L100,0" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="0.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.8, duration: 1.5 }}
                      />
                    </svg>
                    <div className="absolute top-4 left-4">
                      <div className="h-3 w-24 bg-slate-200 rounded mb-2"></div>
                      <div className="h-6 w-16 bg-slate-800 rounded"></div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="h-32 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="h-3 w-16 bg-slate-200 rounded mb-1"></div>
                      <div className="h-5 w-12 bg-slate-800 rounded"></div>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="h-32 bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                  >
                     <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Leaf className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="h-3 w-16 bg-slate-200 rounded mb-1"></div>
                      <div className="h-5 w-12 bg-slate-800 rounded"></div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              {/* Decorative elements behind */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.h2 
              variants={itemVariants}
              className="text-base text-emerald-600 font-semibold tracking-wide uppercase"
            >
              Features
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="mt-2 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl"
            >
              Everything you need to grow your rice business
            </motion.p>
            <motion.p 
              variants={itemVariants}
              className="mt-4 text-lg text-slate-500"
            >
              Our platform combines traditional inventory management with cutting-edge AI to give you the competitive edge.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div 
              variants={itemVariants} 
              whileHover={cardHover}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-300 group"
            >
              <motion.div 
                className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:bg-emerald-500 transition-colors duration-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Brain className="h-6 w-6 text-emerald-600 group-hover:text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">AI Demand Prediction</h3>
              <p className="text-slate-600">
                Forecast future sales based on historical data, population demographics, and purchasing power. Never overstock or run out again.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              whileHover={cardHover}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-300 group"
            >
              <motion.div 
                className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:bg-emerald-500 transition-colors duration-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <TrendingUp className="h-6 w-6 text-emerald-600 group-hover:text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Market Trends</h3>
              <p className="text-slate-600">
                Visualize sales patterns, waste percentages, and revenue growth over daily, weekly, or monthly periods.
              </p>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              whileHover={cardHover}
              className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-300 group"
            >
              <motion.div 
                className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-6 group-hover:bg-emerald-500 transition-colors duration-300"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Leaf className="h-6 w-6 text-emerald-600 group-hover:text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Waste Reduction</h3>
              <p className="text-slate-600">
                Smart algorithms calculate unsold stock and efficiency scores to help you minimize food waste and maximize sustainability.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section id="analytics" className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInLeft}
            >
              <motion.h2 
                variants={itemVariants}
                className="text-3xl font-bold tracking-tight sm:text-4xl mb-6"
              >
                Data-driven decisions made simple
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className="text-lg text-slate-400 mb-8"
              >
                Stop guessing. Use hard data to determine your pricing strategy, stock levels, and marketing efforts. Our dashboard provides:
              </motion.p>
              
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { title: 'Sales Velocity', desc: 'Track how fast different rice varieties move.' },
                  { title: 'Competitor Analysis', desc: 'Compare your performance against local market benchmarks.' },
                  { title: 'Revenue Forecasting', desc: 'Projected earnings based on current trends.' }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex"
                    variants={itemVariants}
                    whileHover={{ x: 10, transition: { duration: 0.2 } }}
                  >
                    <motion.div 
                      className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full border border-emerald-500 text-emerald-500 mt-1"
                      whileHover={{ scale: 1.2, backgroundColor: "rgb(16 185 129)", color: "white" }}
                    >
                      <span className="text-xs font-bold">✓</span>
                    </motion.div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium">{item.title}</h4>
                      <p className="text-slate-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                className="mt-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                 <motion.a 
                  href="/register" 
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center"
                  whileHover={{ x: 5 }}
                >
                  Explore Analytics Features <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              </motion.div>
            </motion.div>

            <motion.div 
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInRight}
            >
              {/* Simulated Analytics Graphic */}
              <motion.div 
                className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-2xl"
                initial={{ rotate: 2 }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <div className="h-4 w-32 bg-slate-600 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-slate-700 rounded"></div>
                  </div>
                  <motion.div 
                    className="h-8 w-24 bg-emerald-600/20 text-emerald-400 rounded flex items-center justify-center text-sm font-mono"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    +12.5%
                  </motion.div>
                </div>
                <div className="h-64 flex items-end space-x-4">
                  {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-slate-700 rounded-t-md relative group overflow-hidden" style={{ height: '100%' }}>
                       <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                          className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400"
                       />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between text-xs text-slate-500 font-mono">
                   <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison / Consumer Section */}
      <section id="how-it-works" className="py-24 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold text-slate-900 mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Connecting Retailers and Consumers
          </motion.h2>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            <motion.div 
              variants={itemVariants}
              whileHover={cardHover}
              className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100"
            >
              <motion.div 
                className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                whileHover={{ scale: 1.1, rotate: 10 }}
              >
                <BarChart3 className="h-6 w-6 text-emerald-700" />
              </motion.div>
              <h3 className="text-xl font-bold mb-4">For Retailers</h3>
              <ul className="text-left text-slate-600 space-y-3 mb-8">
                {['Manage inventory stock efficiently', 'Input daily sales data', 'Receive waste reduction alerts', 'View competitor price comparisons'].map((item, idx) => (
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
                href="/register?role=retailer" 
                className="block w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
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
                href="/register?role=consumer" 
                className="block w-full py-3 bg-white border border-emerald-600 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
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
          viewport={{ once: true, margin: "-100px" }}
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
            Join hundreds of retailers who are reducing waste and increasing profits with RiceVision.
          </motion.p>
          <motion.div 
            variants={itemVariants}
            className="flex justify-center gap-4"
          >
            <motion.a 
              href="/register" 
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