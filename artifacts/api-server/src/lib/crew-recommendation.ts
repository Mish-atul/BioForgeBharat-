import { spawn } from "node:child_process";
import path from "node:path";
import type { Candidate, Reaction } from "@workspace/db";

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
}

export function runCrewRecommendation(input: {
  reaction: Reaction;
  candidates: Candidate[];
  evidence: Record<string, unknown>;
}): Promise<CrewRecommendation> {
  return new Promise((resolve, reject) => {
    const repoRoot = path.resolve(import.meta.dirname, "..", "..", "..");
    const pythonPath = path.join(repoRoot, ".venv-crewai", "Scripts", "python.exe");
    const scriptPath = path.join(repoRoot, "scripts", "discovery_crew.py");
    const child = spawn(pythonPath, [scriptPath], {
      cwd: repoRoot,
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `CrewAI process exited with code ${code}`));
        return;
      }
      try {
        resolve(JSON.parse(stdout.trim()) as CrewRecommendation);
      } catch (err) {
        reject(err);
      }
    });

    child.stdin.write(
      JSON.stringify({
        reaction: {
          name: input.reaction.name,
          equation: input.reaction.equation,
          targetProduct: input.reaction.targetProduct,
          conditions: input.reaction.conditions,
          domain: input.reaction.domain,
          description: input.reaction.description,
        },
        candidates: input.candidates.map((candidate) => ({
          name: candidate.name,
          formula: candidate.formula,
          activity: candidate.predictedActivity,
          selectivity: candidate.predictedSelectivity,
          stability: candidate.predictedStability,
          confidence: candidate.confidenceScore,
          composite: candidate.compositeScore,
          climate: candidate.co2AvoidedPerTonne,
          toxicity: candidate.toxicityLevel,
          costTier: candidate.costTier,
          zldCompatible: candidate.zldCompatible,
          mechanism: candidate.mechanismText,
        })),
        evidence: input.evidence,
      }),
    );
    child.stdin.end();
  });
}
