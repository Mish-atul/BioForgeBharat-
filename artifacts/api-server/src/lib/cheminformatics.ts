import { logger } from "./logger";

const PUBCHEM_BASE = "https://pubchem.ncbi.nlm.nih.gov/rest/pug";
const CHEMBL_BASE = "https://www.ebi.ac.uk/chembl/api/data";
const REQUEST_TIMEOUT_MS = 5000;

export interface PubChemProperties {
  pubchemCid: number;
  molecularWeight: number | null;
  logP: number | null;
  tpsa: number | null;
  canonicalSmiles: string | null;
  iupacName: string | null;
  molecularFormula: string | null;
}

export interface ChemblHit {
  chemblId: string;
  prefName: string | null;
  molecularFormula: string | null;
  molecularWeight: number | null;
  canonicalSmiles: string | null;
}

export interface CheminformaticsLookup {
  pubchemCid: number | null;
  chemblId: string | null;
  molecularWeight: number | null;
  logP: number | null;
  tpsa: number | null;
  canonicalSmiles: string | null;
  iupacName: string | null;
  sourceDb: string | null;
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "BioForgeBharat/1.0 (research)",
        ...(init?.headers ?? {}),
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function sanitizeQueryToken(token: string): string {
  return token.trim().replace(/\s+/g, " ");
}

/**
 * Fetch molecular properties from PubChem by compound name.
 * Returns null if not found or on error (network, parsing) — never throws.
 */
export async function fetchPubChemByName(name: string): Promise<PubChemProperties | null> {
  const q = sanitizeQueryToken(name);
  if (!q) return null;
  const props = "MolecularWeight,XLogP,TPSA,CanonicalSMILES,IUPACName,MolecularFormula";
  const url = `${PUBCHEM_BASE}/compound/name/${encodeURIComponent(q)}/property/${props}/JSON`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      PropertyTable?: { Properties?: Array<Record<string, unknown>> };
    };
    const row = json?.PropertyTable?.Properties?.[0];
    if (!row || typeof row["CID"] !== "number") return null;
    const num = (k: string): number | null => {
      const v = row[k];
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };
    const str = (k: string): string | null => {
      const v = row[k];
      return typeof v === "string" && v.length > 0 ? v : null;
    };
    return {
      pubchemCid: row["CID"],
      molecularWeight: num("MolecularWeight"),
      logP: num("XLogP"),
      tpsa: num("TPSA"),
      canonicalSmiles: str("CanonicalSMILES"),
      iupacName: str("IUPACName"),
      molecularFormula: str("MolecularFormula"),
    };
  } catch (err) {
    logger.warn({ err, name: q }, "PubChem name lookup failed");
    return null;
  }
}

/**
 * Fetch molecular properties from PubChem by molecular formula.
 * Returns the first matching CID's properties or null if not found.
 */
export async function fetchPubChemByFormula(formula: string): Promise<PubChemProperties | null> {
  const q = sanitizeQueryToken(formula);
  if (!q) return null;
  // /compound/formula/{formula}/cids/JSON returns a list; take the first CID.
  const cidsUrl = `${PUBCHEM_BASE}/compound/fastformula/${encodeURIComponent(q)}/cids/JSON?MaxRecords=1`;
  try {
    const res = await fetchWithTimeout(cidsUrl);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      IdentifierList?: { CID?: number[] };
    };
    const cid = json?.IdentifierList?.CID?.[0];
    if (typeof cid !== "number") return null;
    return await fetchPubChemByCid(cid);
  } catch (err) {
    logger.warn({ err, formula: q }, "PubChem formula lookup failed");
    return null;
  }
}

