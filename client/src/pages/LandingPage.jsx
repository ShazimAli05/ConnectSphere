import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Zap,
  Shield,
  Users,
  Smile,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 dark:bg-brand-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-blue-500/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-300">
                Socket.IO v4 Low Latency Protocol Active
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Enterprise Communication,{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                Engineered for High-Velocity Teams
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              ConnectSphere combines bidirectional WebSocket streams, robust MongoDB persistence, and an obsessive dark-first user interface for frictionless collaboration.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={isAuthenticated ? '/chat' : '/register'}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-blue-600 text-white font-semibold shadow-glow hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center space-x-2"
              >
                <span>{isAuthenticated ? 'Open Chat Dashboard' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/60 transition text-center"
              >
                Explore Demo Accounts
              </Link>
            </div>

            {/* Quick Proof Pills */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero Latency WebSockets</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>JWT + HTTP-Only Security</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Document & Media Sharing</span>
              </div>
            </div>
          </div>

          {/* Interactive Interface Preview Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-brand-500/20 via-slate-700/20 to-transparent border border-slate-300/40 dark:border-slate-700/50 shadow-2xl backdrop-blur-xl">
            <div className="bg-white dark:bg-[#0c1220] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
              {/* Fake Chrome Bar */}
              <div className="h-10 bg-slate-100 dark:bg-slate-900/90 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 select-none">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
                <div className="text-xs text-slate-400 font-medium">connectsphere.internal/workspace</div>
                <div className="w-12"></div>
              </div>

              {/* Mock 3-Pane UI Representation */}
              <div className="grid grid-cols-12 h-96 sm:h-[460px]">
                {/* Mock Sidebar */}
                <div className="col-span-4 sm:col-span-4 border-r border-slate-200 dark:border-slate-800 p-3 space-y-2 hidden sm:block bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center space-x-2 p-2 rounded-xl bg-brand-500/10 border border-brand-500/30">
                    <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                      CE
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-bold truncate">Core Engineering Hub</p>
                      <p className="text-[10px] text-slate-400 truncate">Alex: Socket cluster ready...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                      SJ
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-semibold truncate">Sarah Jenkins</p>
                      <p className="text-[10px] text-slate-400 truncate">Figma tokens exported.</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      PU
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-xs font-semibold truncate">Product & UX Guild</p>
                      <p className="text-[10px] text-slate-400 truncate">User testing positive.</p>
                    </div>
                  </div>
                </div>

                {/* Mock Chat Feed */}
                <div className="col-span-12 sm:col-span-8 p-4 flex flex-col justify-between bg-slate-50 dark:bg-[#070b14]">
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="max-w-xs p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                        <p className="font-semibold text-brand-500 mb-0.5">Alex Morgan</p>
                        <span>Verified WebSocket latency across 4 nodes. Zero dropped frames!</span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="max-w-xs p-3 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-600 text-white text-xs shadow-glow-sm">
                        <span>All security headers, rate limiters, and JWT sessions are synced.</span>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="max-w-xs p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                        <p className="font-semibold text-brand-500 mb-0.5">Sarah Jenkins</p>
                        <span>Uploaded new glassmorphic tokens & icon pack. Ready to deploy!</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Input Bar */}
                  <div className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/70 border border-slate-300/40 dark:border-slate-700 flex items-center justify-between text-xs text-slate-400">
                    <span>Type your message here...</span>
                    <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-20 bg-slate-100/60 dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-brand-600 dark:text-brand-400 uppercase">
              Production Capabilities
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
              Built with Modern Full-Stack Excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Real-Time Bidirectional Streams',
                desc: 'Sub-millisecond real-time communication powered by custom Socket.IO room architectures and automatic reconnection fallbacks.',
              },
              {
                icon: Shield,
                title: 'Defense-in-Depth Security',
                desc: 'Strict JWT authentication with HTTP-only cookies, bcrypt salt hashing, rate limiting, and Role-Based Access Control (RBAC).',
              },
              {
                icon: Users,
                title: 'Collaborative Group Hubs',
                desc: 'Dynamic group channels with dedicated administration rights, participant moderation, and granular member invitations.',
              },
              {
                icon: Smile,
                title: 'Reactions & Message History',
                desc: 'Multi-emoji reactions, threaded replies, inline editing, and deletion controls persisted directly in MongoDB.',
              },
              {
                icon: FileText,
                title: 'Media & File Upload Pipelines',
                desc: 'Seamless file sharing for high-resolution images, design exports, and documents with Cloudinary and local storage fallbacks.',
              },
              {
                icon: Activity,
                title: 'Administrative Command Console',
                desc: 'Complete oversight with real-time system metrics, account moderation tools, and content reporting resolution workflows.',
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 shadow-sm hover:shadow-glow-sm transition duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-8">
            Engineered on Industry-Leading Standards
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80">
            {['React.js', 'Vite', 'Tailwind CSS', 'Node.js', 'Express.js', 'Socket.IO', 'MongoDB', 'Mongoose'].map((tech) => (
              <span key={tech} className="text-base sm:text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
