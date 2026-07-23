import React from 'react';
import { X, Code, BookOpen, ShieldCheck, CheckCircle2, Terminal, Briefcase, ExternalLink, Quote, User } from 'lucide-react';

export default function OwnerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const expertise = [
    "Full-Stack Web Development", "Custom Web Applications", 
    "REST API Development", "Database Design & Management", 
    "Educational Technology Platforms", "Healthcare Technology Solutions", 
    "AI Integration & Automation", "UI/UX Design", 
    "Cloud Deployment & Hosting", "Website Maintenance & Support"
  ];

  const technologies = [
    "React", "Vite", "JavaScript", "Tailwind CSS", "HTML", "CSS", 
    "Python", "Flask", "PostgreSQL", "SQLite", "Git", "GitHub", 
    "Cloudflare", "Docker", "Vercel", "Lucide React"
  ];

  const socialLinks = [
    { name: "LinkedIn", url: "https://www.linkedin.com/in/samuel-peprah-a63598347", color: "hover:bg-blue-600 hover:border-blue-500" },
    { name: "X (Twitter)", url: "https://x.com/legend_consult", color: "hover:bg-slate-700 hover:border-slate-600" },
    { name: "Instagram", url: "https://www.instagram.com/ksapeprah", color: "hover:bg-pink-600 hover:border-pink-500" },
    { name: "TikTok", url: "https://www.tiktok.com/@atomdevstudios", color: "hover:bg-slate-800 hover:border-slate-600" },
    { name: "Snapchat", url: "https://snapchat.com/t/IZEmBYzT", color: "hover:bg-yellow-500 hover:text-slate-900 hover:border-yellow-400" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6 transition-all duration-300">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white w-full max-w-3xl rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/80 shrink-0 rounded-t-3xl">
          <span className="text-xs font-bold tracking-widest text-cyan-400 uppercase">Developer & Studio Profile</span>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* 1. Profile Header & Quote */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <img 
              src="/sam.png" 
              alt="Samuel Peprah" 
              className="w-32 h-32 rounded-full border-2 border-cyan-500/50 object-cover shadow-lg shadow-cyan-500/20 shrink-0"
            />
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Samuel Peprah</h2>
                <p className="text-cyan-400 font-semibold text-sm mt-1">Founder & Lead Software Engineer, AtomDev Studios</p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full border border-blue-500/20">
                  <Code size={13} /> Full-Stack Dev
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/20">
                  <BookOpen size={13} /> University of Ghana
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <ShieldCheck size={13} /> UoPeople CS
                </span>
              </div>

              <div className="relative bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 mt-2">
                <Quote size={24} className="absolute text-slate-700 -top-2 -left-2" />
                <p className="text-sm text-slate-300 italic font-medium relative z-10 pl-2">
                  "Building innovative software solutions that bridge technology with real-world impact."
                </p>
              </div>
            </div>
          </div>

          {/* 2. About Samuel */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User size={18} className="text-cyan-400" /> About Samuel Peprah
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed space-y-4 bg-slate-800/30 p-5 rounded-2xl border border-slate-800">
              <p>
                Samuel Peprah is a software developer, web application developer, and Occupational Therapy student at the University of Ghana. Alongside his healthcare education, he is also studying Computer Science at the University of the People, combining knowledge from both fields to develop practical technology solutions.
              </p>
              <p>
                His interests span full-stack web development, software engineering, automation, artificial intelligence, cybersecurity, and health technology. He enjoys building scalable applications that solve real-world problems and continuously explores new technologies to improve his skills.
              </p>
              <p>
                Samuel has developed educational platforms, business management systems, attendance systems, healthcare applications, and AI-powered solutions. He is passionate about creating software that is modern, efficient, secure, and user-friendly.
              </p>
            </div>
          </div>

          {/* 3. About AtomDev Studios */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase size={18} className="text-blue-400" /> About AtomDev Studios
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed space-y-4 bg-blue-950/20 p-5 rounded-2xl border border-blue-900/30">
              <p>
                AtomDev Studios is the personal software development brand founded by Samuel Peprah. The studio specializes in designing and developing modern websites, web applications, business management systems, educational platforms, and custom software solutions for individuals, startups, schools, and organizations.
              </p>
              <p>
                The mission of AtomDev Studios is to transform ideas into reliable, scalable, and innovative digital products that solve real-world problems while delivering exceptional user experiences.
              </p>
            </div>
          </div>

          {/* 4. Expertise & Technologies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Expertise */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" /> Areas of Expertise
              </h3>
              <ul className="space-y-2 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                {expertise.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-emerald-400 mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Terminal size={16} className="text-purple-400" /> Technologies
              </h3>
              <div className="flex flex-wrap gap-2 bg-slate-800/30 p-4 rounded-2xl border border-slate-800">
                {technologies.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="bg-slate-700/50 border border-slate-600 text-slate-200 px-2.5 py-1 rounded-md text-xs font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* 5. Footer / Social Links */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/80 shrink-0 rounded-b-3xl">
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider text-center sm:text-left">
            Connect
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            {socialLinks.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer" 
                className={`flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-all duration-300 ${link.color}`}
              >
                {link.name} <ExternalLink size={12} className="opacity-70" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}