export async function fetchPubChemByCid(cid: number): Promise<PubChemProperties | null> {
  const props = "MolecularWeight,XLogP,TPSA,CanonicalSMILES,IUPACName,MolecularFormula";
  const url = `${PUBCHEM_BASE}/compound/cid/${cid}/property/${props}/JSON`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      PropertyTable?: { Properties?: Array<Record<string, unknown>> };
    };
    const row = json?.PropertyTable?.Properties?.[0];
    if (!row) return null;
    const num = (k: string): number | null => {
      const v = row[k];
      if (typeof v === "number" && Number.isFinite(v)) return v;
      if (typeof v === "string") {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };
    const str = (k: string): string | null => {
      const v = row[k];
      return typeof v === "string" && v.length > 0 ? v : null;
    };
    return {
      pubchemCid: cid,
      molecularWeight: num("MolecularWeight"),
      logP: num("XLogP"),
      tpsa: num("TPSA"),
      canonicalSmiles: str("CanonicalSMILES"),
      iupacName: str("IUPACName"),
      molecularFormula: str("MolecularFormula"),
    };
  } catch (err) {
    logger.warn({ err, cid }, "PubChem CID lookup failed");
    return null;
  }
}

/**
 * Search ChEMBL by free-text query (compound name / synonym).
 * Returns up to `limit` hits with normalized identifiers and properties.
 */
export async function searchChembl(query: string, limit = 5): Promise<ChemblHit[]> {
  const q = sanitizeQueryToken(query);
  if (!q) return [];
  const url = `${CHEMBL_BASE}/molecule/search.json?q=${encodeURIComponent(q)}&limit=${limit}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      molecules?: Array<{
        molecule_chembl_id?: string;
        pref_name?: string | null;
        molecule_properties?: {
          full_molformula?: string | null;
          full_mwt?: string | number | null;
        } | null;
        molecule_structures?: {
          canonical_smiles?: string | null;
        } | null;
      }>;
    };
    const molecules = json?.molecules ?? [];
    const hits: ChemblHit[] = [];
    for (const m of molecules) {
      if (!m.molecule_chembl_id) continue;
      const mw = m.molecule_properties?.full_mwt;
      const mwNum = typeof mw === "number" ? mw : typeof mw === "string" ? Number(mw) : null;
      hits.push({
        chemblId: m.molecule_chembl_id,
        prefName: m.pref_name ?? null,
        molecularFormula: m.molecule_properties?.full_molformula ?? null,
        molecularWeight: Number.isFinite(mwNum) ? (mwNum as number) : null,
        canonicalSmiles: m.molecule_structures?.canonical_smiles ?? null,
      });
    }
    return hits;
  } catch (err) {
    logger.warn({ err, query: q }, "ChEMBL search failed");
    return [];
  }
}

/**
 * Best-effort lookup: try PubChem by name first, then by formula. If both
 * return data, the by-name result wins (more specific). Returns a normalized
 * record suitable for direct insertion into the candidates table.
 */
export async function lookupCheminformatics(
  name: string,
  formula?: string,
): Promise<CheminformaticsLookup> {
  const empty: CheminformaticsLookup = {
    pubchemCid: null,
    chemblId: null,
    molecularWeight: null,
    logP: null,
    tpsa: null,
    canonicalSmiles: null,
    iupacName: null,
    sourceDb: null,
  };

  let pubchem = await fetchPubChemByName(name);
  if (!pubchem && formula) {
    pubchem = await fetchPubChemByFormula(formula);
  }

  if (pubchem) {
    return {
      pubchemCid: pubchem.pubchemCid,
      chemblId: null,
      molecularWeight: pubchem.molecularWeight,
      logP: pubchem.logP,
      tpsa: pubchem.tpsa,
      canonicalSmiles: pubchem.canonicalSmiles,
      iupacName: pubchem.iupacName,
      sourceDb: "PubChem",
    };
  }

  const chembl = await searchChembl(name, 1);
  if (chembl.length > 0) {
    const top = chembl[0];
    return {
      ...empty,
      chemblId: top.chemblId,
      molecularWeight: top.molecularWeight,
      canonicalSmiles: top.canonicalSmiles,
      sourceDb: "ChEMBL",
    };
  }

  return empty;
}
