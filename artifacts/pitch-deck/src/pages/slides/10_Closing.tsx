export default function Closing() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,204,204,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,230,115,0.08),transparent_60%)]" />

      <div className="absolute top-[6vh] left-[6vw] right-[6vw] flex items-center justify-between font-mono text-[1.1vw] tracking-widest text-muted uppercase">
        <span>CatalystAI</span>
        <span className="text-primary">Thank you</span>
      </div>

      <div className="relative h-full flex flex-col items-start justify-center pl-[10vw] pr-[10vw]">
        <div className="font-mono text-[1.1vw] tracking-widest text-primary uppercase mb-[2vh]">
          Built for AI for Bharat · 2026
        </div>
        <h1 className="font-display font-bold text-[8vw] leading-[0.9] tracking-tighter text-text">
          Discover faster.
        </h1>
        <h1 className="font-display font-bold text-[8vw] leading-[0.9] tracking-tighter text-primary">
          Build sovereign.
        </h1>
        <p className="mt-[3vh] font-body text-[1.5vw] leading-relaxed text-text/80 max-w-[60vw] text-pretty">
          A discovery loop for the molecules India needs next — from
          ethanol-to-jet fuel today to green hydrogen, CO₂ utilization, and
          biocatalysis tomorrow.
        </p>

        <div className="mt-[5vh] w-full max-w-[80vw] border border-border-line/60 rounded-[2px] p-[2.2vh_2vw] bg-bg-2/40 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-[1.5vh]">
            <div className="font-mono text-[0.95vw] tracking-widest text-accent uppercase">
              The Team
            </div>
            <div className="font-mono text-[0.85vw] tracking-widest text-muted uppercase">
              IIT founders · industry pilot
            </div>
          </div>
          <div className="grid grid-cols-4 gap-[1.5vw]">
            <div>
              <div className="font-display font-bold text-[1.4vw] text-text leading-tight">
                Aarav Sharma
              </div>
              <div className="font-mono text-[0.8vw] text-muted uppercase tracking-widest mt-[0.4vh]">
                AI lead · IIT Bombay
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-[1.4vw] text-text leading-tight">
                Priya Iyer
              </div>
              <div className="font-mono text-[0.8vw] text-muted uppercase tracking-widest mt-[0.4vh]">
                Cheminformatics · IISc
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-[1.4vw] text-text leading-tight">
                Rohan Patel
              </div>
              <div className="font-mono text-[0.8vw] text-muted uppercase tracking-widest mt-[0.4vh]">
                Synth bio · IIT Madras
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-[1.4vw] text-text leading-tight">
                Meera Krishnan
              </div>
              <div className="font-mono text-[0.8vw] text-muted uppercase tracking-widest mt-[0.4vh]">
                Product · ex-GPS Renewables
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] grid grid-cols-3 gap-[2vw] font-mono text-[1vw] tracking-widest uppercase">
        <div>
          <div className="text-muted">Pilot partner</div>
          <div className="text-text mt-[0.5vh]">GPS Renewables</div>
        </div>
        <div>
          <div className="text-muted">Hackathon</div>
          <div className="text-text mt-[0.5vh]">Govt. of Karnataka × Pan IIT</div>
        </div>
        <div className="text-right">
          <div className="text-muted">Reach us</div>
          <div className="text-accent mt-[0.5vh]">team@catalystai.in</div>
        </div>
      </div>
    </div>
  );
}
