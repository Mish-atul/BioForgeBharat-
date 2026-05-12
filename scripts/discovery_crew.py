import json
import os
import sys
import time
from typing import Any

from groq import Groq
from json_repair import repair_json

sys.stdout.reconfigure(encoding="utf-8")


def read_payload() -> dict[str, Any]:
    raw = sys.stdin.read().strip()
    return json.loads(raw or "{}")


def parse_json_output(text: str) -> dict[str, Any]:
    try:
        return json.loads(text)
    except Exception:
        return json.loads(repair_json(text))


def build_client() -> tuple[Groq, str]:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is required for the Discovery recommender.")

    model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
    if model.lower().startswith("set groq_model="):
        model = model.split("=", 1)[1].strip()
    if model.startswith("groq/"):
        model = model.removeprefix("groq/")
    return Groq(api_key=api_key), model


def main() -> None:
    payload = read_payload()
    client, model = build_client()

    reaction = payload["reaction"]
    candidates = payload["candidates"][:5]
    evidence = payload["evidence"]

    classification_system_prompt = (
        "You are a catalyst and bioprocess reaction-classification engine. "
        "Before any recommendation, determine the reaction class, process type, realistic operating regime, "
        "main conversion mechanism, and compatibility constraints. Return valid JSON only."
    )
    classification_prompt = json.dumps(
        {
            "task": "Classify the reaction and identify the mechanism classes that a scientifically valid candidate must satisfy.",
            "reaction": reaction,
            "evidence": evidence,
            "required_output_shape": {
                "reaction_class": "short class name",
                "process_type": "biological|thermochemical|electrochemical|photocatalytic|hybrid",
                "realistic_operating_regime": "temperature/pressure/pH or other key operating constraints",
                "main_conversion_mechanism": "dominant mechanistic pathway",
                "compatible_candidate_classes": ["mechanism classes that can realistically participate"],
                "incompatibility_rules": ["rules for rejecting candidates"],
            },
        },
        ensure_ascii=False,
    )

    classification_result = None
    last_error = None
    for _attempt in range(2):
        try:
            classification_result = client.chat.completions.create(
                model=model,
                temperature=0.05,
                max_tokens=600,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": classification_system_prompt},
                    {"role": "user", "content": classification_prompt},
                ],
            )
            break
        except Exception as exc:
            last_error = exc
            message = str(exc).lower()
            if "rate limit" in message or "429" in message:
                time.sleep(12)
                continue
            raise

    if classification_result is None and last_error is not None:
        raise last_error

    classification_text = classification_result.choices[0].message.content or "{}"
    classification = parse_json_output(classification_text)

    ranking_system_prompt = (
        "You are a catalyst and bioprocess recommendation engine. "
        "Rank candidates only after using the provided process classification. "
        "A candidate MUST be penalized or rejected if its active temperature window is incompatible, "
        "its mechanism does not participate in the governing reaction pathway, it conflicts with microbial viability, "
        "or it is industrially unrealistic for the stated process. "
        "Prefer mechanistic correctness over superficial chemical similarity. "
        "You may reject all candidates if none are scientifically appropriate. "
        "If none of the shortlist candidates are appropriate, propose one new scientifically compatible candidate instead. "
        "Return valid JSON only."
    )
    ranking_prompt = json.dumps(
        {
            "task": "Select the best catalyst or biocatalyst only from mechanism-compatible candidates.",
            "reaction": reaction,
            "reaction_understanding": classification,
            "evidence": evidence,
            "candidates": candidates,
            "required_output_shape": {
                "process_type": "copied from reaction_understanding",
                "main_conversion_mechanism": "copied or refined from reaction_understanding",
                "temperature_compatibility": "summary of winner or rejection compatibility",
                "biological_compatibility": "summary of microbial/bioprocess compatibility or not applicable",
                "industrial_realism": "summary of scale-up realism",
                "winner_name": "exact candidate name from shortlist, or NONE",
                "confidence": "high|medium|low",
                "recommendation": "concise scientific recommendation or rejection explanation",
                "why_this_candidate": "why this candidate is mechanistically best, or why none qualify",
                "why_not_others": "why the main alternatives are weaker or incompatible",
                "next_experiment": "most useful validation experiment",
                "reject_all": "true only if no existing shortlist candidate is appropriate",
                "proposed_candidate": {
                    "name": "required when reject_all is true; best scientifically compatible catalyst or biocatalyst",
                    "formula": "formula, organism edit, or material description",
                    "candidateType": "heterogeneous-catalyst|homogeneous-catalyst|enzyme|microbial-pathway|electrocatalyst|photocatalyst",
                    "routeType": "chemical-catalysis|synthetic-biology|electrocatalysis|photocatalysis|hybrid",
                    "predictedActivity": 0.0,
                    "predictedSelectivity": 0.0,
                    "predictedStability": 0.0,
                    "confidenceScore": 0.0,
                    "feedstockFitScore": 0.0,
                    "costScore": 0.0,
                    "sustainabilityScore": 0.0,
                    "scalabilityScore": 0.0,
                    "uncertaintyScore": 0.0,
                    "mechanismText": "mechanistic basis tied to reaction_understanding",
                    "evidenceText": "brief evidence/rationale and caveats",
                },
            },
        },
        ensure_ascii=False,
    )

    result = None
    last_error = None
    for _attempt in range(2):
        try:
            result = client.chat.completions.create(
                model=model,
                temperature=0.15,
                max_tokens=900,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": ranking_system_prompt},
                    {"role": "user", "content": ranking_prompt},
                ],
            )
            break
        except Exception as exc:
            last_error = exc
            message = str(exc).lower()
            if "rate limit" in message or "429" in message:
                time.sleep(12)
                continue
            raise

    if result is None and last_error is not None:
        raise last_error

    text = result.choices[0].message.content or "{}"
    parsed = parse_json_output(text)
    parsed["reaction_understanding"] = classification
    print(json.dumps(parsed, ensure_ascii=False))


if __name__ == "__main__":
    main()
