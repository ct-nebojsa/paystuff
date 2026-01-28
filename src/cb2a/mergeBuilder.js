function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function deepMerge(base, patch) {
  const out = Array.isArray(base) ? [...base] : isPlainObject(base) ? { ...base } : base;

  if (!isPlainObject(patch) && !Array.isArray(patch)) return patch ?? out;

  for (const k of Object.keys(patch || {})) {
    const bv = out?.[k];
    const pv = patch[k];

    if (isPlainObject(bv) && isPlainObject(pv)) {
      out[k] = deepMerge(bv, pv);
    } else {
      out[k] = pv;
    }
  }
  return out;
}

/**
 * Build message object from:
 * - constructionDefaults
 * - selected useCase defaults
 */
export function buildMessage(constructionDefaults, useCaseDefaults) {
  const base = {
    mti: constructionDefaults?.mti ?? "0100",
    fields: constructionDefaults?.fields ?? {},
  };

  const patch = {
    mti: useCaseDefaults?.mti,
    fields: useCaseDefaults?.fields,
  };

  return deepMerge(base, patch);
}
