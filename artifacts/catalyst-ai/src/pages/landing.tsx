import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Link } from "wouter";
import { Dna, ArrowRight, Beaker, Leaf, Network, TestTube2, FlaskConical, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Framer Motion variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 50, filter: "blur(12px)", scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 0.8, type: "spring", bounce: 0.4 },
  }),
};

// --- Components ---
const GlassOrb = ({
  className,
  delay = 0,
  duration = 10,
  color = "bg-primary/20",
  size = "w-64 h-64",
}: {
  className?: string;
  delay?: number;
  duration?: number;
  color?: string;
  size?: string;
}) => (
  <motion.div
    className={cn(
      "absolute rounded-full blur-[100px] pointer-events-none mix-blend-screen",
      color,
      size,
      className
    )}
    animate={{
      x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
      y: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
      scale: [1, 1.3, 0.8, 1],
      rotate: [0, 90, -90, 0]
    }}
    transition={{
      duration,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
      delay,
    }}
  />
);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const yHero = useTransform(smoothProgress, [0, 1], ["0%", "60%"]);
  const opacityHero = useTransform(smoothProgress, [0, 0.5], [1, 0]);
  const scaleHero = useTransform(smoothProgress, [0, 0.5], [1, 0.85]);

  return (
    <div
      ref={containerRef}
      className="min-h-[100dvh] bg-[#020005] text-white selection:bg-fuchsia-500/40 selection:text-white overflow-hidden font-sans"
    >
      {/* 3D Z-Axis Ambient Chaotic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_0%,#020005_100%)] z-10" />
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        
        {/* Chaotic Glowing Orbs */}
        <GlassOrb color="bg-fuchsia-600/30" size="w-[50vw] h-[50vw]" className="-top-[10%] -left-[10%]" duration={8} />
        <GlassOrb color="bg-orange-500/25" size="w-[40vw] h-[40vw]" className="top-[30%] -right-[10%]" delay={1} duration={7} />
        <GlassOrb color="bg-blue-600/30" size="w-[60vw] h-[60vw]" className="-bottom-[20%] left-[20%]" delay={2} duration={9} />
        <GlassOrb color="bg-yellow-400/20" size="w-[45vw] h-[45vw]" className="top-[10%] right-[30%]" delay={3} duration={11} />
        <GlassOrb color="bg-rose-600/25" size="w-[30vw] h-[30vw]" className="bottom-[10%] right-[40%]" delay={1.5} duration={6} />
      </div>

      {/* Fluid Island Navigation */}
      <motion.header
        initial={{ y: -100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1, type: "spring", bounce: 0.5 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] md:w-max"
      >
        <div className="flex items-center justify-between gap-12 px-6 py-3 rounded-full bg-white/5 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_rgba(255,0,128,0.15)] hover:shadow-[0_8px_40px_rgba(255,0,128,0.25)] transition-shadow duration-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-400 via-rose-500 to-orange-500 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                <Dna className="w-4 h-4 text-fuchsia-400" />
              </div>
            </div>
            <span className="text-sm font-bold tracking-wide text-white">BioForgeBharat</span>
          </div>
          <Link href="/dashboard">
            <button className="group relative px-5 py-2 text-xs font-bold tracking-widest uppercase rounded-full bg-white text-black overflow-hidden active:scale-[0.95] transition-all duration-300 ease-out hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              <span className="relative z-10 flex items-center gap-2">
                Access Platform
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-400 to-orange-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" />
            </button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.main
        style={{ y: yHero, opacity: opacityHero, scale: scaleHero }}
        className="relative z-10 pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center"
      >
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp as any}
          className="mb-8 rounded-full px-5 py-2 text-[11px] uppercase tracking-[0.2em] font-bold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30 backdrop-blur-md flex items-center gap-3 shadow-[0_0_32px_rgba(217,70,239,0.2)]"
        >
          <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
          Autonomous Molecular Discovery
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp as any}
          className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter leading-[1.05] max-w-6xl mx-auto drop-shadow-2xl"
        >
          Synthesize the <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-rose-500 to-orange-500 animate-[gradient_4s_ease_infinite] bg-[length:200%_auto]">
            Molecules of Tomorrow.
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp as any}
          className="mt-8 text-lg md:text-2xl text-white/70 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow-md"
        >
          BioForgeBharat uses intelligent AI agents to accelerate sustainable fuels,
          catalyst engineering, and synthetic biology. Replacing trial-and-error with predictive intelligence.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp as any}
          className="mt-14 flex flex-col sm:flex-row items-center gap-6"
        >
          <Link href="/dashboard">
            <button className="group flex items-center gap-4 bg-gradient-to-r from-fuchsia-600 to-orange-500 text-white px-2 pl-8 py-2 rounded-full font-bold text-xl active:scale-[0.95] transition-all duration-300 shadow-[0_0_40px_rgba(217,70,239,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)]">
              Initialize Agent
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:translate-x-2 group-hover:scale-110 group-hover:-translate-y-[2px] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <ArrowRight className="w-6 h-6" />
              </div>
            </button>
          </Link>
        </motion.div>
      </motion.main>

      {/* Feature Bento Grid (Double Bezel Architecture) */}
      <section className="relative z-20 px-4 md:px-8 py-24 md:py-40 bg-[#030005] border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 text-center md:text-left">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight">
              Architecting the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">post-carbon economy.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Main Feature - Large Col */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="col-span-1 md:col-span-8 p-2 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] group hover:bg-white/[0.06] transition-colors duration-500"
            >
              <div className="h-full w-full rounded-[calc(2.5rem-0.5rem)] bg-[#080310] border border-white/10 p-8 md:p-12 relative overflow-hidden flex flex-col justify-end min-h-[450px]">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-fuchsia-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -top-32 -left-32 w-64 h-64 bg-fuchsia-500/30 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(217,70,239,0.3)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                    <FlaskConical className="w-8 h-8 text-fuchsia-400" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-bold mb-4 text-white">Chemical Catalysis</h3>
                  <p className="text-white/70 text-lg md:text-xl max-w-lg leading-relaxed">
                    AI-driven discovery for sustainable reactions. Turn CO₂ and green H₂ into viable methanol with unprecedented accuracy.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Side Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.3 }}
              className="col-span-1 md:col-span-4 p-2 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] group hover:bg-white/[0.06] transition-colors duration-500"
            >
              <div className="h-full w-full rounded-[calc(2.5rem-0.5rem)] bg-[#080310] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-end min-h-[450px]">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/30 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                    <Dna className="w-7 h-7 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Synthetic Biology</h3>
                  <p className="text-white/70 text-lg leading-relaxed">
                    Enzyme engineering and metabolic pathway design for next-gen biofuel conversion.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Side Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.3 }}
              className="col-span-1 md:col-span-4 p-2 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] group hover:bg-white/[0.06] transition-colors duration-500"
            >
              <div className="h-full w-full rounded-[calc(2.5rem-0.5rem)] bg-[#080310] border border-white/10 p-8 relative overflow-hidden flex flex-col justify-end min-h-[350px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/20 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                    <Network className="w-7 h-7 text-orange-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">Continuous Feedback</h3>
                  <p className="text-white/70 text-lg leading-relaxed">
                    Models retrain dynamically from experimental pipeline flows.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Bottom Wide Feature */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, type: "spring", bounce: 0.3 }}
              className="col-span-1 md:col-span-8 p-2 rounded-[2.5rem] bg-white/[0.04] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] group hover:bg-white/[0.06] transition-colors duration-500"
            >
              <div className="h-full w-full rounded-[calc(2.5rem-0.5rem)] bg-[#080310] border border-white/10 p-8 md:p-12 relative overflow-hidden flex items-center min-h-[350px]">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 blur-[100px] rounded-full group-hover:scale-125 group-hover:bg-blue-500/30 transition-all duration-1000" />
                <div className="relative z-10 max-w-xl">
                  <h3 className="text-3xl md:text-5xl font-bold mb-6 text-white">Predictive Intelligence</h3>
                  <p className="text-white/70 text-xl leading-relaxed">
                    Minimize lab time by simulating molecular interactions in a robust, agentic sandbox environment.
                  </p>
                  <div className="mt-10 inline-flex items-center gap-4 text-lg font-bold text-blue-400 cursor-pointer group-hover:text-blue-300 transition-colors bg-blue-500/10 px-6 py-3 rounded-full border border-blue-500/20">
                    Explore algorithms <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-500 ease-out" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-white/40 text-sm border-t border-white/10 bg-[#030005]">
        <p className="flex items-center justify-center gap-2 font-medium">
          Engineered for <span className="text-fuchsia-500 font-bold">GPS Renewables OpenEnv Hackathon 2026</span>
        </p>
      </footer>
    </div>
  );
}
