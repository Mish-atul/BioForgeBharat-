import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Hexagon, Component, Atom } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Custom Components ---

// A chemical bond/lattice abstract shape
const ChemicalLattice = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full text-white/5 overflow-visible" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
    <motion.path 
      d="M200 50 L350 125 L350 275 L200 350 L50 275 L50 125 Z" 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
    />
    <motion.path 
      d="M200 50 L200 200 M50 125 L200 200 M350 125 L200 200 M50 275 L200 200 M350 275 L200 200 M200 350 L200 200" 
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.5 }}
      transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "mirror", delay: 1 }}
    />
    <circle cx="200" cy="50" r="4" fill="currentColor" />
    <circle cx="350" cy="125" r="4" fill="currentColor" />
    <circle cx="350" cy="275" r="4" fill="currentColor" />
    <circle cx="200" cy="350" r="4" fill="currentColor" />
    <circle cx="50" cy="275" r="4" fill="currentColor" />
    <circle cx="50" cy="125" r="4" fill="currentColor" />
    <circle cx="200" cy="200" r="6" fill="currentColor" />
  </svg>
);

const fadeUp = {
  hidden: { opacity: 0, y: 60, filter: "blur(20px)", scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { delay: i * 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 40, damping: 20 });
  const yHeroText = useTransform(smoothProgress, [0, 1], ["0%", "80%"]);
  const yHeroVisual = useTransform(smoothProgress, [0, 1], ["0%", "40%"]);
  const opacityHero = useTransform(smoothProgress, [0, 0.6], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] bg-[#110F1A] text-[#F8F9FA] selection:bg-fuchsia-500/40 selection:text-white overflow-hidden font-sans"
    >
      {/* Cinematic Deep Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#2A2045_0%,#110F1A_100%)] z-10" />
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
      </div>

      {/* Floating Minimalist Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-8 left-8 right-8 z-50 flex items-center justify-between pointer-events-none"
      >
        <div className="flex items-center gap-3 pointer-events-auto">
          <Atom className="w-8 h-8 text-fuchsia-400" />
          <span className="text-xl font-serif font-black tracking-tight text-white drop-shadow-md">BioForgeBharat</span>
        </div>
        <div className="pointer-events-auto">
          <Link href="/dashboard">
            <button className="group relative px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 text-white font-bold tracking-widest text-xs uppercase overflow-hidden hover:bg-white/10 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <span className="relative z-10 flex items-center gap-3">
                Open Sandbox
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section - Asymmetrical & Futuristic */}
      <section className="relative z-10 min-h-screen pt-32 pb-20 px-6 md:px-12 flex flex-col justify-center max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
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
              className="mb-8 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-indigo-300">Phase 3 Trials Active</span>
            </motion.div>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp as any}
              className="text-6xl md:text-8xl lg:text-[7rem] font-serif font-black tracking-tighter leading-[0.95] drop-shadow-2xl text-white"
            >
              Design the <br />
              <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-cyan-400">impossible.</span>
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp as any}
              className="mt-8 text-xl md:text-2xl text-white/60 font-sans font-medium leading-relaxed max-w-2xl"
            >
              Move beyond trial-and-error. BioForgeBharat engineers autonomous agents to architect sustainable fuels and novel catalysts at computational speeds.
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp as any}
              className="mt-12 flex items-center gap-6"
            >
              <Link href="/dashboard">
                <button className="group relative flex items-center gap-4 bg-white text-[#110F1A] px-2 pl-8 py-2 rounded-full font-bold text-lg active:scale-[0.98] transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]">
                  Launch Environment
                  <div className="w-12 h-12 rounded-full bg-[#110F1A]/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#110F1A]/20 transition-colors">
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Abstract Visual */}
          <motion.div 
            style={{ y: yHeroVisual, opacity: opacityHero }}
            className="lg:col-span-5 relative h-[600px] w-full flex items-center justify-center pointer-events-none"
          >
            {/* Holographic Glowing Orbs */}
            <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-[400px] h-[400px] bg-fuchsia-600/30 rounded-full blur-[100px] mix-blend-screen" />
            <motion.div animate={{ rotate: -360, scale: [1, 1.3, 1] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute w-[350px] h-[350px] bg-cyan-500/30 rounded-full blur-[90px] mix-blend-screen translate-x-20 translate-y-20" />
            
            {/* The Lattice */}
            <div className="absolute inset-0 z-10 scale-125">
              <ChemicalLattice />
            </div>

            {/* Floating Glass Panels */}
            <motion.div 
              animate={{ y: [0, -20, 0] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
              className="absolute z-20 top-20 right-0 w-64 h-32 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <Hexagon className="w-6 h-6 text-fuchsia-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">Binding Energy</span>
              </div>
              <div className="text-2xl font-mono font-bold text-white">-43.2 kcal/mol</div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 30, 0] }} 
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }} 
              className="absolute z-20 bottom-10 left-10 w-56 h-40 bg-white/5 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-2xl p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center">
                <Component className="w-6 h-6 text-cyan-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/50">PDC1 Expression</span>
              </div>
              <div className="text-3xl font-mono font-bold text-cyan-400">+31%</div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[85%] h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </div>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Asymmetric Capabilities Grid */}
      <section className="relative z-20 px-6 md:px-12 py-32 border-t border-white/10 bg-[#0F0C29]">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
            
            {/* Header Block - spans 8 cols */}
            <div className="md:col-span-8 flex flex-col justify-center px-4 md:px-12">
              <h2 className="text-4xl md:text-6xl font-serif font-black tracking-tight leading-[1.1]">
                Convergence of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400">biology & computation.</span>
              </h2>
            </div>

            {/* Block 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
              className="md:col-span-4 md:row-span-2 rounded-[3rem] bg-white/[0.03] border border-white/10 p-10 relative overflow-hidden group hover:bg-white/[0.05] transition-colors"
            >
              <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-[radial-gradient(circle_at_top_right,rgba(217,70,239,0.15),transparent_50%)] pointer-events-none" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/30 flex items-center justify-center mb-auto group-hover:scale-110 transition-transform duration-500">
                  <Atom className="w-7 h-7 text-fuchsia-400" />
                </div>
                <div className="mt-8">
                  <h3 className="text-3xl font-bold font-serif mb-4 text-white">Generative Chemistry</h3>
                  <p className="text-white/60 font-medium text-lg leading-relaxed">Agentic frameworks exploring unmapped chemical space for CO₂ reduction.</p>
                </div>
              </div>
            </motion.div>

            {/* Block 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1 }}
              className="md:col-span-8 rounded-[3rem] bg-gradient-to-br from-blue-900/40 to-[#0F0C29] border border-white/10 p-10 relative overflow-hidden flex items-end group"
            >
              <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
              <div className="relative z-10 w-full flex justify-between items-end">
                <div className="max-w-xl">
                  <h3 className="text-3xl font-bold font-serif mb-4 text-white">Pathway Architecture</h3>
                  <p className="text-white/60 font-medium text-lg leading-relaxed">Designing complex enzyme cascades using LLMs fine-tuned on metabolic databases.</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform cursor-pointer">
                  <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10 bg-[#0A0815] text-center">
        <p className="text-white/40 font-mono text-sm tracking-widest uppercase font-bold">
          Engineered for <span className="text-white/80">GPS Renewables OpenEnv Hackathon 2026</span>
        </p>
      </footer>
    </div>
  );
}
