import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Hexagon, Component, Atom, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Custom Components ---

// Indian Flag / Abstract Molecule Animation for Footer
const FlagMoleculeAnimation = () => (
  <svg viewBox="0 0 400 400" className="w-64 h-64 opacity-80 mix-blend-multiply" fill="none" strokeWidth="2" strokeLinejoin="round">
    <defs>
      <filter id="soft-glow">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Saffron Path */}
    <motion.path 
      d="M 100 150 C 200 50, 300 250, 400 150" 
      stroke="#FF9933" 
      strokeWidth="4"
      filter="url(#soft-glow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.9 }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
    />
    {/* White/Ashoka Chakra Path */}
    <motion.path 
      d="M 50 200 C 150 100, 250 300, 350 200" 
      stroke="#000080" 
      strokeWidth="2"
      strokeDasharray="4 4"
      filter="url(#soft-glow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
    />
    {/* Green Path */}
    <motion.path 
      d="M 100 250 C 200 150, 300 350, 400 250" 
      stroke="#138808" 
      strokeWidth="4"
      filter="url(#soft-glow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.9 }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1 }}
    />

    {/* Nodes mapping to the colors */}
    <motion.circle cx="200" cy="150" r="12" fill="#FF9933" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
    <motion.circle cx="200" cy="200" r="16" fill="#FFFFFF" stroke="#000080" strokeWidth="3" animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "200px 200px" }} />
    <motion.circle cx="200" cy="250" r="12" fill="#138808" animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
  </svg>
);

