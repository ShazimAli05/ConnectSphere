import React from 'react';
import { MessageSquare, Heart, Shield, Terminal, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-100 dark:bg-[#070a12] border-t border-slate-200 dark:border-slate-800/80 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">ConnectSphere</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enterprise-grade real-time communication platform engineered with the MERN stack, WebSockets, and state-of-the-art security.
            </p>
          </div>

          {/* Col 2: Architecture */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Architecture
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-brand-500" />
                <span>Socket.IO Engine</span>
              </li>
              <li className="flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-brand-500" />
                <span>JWT & HTTP-Only Auth</span>
              </li>
              <li className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-brand-500" />
                <span>MongoDB & Mongoose</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Features */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Capabilities
            </h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>1-on-1 Direct Messaging</li>
              <li>Collaborative Group Chats</li>
              <li>Media & Document Uploads</li>
              <li>Real-Time Presence & Typing</li>
              <li>Message Reactions & Edits</li>
            </ul>
          </div>

          {/* Col 4: Platform Info */}
          <div>
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Platform Status
            </h3>
            <div className="flex items-center space-x-2 text-sm text-emerald-500 mb-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              WebSocket low-latency bidirectional pipelines connected and active.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} ConnectSphere Platform. Built for professional portfolios and enterprise evaluation.</p>
          <div className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Engineered with precision & modern web standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
