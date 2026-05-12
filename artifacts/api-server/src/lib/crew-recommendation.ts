import { jsonrepair } from "jsonrepair";
import type { Candidate, Reaction } from "@workspace/db";

const GROQ_CHAT_COMPLETIONS = "https://api.groq.com/openai/v1/chat/completions";

export interface CrewRecommendation {
  process_type?: string;
  main_conversion_mechanism?: string;
  temperature_compatibility?: string;
  biological_compatibility?: string;
  industrial_realism?: string;
  winner_name: string;
  confidence: "high" | "medium" | "low";
  recommendation: string;
  why_this_candidate: string;
  why_not_others: string;
  next_experiment: string;
  reject_all: boolean;
  proposed_candidate?: {
    name?: string;
    formula?: string;
    candidateType?: string;
    routeType?: string;
    predictedActivity?: number;
    predictedSelectivity?: number;
    predictedStability?: number;
    confidenceScore?: number;
    feedstockFitScore?: number;
    costScore?: number;
    sustainabilityScore?: number;
    scalabilityScore?: number;
    uncertaintyScore?: number;
    mechanismText?: string;
    evidenceText?: string;
  };
  /** Classification JSON merged in for observability (matches former Python stdout shape). */
  reaction_understanding?: unknown;
}

function resolveGroqModel(): string {
  let model = (process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile").trim();
  if (model.toLowerCase().startsWith("set groq_model=")) {
    model = model.split("=", 2)[1]?.trim() ?? model;
  }
  if (model.startsWith("groq/")) {
    model = model.slice("groq/".length);
  }
  return model;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim() || "{}";
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return JSON.parse(jsonrepair(trimmed)) as Record<string, unknown>;
  }
}

