import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] bg-[#0F0C29] text-white flex items-center justify-center font-sans relative overflow-hidden">
      {/* Chaotic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay z-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-rose-600/30 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        className="relative z-10 w-full max-w-lg p-2 rounded-[3rem] bg-white/[0.04] border border-white/10 shadow-[0_0_50px_rgba(225,29,72,0.15)] mx-4"
      >
        <div className="rounded-[calc(3rem-0.5rem)] bg-[#080310]/90 backdrop-blur-3xl border border-white/10 p-10 md:p-14 text-center flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(225,29,72,0.3)]">
            <AlertTriangle className="w-10 h-10 text-rose-400" />
          </div>
          
          <h1 className="text-6xl font-serif font-black text-white mb-4 drop-shadow-md">404</h1>
          <h2 className="text-xl font-bold text-white/80 uppercase tracking-widest mb-4">Anomaly Detected</h2>
          
          <p className="text-white/50 font-medium leading-relaxed mb-10">
            The requested pathway or structural coordinate does not exist in our molecular registry.
          </p>

          <Link href="/">
            <Button className="w-full bg-gradient-to-r from-rose-600 to-fuchsia-500 text-white rounded-full py-6 font-bold shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Control Center
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
