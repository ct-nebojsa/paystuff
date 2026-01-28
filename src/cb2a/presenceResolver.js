function keyOf(reqRow) {
  return reqRow.type ? `${reqRow.field}.${reqRow.type}` : `${reqRow.field}`;
}

function parseReq(req) {
  // X, F, C(46), etc.
  const m = /^C\((\d+)\)$/.exec(req);
  if (m) return { kind: "C", id: Number(m[1]) };
  return { kind: req, id: null };
}

function matchRule(ruleMatch, useCase) {
  if (!ruleMatch) return false;

  // match by explicit useCaseIds
  if (Array.isArray(ruleMatch.useCaseIds)) {
    if (ruleMatch.useCaseIds.includes(useCase.id)) return true;
  }

  // match by tagsAny
  if (Array.isArray(ruleMatch.tagsAny)) {
    const tags = useCase.tags || [];
    if (ruleMatch.tagsAny.some((t) => tags.includes(t))) return true;
  }

  return false;
}

/**
 * Resolve requirement rows by upgrading/adjusting "C(n)" based on presence conditions + use case.
 *
 * @param {Array} requirements - schema.requirements
 * @param {Array} presenceConditions - schema.presenceConditions
 * @param {Object} useCase - selected use case
 * @returns {Array} resolved rows: {field,type,req,label,reqResolved,whyResolved}
 */
export function resolveRequirements(requirements, presenceConditions, useCase) {
  const condById = new Map();
  for (const pc of presenceConditions || []) condById.set(pc.id, pc);

  return requirements.map((r) => {
    const parsed = parseReq(r.req);

    // default: unchanged
    let reqResolved = r.req;
    let whyResolved = r.label || "";

    if (parsed.kind === "C") {
      const pc = condById.get(parsed.id);
      if (pc && matchRule(pc.match, useCase)) {
        reqResolved = pc.action?.upgradeTo || "X";
        whyResolved = `${r.label || ""} — conditional C(${parsed.id}) matched: ${pc.description}`;
      } else if (pc) {
        whyResolved = `${r.label || ""} — conditional C(${parsed.id}): ${pc.description}`;
      } else {
        whyResolved = `${r.label || ""} — conditional C(${parsed.id}) (no resolver rule defined)`;
      }
    }

    return {
      ...r,
      key: keyOf(r),
      reqResolved,
      whyResolved,
    };
  });
}