async function groqJsonChat(params: {
  model: string;
  temperature: number;
  max_tokens: number;
  system: string;
  user: string;
}): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is required for the Discovery recommender.");
  }

  const body = {
    model: params.model,
    temperature: params.temperature,
    max_tokens: params.max_tokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: params.system },
      { role: "user", content: params.user },
    ],
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(GROQ_CHAT_COMPLETIONS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const raw = await res.text();
    if (!res.ok) {
      const lower = raw.toLowerCase();
      if ((lower.includes("rate limit") || res.status === 429) && attempt === 0) {
        await sleep(12_000);
        lastError = new Error(`Groq ${res.status}: ${raw.slice(0, 800)}`);
        continue;
      }
      throw new Error(`Groq API ${res.status}: ${raw.slice(0, 800)}`);
    }
    const data = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() ?? "{}";
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function asBool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function normalizeConfidence(v: unknown): "high" | "medium" | "low" {
  const s = String(v ?? "medium").toLowerCase();
  if (s === "high" || s === "medium" || s === "low") return s;
  return "medium";
}

function normalizeProposed(raw: unknown): CrewRecommendation["proposed_candidate"] {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  return {
    name: typeof o.name === "string" ? o.name : undefined,
    formula: typeof o.formula === "string" ? o.formula : undefined,
    candidateType: typeof o.candidateType === "string" ? o.candidateType : undefined,
    routeType: typeof o.routeType === "string" ? o.routeType : undefined,
    predictedActivity: typeof o.predictedActivity === "number" ? o.predictedActivity : undefined,
    predictedSelectivity: typeof o.predictedSelectivity === "number" ? o.predictedSelectivity : undefined,
    predictedStability: typeof o.predictedStability === "number" ? o.predictedStability : undefined,
    confidenceScore: typeof o.confidenceScore === "number" ? o.confidenceScore : undefined,
    feedstockFitScore: typeof o.feedstockFitScore === "number" ? o.feedstockFitScore : undefined,
    costScore: typeof o.costScore === "number" ? o.costScore : undefined,
    sustainabilityScore: typeof o.sustainabilityScore === "number" ? o.sustainabilityScore : undefined,
    scalabilityScore: typeof o.scalabilityScore === "number" ? o.scalabilityScore : undefined,
    uncertaintyScore: typeof o.uncertaintyScore === "number" ? o.uncertaintyScore : undefined,
    mechanismText: typeof o.mechanismText === "string" ? o.mechanismText : undefined,
    evidenceText: typeof o.evidenceText === "string" ? o.evidenceText : undefined,
  };
}

function toRecommendation(
  parsed: Record<string, unknown>,
  classification: Record<string, unknown>,
): CrewRecommendation {
  let winner_name = asString(parsed["winner_name"], "");
  if (winner_name === "NONE") winner_name = "";

  return {
    process_type: typeof parsed["process_type"] === "string" ? parsed["process_type"] : undefined,
    main_conversion_mechanism:
      typeof parsed["main_conversion_mechanism"] === "string"
        ? parsed["main_conversion_mechanism"]
        : undefined,
    temperature_compatibility:
      typeof parsed["temperature_compatibility"] === "string"
        ? parsed["temperature_compatibility"]
        : undefined,
    biological_compatibility:
      typeof parsed["biological_compatibility"] === "string"
        ? parsed["biological_compatibility"]
        : undefined,
    industrial_realism:
      typeof parsed["industrial_realism"] === "string" ? parsed["industrial_realism"] : undefined,
    winner_name,
    confidence: normalizeConfidence(parsed["confidence"]),
    recommendation: asString(parsed["recommendation"], ""),
    why_this_candidate: asString(parsed["why_this_candidate"], ""),
    why_not_others: asString(parsed["why_not_others"], ""),
    next_experiment: asString(parsed["next_experiment"], ""),
    reject_all: asBool(parsed["reject_all"], false),
    proposed_candidate: normalizeProposed(parsed["proposed_candidate"]),
    reaction_understanding: classification,
  };
}

export async function runCrewRecommendation(input: {
  reaction: Reaction;
  candidates: Candidate[];
  evidence: Record<string, unknown>;
}): Promise<CrewRecommendation> {
  const model = resolveGroqModel();

  const reactionPayload = {
    name: input.reaction.name,
    equation: input.reaction.equation,
    targetProduct: input.reaction.targetProduct,
    conditions: input.reaction.conditions,
    domain: input.reaction.domain,
    description: input.reaction.description,
  };

  const candidatesPayload = input.candidates.map((candidate) => {
    const row = candidate as Record<string, unknown>;
    return {
      name: candidate.name,
      formula: candidate.formula,
      activity: candidate.predictedActivity,
      selectivity: candidate.predictedSelectivity,
      stability: candidate.predictedStability,
      confidence: candidate.confidenceScore,
      composite: row["compositeScore"],
      climate: row["co2AvoidedPerTonne"],
      toxicity: row["toxicityLevel"],
      costTier: row["costTier"],
      zldCompatible: row["zldCompatible"],
      mechanism: candidate.mechanismText,
    };
  });

  const classification_system_prompt =
    "You are a catalyst and bioprocess reaction-classification engine. " +
    "Before any recommendation, determine the reaction class, process type, realistic operating regime, " +
    "main conversion mechanism, and compatibility constraints. Return valid JSON only.";

  const classification_prompt = JSON.stringify(
    {
      task: "Classify the reaction and identify the mechanism classes that a scientifically valid candidate must satisfy.",
      reaction: reactionPayload,
      evidence: input.evidence,
      required_output_shape: {
        reaction_class: "short class name",
        process_type: "biological|thermochemical|electrochemical|photocatalytic|hybrid",
        realistic_operating_regime: "temperature/pressure/pH or other key operating constraints",
        main_conversion_mechanism: "dominant mechanistic pathway",
        compatible_candidate_classes: ["mechanism classes that can realistically participate"],
        incompatibility_rules: ["rules for rejecting candidates"],
      },
    },
    null,
    0,
  );

  const classification_text = await groqJsonChat({
    model,
    temperature: 0.05,
    max_tokens: 600,
    system: classification_system_prompt,
    user: classification_prompt,
  });
  const classification = parseJsonObject(classification_text);

  const ranking_system_prompt =
    "You are a catalyst and bioprocess recommendation engine. " +
    "Rank candidates only after using the provided process classification. " +
    "A candidate MUST be penalized or rejected if its active temperature window is incompatible, " +
    "its mechanism does not participate in the governing reaction pathway, it conflicts with microbial viability, " +
    "or it is industrially unrealistic for the stated process. " +
    "Prefer mechanistic correctness over superficial chemical similarity. " +
    "You may reject all candidates if none are scientifically appropriate. " +
    "If none of the shortlist candidates are appropriate, propose one new scientifically compatible candidate instead. " +
    "Return valid JSON only.";

  const ranking_prompt = JSON.stringify(
    {
      task: "Select the best catalyst or biocatalyst only from mechanism-compatible candidates.",
      reaction: reactionPayload,
      reaction_understanding: classification,
      evidence: input.evidence,
      candidates: candidatesPayload.slice(0, 5),
      required_output_shape: {
        process_type: "copied from reaction_understanding",
        main_conversion_mechanism: "copied or refined from reaction_understanding",
        temperature_compatibility: "summary of winner or rejection compatibility",
        biological_compatibility: "summary of microbial/bioprocess compatibility or not applicable",
        industrial_realism: "summary of scale-up realism",
        winner_name: "exact candidate name from shortlist, or NONE",
        confidence: "high|medium|low",
        recommendation: "concise scientific recommendation or rejection explanation",
        why_this_candidate: "why this candidate is mechanistically best, or why none qualify",
        why_not_others: "why the main alternatives are weaker or incompatible",
        next_experiment: "most useful validation experiment",
        reject_all: "true only if no existing shortlist candidate is appropriate",
        proposed_candidate: {
          name: "required when reject_all is true; best scientifically compatible catalyst or biocatalyst",
          formula: "formula, organism edit, or material description",
          candidateType:
            "heterogeneous-catalyst|homogeneous-catalyst|enzyme|microbial-pathway|electrocatalyst|photocatalyst",
          routeType: "chemical-catalysis|synthetic-biology|electrocatalysis|photocatalysis|hybrid",
          predictedActivity: 0.0,
          predictedSelectivity: 0.0,
          predictedStability: 0.0,
          confidenceScore: 0.0,
          feedstockFitScore: 0.0,
          costScore: 0.0,
          sustainabilityScore: 0.0,
          scalabilityScore: 0.0,
          uncertaintyScore: 0.0,
          mechanismText: "mechanistic basis tied to reaction_understanding",
          evidenceText: "brief evidence/rationale and caveats",
        },
      },
    },
    null,
    0,
  );

  const ranking_text = await groqJsonChat({
    model,
    temperature: 0.15,
    max_tokens: 900,
    system: ranking_system_prompt,
    user: ranking_prompt,
  });
  const parsed = parseJsonObject(ranking_text);
  return toRecommendation(parsed, classification);
}
