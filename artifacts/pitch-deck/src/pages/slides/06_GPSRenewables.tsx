export default function GPSRenewables() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(0,230,115,0.10),transparent_55%)]" />
      <div className="absolute top-0 left-0 w-full h-px bg-border-line" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[1.1vw] tracking-widest text-accent uppercase mb-[2vh]">
            Pilot Case Study
          </div>
          <h2 className="font-display font-bold text-[4.6vw] leading-[1.0] tracking-tight text-text text-balance">
            GPS Renewables · Ethanol-to-Jet Fuel
          </h2>
        </div>
        <div className="font-mono text-[1.1vw] text-muted uppercase tracking-widest">
          Bengaluru · India
        </div>
      </div>

      <div className="absolute left-[6vw] right-[6vw] top-[35vh] grid grid-cols-12 gap-[2vw]">
        <div className="col-span-7 flex flex-col gap-[3vh]">
          <p className="font-body text-[1.55vw] leading-relaxed text-text/85 text-pretty">
            India's first SAF pioneer needed a faster way to screen catalyst
            families for a domestic ethanol-to-jet pathway. We loaded their
            three target reactions and ran the full discovery loop end-to-end.
          </p>

          <div className="grid grid-cols-2 gap-[1.5vw]">
            <div className="border border-border-line bg-bg-2/60 p-[1.8vw]">
              <div className="font-mono text-[0.95vw] tracking-widest text-muted uppercase">
                Reactions modeled
              </div>
              <div className="mt-[1vh] font-display font-medium text-[1.4vw] text-text leading-tight">
                Ethanol-to-Jet · CO₂ hydrogenation · Biomass fermentation
              </div>
            </div>
            <div className="border border-border-line bg-bg-2/60 p-[1.8vw]">
              <div className="font-mono text-[0.95vw] tracking-widest text-muted uppercase">
                Top-ranked candidate
              </div>
              <div className="mt-[1vh] font-display font-bold text-[2vw] text-primary leading-tight">
                HZSM-5 zeolite
              </div>
              <div className="font-mono text-[1vw] text-muted">predicted activity 0.91</div>
            </div>
          </div>
        </div>

        <div className="col-span-5 flex flex-col justify-between gap-[2vh]">
          <div>
            <div className="font-mono text-[1vw] tracking-widest text-muted uppercase">
              Cycle compression
            </div>
            <div className="font-display font-bold text-[7.5vw] leading-none text-accent tracking-tighter">
              18 mo
            </div>
            <div className="font-body text-[1.3vw] text-text/80 mt-[1vh] text-pretty">
              vs. 5–10 years on the legacy paper workflow — based on screening
              cycles compressed by AI ranking and discrepancy analysis.
            </div>
          </div>
          <div className="flex items-center gap-[2vw] border-t border-border-line pt-[2vh]">
            <div>
              <div className="font-display font-bold text-[2.6vw] text-text leading-none tracking-tight">
                6
              </div>
              <div className="font-mono text-[0.9vw] text-muted uppercase tracking-widest">
                candidates ranked
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-[2.6vw] text-text leading-none tracking-tight">
                6
              </div>
              <div className="font-mono text-[0.9vw] text-muted uppercase tracking-widest">
                wet-lab logs
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-[2.6vw] text-text leading-none tracking-tight">
                +14%
              </div>
              <div className="font-mono text-[0.9vw] text-muted uppercase tracking-widest">
                accuracy after retrain
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] flex justify-between font-mono text-[1vw] text-muted/70 uppercase tracking-widest">
        <span>CatalystAI · Hackathon Pitch</span>
        <span>06 / 10</span>
      </div>
    </div>
  );
}
