const base = import.meta.env.BASE_URL;

export default function SyntheticBiology() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <img
        src={`${base}biorefinery.png`}
        crossOrigin="anonymous"
        alt="Industrial biorefinery facility at twilight"
        className="absolute inset-0 w-full h-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/70 to-bg/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/40" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between font-mono text-[1.1vw] tracking-widest uppercase">
        <span className="text-accent">Direction 02</span>
        <span className="text-muted">Synthetic Biology</span>
      </div>

      <div className="absolute left-[6vw] bottom-[10vh] max-w-[58vw]">
        <h2 className="font-display font-bold text-[6.5vw] leading-[0.95] tracking-tighter text-text text-balance">
          Engineered enzymes for India's biorefineries.
        </h2>
        <p className="mt-[3vh] font-body text-[1.6vw] leading-relaxed text-text/85 max-w-[48vw] text-pretty">
          We rank engineered strains and enzyme variants for ethanol production,
          biomass fermentation, and bio-based chemicals — predicting yield,
          selectivity, and stability before a single fermenter is loaded.
        </p>

        <div className="mt-[5vh] grid grid-cols-3 gap-[2vw] max-w-[58vw]">
          <div>
            <div className="font-display font-bold text-[3.4vw] text-accent leading-none tracking-tight">
              S. cerevisiae
            </div>
            <div className="mt-[1vh] font-mono text-[1vw] text-muted uppercase tracking-widest">
              Ethanol fermentation
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-[3.4vw] text-accent leading-none tracking-tight">
              Z. mobilis
            </div>
            <div className="mt-[1vh] font-mono text-[1vw] text-muted uppercase tracking-widest">
              High-rate strain candidate
            </div>
          </div>
          <div>
            <div className="font-display font-bold text-[3.4vw] text-accent leading-none tracking-tight">
              C5 / C6
            </div>
            <div className="mt-[1vh] font-mono text-[1vw] text-muted uppercase tracking-widest">
              Mixed-sugar biomass
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] flex justify-between font-mono text-[1vw] text-muted/70 uppercase tracking-widest">
        <span>CatalystAI · Hackathon Pitch</span>
        <span>05 / 10</span>
      </div>
    </div>
  );
}