// High-end abstract chemical reaction animation
const AbstractReaction = () => (
  <svg viewBox="0 0 600 600" className="w-full h-full text-slate-900/10 overflow-visible mix-blend-multiply" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <defs>
      <filter id="ultra-glow">
        <feGaussianBlur stdDeviation="12" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Orbiting rings */}
    <motion.ellipse cx="300" cy="300" rx="250" ry="80" stroke="rgba(217,70,239,0.3)" strokeWidth="1" animate={{ rotateZ: 360, rotateX: 20 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />
    <motion.ellipse cx="300" cy="300" rx="250" ry="80" stroke="rgba(6,182,212,0.3)" strokeWidth="1" animate={{ rotateZ: -360, rotateY: 30 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />

    {/* Connecting bonds */}
    <motion.path 
      d="M 150 200 Q 300 100 450 200 T 300 500 T 150 200 Z" 
      stroke="rgba(249,115,22,0.6)" 
      strokeWidth="1.5"
      filter="url(#ultra-glow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
    />
    <motion.path 
      d="M 200 400 Q 300 200 400 400 T 300 100 T 200 400 Z" 
      stroke="rgba(6,182,212,0.6)" 
      strokeWidth="1.5"
      filter="url(#ultra-glow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.8 }}
      transition={{ duration: 8, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1 }}
    />

    {/* Nodes */}
    {[
      {x: 150, y: 200, c: "#d946ef"}, {x: 450, y: 200, c: "#06b6d4"}, 
      {x: 300, y: 500, c: "#f97316"}, {x: 300, y: 100, c: "#8b5cf6"},
      {x: 200, y: 400, c: "#06b6d4"}, {x: 400, y: 400, c: "#d946ef"}
    ].map((node, i) => (
      <motion.g key={i} animate={{ x: [0, Math.random()*20-10, 0], y: [0, Math.random()*20-10, 0] }} transition={{ duration: 4+i, repeat: Infinity, ease: "easeInOut" }}>
        <circle cx={node.x} cy={node.y} r="14" fill={node.c} opacity="0.4" filter="url(#ultra-glow)" />
        <circle cx={node.x} cy={node.y} r="5" fill="#1A1528" />
      </motion.g>
    ))}
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 80, filter: "blur(20px)", scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { delay: i * 0.15, duration: 1.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

// Animated Letter Component
const AnimatedTitle = ({ text, className }: { text: string; className: string }) => {
  const letters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.2 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.8,
      rotateX: 90,
      filter: "blur(10px)",
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
  };

  return (
    <motion.span
      className={cn("inline-block", className)}
      variants={container as any}
      initial="hidden"
      animate="visible"
      custom={1}
    >
      {letters.map((letter, index) => (
        <motion.span
          variants={child as any}
          key={index}
          className="inline-block"
          style={{ whiteSpace: letter === " " ? "pre" : "normal" }}
          whileHover={{ 
            scale: 1.2, 
            color: "#d946ef", 
            textShadow: "0 0 20px rgba(217,70,239,0.8)",
            transition: { duration: 0.2 } 
          }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });
  const yHeroText = useTransform(smoothProgress, [0, 1], ["0%", "80%"]);
  const yHeroVisual = useTransform(smoothProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(smoothProgress, [0, 0.5], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] bg-[#F3F4F6] text-slate-900 selection:bg-purple-500/30 selection:text-purple-900 overflow-hidden font-sans"
    >
      {/* Light Glassmorphism Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#E5E0FF_0%,#F3F4F6_80%)] z-10" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Massive organic slow-moving gradients */}
        <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -top-[20%] -left-[20%] w-[80vw] h-[80vw] bg-purple-400/20 blur-[150px] mix-blend-multiply rounded-[40%_60%_70%_30%/40%_50%_60%_50%]" />
        <motion.div animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-rose-400/15 blur-[140px] mix-blend-multiply rounded-[60%_40%_30%_70%/60%_30%_70%_40%]" />
      </div>

      {/* Floating Minimalist Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-8 left-8 right-8 z-50 flex items-center justify-between pointer-events-none"
      >
        <div className="flex items-center gap-4 pointer-events-auto group cursor-pointer">
          <div className="w-12 h-12 rounded-[1rem_0.5rem_1rem_0.5rem] bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-[2px] shadow-[0_0_30px_rgba(99,102,241,0.2)] group-hover:scale-110 transition-transform duration-700 ease-[0.22,1,0.36,1]">
            <div className="w-full h-full rounded-[calc(1rem-2px)_calc(0.5rem-2px)_calc(1rem-2px)_calc(0.5rem-2px)] bg-white flex items-center justify-center">
              <Atom className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <span className="text-2xl font-serif font-black tracking-tight text-slate-900 drop-shadow-sm">BioForgeBharat</span>
        </div>
        <div className="pointer-events-auto">
          <Link href="/dashboard">
            <button className="group relative px-8 py-4 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] bg-white/60 backdrop-blur-3xl border border-white/80 text-slate-900 font-black tracking-[0.2em] text-xs uppercase overflow-hidden hover:bg-white/80 transition-colors shadow-[0_10px_30px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)] active:scale-[0.98]">
              <span className="relative z-10 flex items-center gap-4">
                Initialize Console
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]" />
            </button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section - Radical Asymmetry */}
      <section className="relative z-10 min-h-screen pt-40 pb-20 px-6 md:px-12 flex flex-col justify-center max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Text Content */}
          <motion.div 
            style={{ y: yHeroText, opacity: opacityHero }}
            className="lg:col-span-7 flex flex-col items-start text-left relative z-20"
          >
            <motion.div
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp as any}
              className="mb-10 inline-flex items-center gap-3 px-5 py-2 rounded-[1rem_0.5rem_1rem_0.5rem] bg-purple-500/10 border border-purple-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.1)]"
            >
              <Fingerprint className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-purple-800">Agentic Synthesis Core</span>
            </motion.div>

            <h1 className="text-7xl md:text-9xl lg:text-[9rem] font-serif font-black tracking-tighter leading-[0.9] drop-shadow-xl text-slate-900">
              <AnimatedTitle text="BioForgeBharat" className="block" />
              <br />
              <div className="relative inline-block mt-4">
                <AnimatedTitle text="Computational Alchemy." className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-orange-500" />
                {/* Slanted Underline */}
                <motion.div 
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left" }}
                  className="absolute -bottom-2 left-0 w-full h-4 bg-gradient-to-r from-indigo-400 to-rose-400 -rotate-2 -z-10 mix-blend-multiply opacity-40 rounded-full blur-[2px]"
                />
              </div>
            </h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp as any}
              className="mt-12 text-2xl md:text-3xl text-slate-600 font-sans font-medium leading-relaxed max-w-3xl"
            >
              Engineer the next generation of biocatalysts and synthetic pathways. BioForgeBharat replaces physical trial-and-error with hyper-dimensional agentic modeling.
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp as any}
              className="mt-16 flex items-center gap-6"
            >
              <Link href="/dashboard">
                <button className="group relative flex items-center gap-6 bg-slate-900 text-white px-3 pl-10 py-3 rounded-[2rem_1rem_2rem_1rem] font-black text-xl active:scale-[0.95] transition-all duration-500 ease-[0.22,1,0.36,1] shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
                  Launch Environment
                  <div className="w-14 h-14 rounded-[1.2rem_0.6rem_1.2rem_0.6rem] bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500 ease-[0.22,1,0.36,1]" />
                  </div>
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Abstract Cinematic Visual */}
          <motion.div 
            style={{ y: yHeroVisual, opacity: opacityHero }}
            className="lg:col-span-5 relative h-[700px] w-full flex items-center justify-center pointer-events-none"
          >
            {/* The Dynamic Lattice */}
            <div className="absolute inset-0 z-10 scale-125">
              <AbstractReaction />
            </div>

            {/* Asymmetric Floating Glass Panels */}
            <motion.div 
              animate={{ y: [0, -30, 0], rotate: [0, 2, 0] }} 
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} 
              className="absolute z-20 top-20 -right-10 w-72 h-40 bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[3rem_1rem_3rem_1rem] shadow-[0_30px_60px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)] p-8 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Hexagon className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">Binding Energy</span>
              </div>
              <div className="text-3xl font-mono font-black text-slate-900 drop-shadow-sm">-43.2 <span className="text-sm font-sans text-slate-500 font-bold">kcal/mol</span></div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 40, 0], rotate: [0, -3, 0] }} 
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
              className="absolute z-20 bottom-20 -left-10 w-80 h-48 bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[1rem_3rem_1rem_3rem] shadow-[0_30px_60px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)] p-8 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Component className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">PDC1 Expression</span>
              </div>
              <div className="text-5xl font-mono font-black text-cyan-600 drop-shadow-sm mb-4">+31%</div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden border border-white/40 shadow-inner">
                <div className="w-[85%] h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.4)] rounded-full" />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Asymmetric Capabilities Grid */}
      <section className="relative z-20 px-6 md:px-12 py-40 border-t border-black/5 bg-[#F3F4F6]">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 auto-rows-[350px]">
            
            {/* Header Block - spans 8 cols */}
            <div className="md:col-span-8 flex flex-col justify-center px-4 md:px-12">
              <h2 className="text-5xl md:text-7xl font-serif font-black tracking-tight leading-[1.05] text-slate-900">
                Convergence of <br />
                <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">biology & computation.</span>
              </h2>
            </div>

            {/* Block 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 60, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-4 md:row-span-2 rounded-[3.5rem_1rem_3.5rem_1rem] bg-white/40 border border-white/80 p-12 relative overflow-hidden group hover:bg-white/60 transition-colors duration-700 shadow-[0_30px_80px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)]"
            >
              <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.08),transparent_60%)] pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-20 h-20 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-auto group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700 ease-[0.22,1,0.36,1] shadow-inner bg-white/60">
                  <Atom className="w-10 h-10 text-fuchsia-600" />
                </div>
                <div className="mt-12">
                  <h3 className="text-4xl font-black font-serif mb-6 text-slate-900 drop-shadow-sm">Generative Chemistry</h3>
                  <p className="text-slate-600 font-sans font-medium text-xl leading-relaxed">Agentic frameworks exploring unmapped chemical space for sustainable CO₂ reduction and biofuel synthesis.</p>
                </div>
              </div>
            </motion.div>

            {/* Block 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 60, scale: 0.95 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="md:col-span-8 rounded-[1rem_3.5rem_1rem_3.5rem] bg-gradient-to-br from-indigo-100 to-white/60 border border-white/80 p-12 relative overflow-hidden flex items-end group shadow-[0_30px_80px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,1)]"
            >
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-1000 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="max-w-2xl">
                  <h3 className="text-4xl font-black font-serif mb-6 text-slate-900 drop-shadow-sm">Pathway Architecture</h3>
                  <p className="text-slate-600 font-sans font-medium text-xl leading-relaxed">Designing complex enzyme cascades using large language models fine-tuned on profound metabolic databases.</p>
                </div>
                <div className="w-20 h-20 rounded-[1.5rem_0.5rem_1.5rem_0.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-[0_10px_30px_rgba(79,70,229,0.4)] group-hover:scale-110 group-hover:rotate-0 -rotate-45 transition-all duration-700 ease-[0.22,1,0.36,1] cursor-pointer">
                  <ArrowRight className="w-8 h-8" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative pt-24 pb-16 border-t border-black/5 bg-[#E5E0FF]/30 overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <FlagMoleculeAnimation />
        </div>
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="mb-8 w-16 h-16 rounded-[1rem_0.5rem_1rem_0.5rem] bg-gradient-to-br from-indigo-500 to-fuchsia-500 p-[2px] shadow-[0_10px_30px_rgba(99,102,241,0.2)]">
            <div className="w-full h-full rounded-[calc(1rem-2px)_calc(0.5rem-2px)_calc(1rem-2px)_calc(0.5rem-2px)] bg-white flex items-center justify-center">
              <Atom className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <h4 className="text-2xl font-serif font-black text-slate-900 mb-4">BioForgeBharat</h4>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-10">
            Pioneering the future of molecular discovery through artificial intelligence and computational chemistry.
          </p>
          <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Registry API</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Open Source</a>
          </div>
          <div className="w-full h-px bg-black/5 my-10 max-w-4xl mx-auto" />
          <p className="text-slate-400 font-mono text-xs tracking-[0.2em] uppercase font-bold">
            Engineered for <span className="text-fuchsia-600 font-black">GPS Renewables OpenEnv Hackathon 2026</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
