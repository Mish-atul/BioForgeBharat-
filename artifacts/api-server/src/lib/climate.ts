export function estimateCO2AvoidedPerTonne(
  candidateType: string,
  targetProduct: string,
  predictedActivity: number,
  sustainabilityScore: number
): number {
  const baseValues: Record<string, number> = {
    "Compressed Biogas (CBG)": 180,
    "Bio-CNG": 165,
    "2G Ethanol": 140,
    "Sustainable Aviation Fuel (C₈–C₁₆)": 95,
    "Green Methanol": 110,
    "default": 100
  };
  
  const base = baseValues[targetProduct] ?? baseValues["default"];
  const scaled = base * predictedActivity * (0.7 + 0.3 * sustainabilityScore);
  return Math.round(scaled * 10) / 10;
}

export function assignSDGTags(targetProduct: string, domain: string): string[] {
  const tags: string[] = ["SDG 13"];
  if (["CBG", "Bio-CNG", "2G Ethanol", "Sustainable Aviation Fuel", "Green Methanol"].some(p => targetProduct.includes(p))) {
    tags.push("SDG 7");
  }
  if (domain === "synthetic-biology") {
    tags.push("SDG 12");
  }
  return tags;
}
