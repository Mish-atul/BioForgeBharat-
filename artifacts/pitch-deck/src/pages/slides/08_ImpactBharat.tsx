const base = import.meta.env.BASE_URL;

export default function ImpactBharat() {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-bg text-text font-body">
      <img
        src={`${base}india-network.png`}
        crossOrigin="anonymous"
        alt="India network visualization"
        className="absolute inset-0 w-full h-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-bg via-bg/70 to-bg/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-transparent to-bg" />

      <div className="absolute top-[7vh] left-[6vw] right-[6vw] flex items-center justify-between font-mono text-[1.1vw] tracking-widest uppercase">
        <span className="text-primary">04 · Impact for Bharat</span>
        <span className="text-muted">Why this matters now</span>
      </div>

      <div className="absolute right-[6vw] top-[20vh] max-w-[55vw]">
        <h2 className="font-display font-bold text-[5.4vw] leading-[0.98] tracking-tighter text-text text-balance text-right">
          A sovereign stack for energy, materials, and pharma.
        </h2>
      </div>

      <div className="absolute left-[6vw] right-[6vw] bottom-[10vh] grid grid-cols-3 gap-[2vw]">
        <div className="border-l-2 border-primary pl-[1.5vw]">
          <div className="font-display font-bold text-[3.2vw] text-primary leading-none tracking-tight">
            Energy
          </div>
          <div className="mt-[2vh] font-body text-[1.3vw] text-text/85 leading-relaxed text-pretty">
            Domestic SAF and bio-jet catalysts cut crude dependence and meet the
            2030 blending mandate without imported IP.
          </div>
        </div>
        <div className="border-l-2 border-accent pl-[1.5vw]">
          <div className="font-display font-bold text-[3.2vw] text-accent leading-none tracking-tight">
            Materials
          </div>
          <div className="mt-[2vh] font-body text-[1.3vw] text-text/85 leading-relaxed text-pretty">
            Same loop discovers catalysts for green hydrogen, CO₂ utilization,
            and platform chemicals — built on Indian feedstocks.
          </div>
        </div>
        <div className="border-l-2 border-text pl-[1.5vw]">
          <div className="font-display font-bold text-[3.2vw] text-text leading-none tracking-tight">
            Pharma
          </div>
          <div className="mt-[2vh] font-body text-[1.3vw] text-text/85 leading-relaxed text-pretty">
            Engineered enzymes for API intermediates — turning India's bulk-drug
            sector into a high-margin biocatalysis hub.
          </div>
        </div>
      </div>

      <div className="absolute bottom-[3vh] left-[6vw] right-[6vw] flex justify-between font-mono text-[1vw] text-muted/70 uppercase tracking-widest">
        <span>CatalystAI · Hackathon Pitch</span>
        <span>08 / 10</span>
      </div>
    </div>
  );
}
