import type { Reaction } from "@workspace/db";

export type CandidateReadinessInput = {
  name: string;
  formula: string;
  candidateType: string | null;
  predictedActivity: number;
  predictedSelectivity: number;
  predictedStability: number;
  sustainabilityScore: number | null;
};

/**
 * Legacy hook for climate/toxicity/composite columns that existed on `main`.
 * On `jans` the candidates table omits those fields; callers still await this
 * so inserts stay uniform without persisting removed columns.
 */
export async function buildCandidateReadiness(
  _reaction: Reaction,
  _input: CandidateReadinessInput,
): Promise<Record<string, never>> {
  return {};
}
