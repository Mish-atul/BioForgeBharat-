export default function Roadmap() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,204,204,0.08),transparent_55%)]" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw]">
        <div className="font-mono text-[1.1vw] tracking-widest text-primary uppercase mb-[2vh]">
          05 · Roadmap
        </div>
        <h2 className="font-display font-bold text-[4.6vw] leading-[1.0] tracking-tight text-text max-w-[68vw] text-balance">
          From hackathon pilot to national platform.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[42vh]">
        <div className="relative h-[2px] bg-border-line">
          <div className="absolute top-0 left-0 w-1/3 h-[2px] bg-primary" />
          <div className="absolute top-[-7px] left-0 w-[14px] h-[14px] rounded-full bg-primary" />
          <div className="absolute top-[-7px] left-1/2 w-[14px] h-[14px] rounded-full bg-accent -translate-x-1/2" />
          <div className="absolute top-[-7px] right-0 w-[14px] h-[14px] rounded-full bg-text" />
        </div>

        <div className="grid grid-cols-3 gap-[3vw] mt-[6vh]">
          <div className="flex flex-col gap-[2vh]">
            <div className="font-mono text-[1vw] tracking-widest text-primary uppercase">
              Phase 01 · Now
            </div>
            <div className="font-display font-bold text-[2.8vw] text-text leading-tight tracking-tight">
              GPS Renewables pilot
            </div>
            <ul className="font-body text-[1.3vw] text-muted leading-relaxed space-y-[0.8vh]">
              <li>· Ethanol-to-jet candidate library shipped</li>
              <li>· Wet-lab feedback loop in production</li>
              <li>· First retraining run logged</li>
            </ul>
          </div>

          <div className="flex flex-col gap-[2vh]">
            <div className="font-mono text-[1vw] tracking-widest text-accent uppercase">
              Phase 02 · 6 months
            </div>
            <div className="font-display font-bold text-[2.8vw] text-text leading-tight tracking-tight">
              Multi-lab rollout
            </div>
            <ul className="font-body text-[1.3vw] text-muted leading-relaxed space-y-[0.8vh]">
              <li>· Onboard 5 IIT and CSIR partner labs</li>
              <li>· Add green-hydrogen and CO₂ reactions</li>
              <li>· Public benchmark on Indian feedstocks</li>
            </ul>
          </div>

          <div className="flex flex-col gap-[2vh]">
            <div className="font-mono text-[1vw] tracking-widest text-text uppercase">
              Phase 03 · 18 months
            </div>
            <div className="font-display font-bold text-[2.8vw] text-text leading-tight tracking-tight">
              National discovery layer
            </div>
            <ul className="font-body text-[1.3vw] text-muted leading-relaxed space-y-[0.8vh]">
              <li>· Open API for industry and academia</li>
              <li>· Sovereign cheminformatics index</li>
              <li>· Pharma and materials verticals live</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] flex justify-between font-mono text-[1vw] text-muted/70 uppercase tracking-widest">
        <span>CatalystAI · Hackathon Pitch</span>
        <span>09 / 10</span>
      </div>
    </div>
  );
}
