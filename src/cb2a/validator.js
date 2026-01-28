function isEmpty(v) {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

function isPlaceholder(v, placeholderMatchers) {
  if (typeof v !== "string") return false;
  const s = v.trim();
  return placeholderMatchers.some((m) => {
    if (m instanceof RegExp) return m.test(s);
    return s === m;
  });
}

function getFieldValue(message, field, type) {
  const fields = message?.fields || {};
  const fv = fields?.[field];

  // Non-TLV field
  if (!type) return fv;

  // TLV container: expect { tlv: { [type]: value } }
  if (fv && typeof fv === "object") {
    const tlv = fv.tlv || fv.TLV || fv; // tolerate different shapes
    if (tlv && typeof tlv === "object") return tlv[type];
  }

  return undefined;
}

/**
 * Validate missing mandatory fields after presence-condition resolution.
 *
 * @param {Object} args
 * @param {Object} args.message constructed message object {mti, fields:{...}}
 * @param {Array} args.resolvedRequirements output rows from resolveRequirements()
 * @param {Array<RegExp|string>} [args.placeholderMatchers] patterns considered "not real"
 * @returns {Object} { missing: Array, missingByKey: Map-like object, stats: {...} }
 */
export function validateMissingRequired({
  message,
  resolvedRequirements,
  placeholderMatchers = [
    /^<.+>$/, // "<PAN>", "<AMOUNT>", etc.
  ],
}) {
  const missing = [];
  const missingByKey = {};

  const mandatory = (resolvedRequirements || []).filter((r) => r.reqResolved === "X");

  for (const r of mandatory) {
    const val = getFieldValue(message, r.field, r.type);

    const fail =
      isEmpty(val) ||
      isPlaceholder(val, placeholderMatchers);

    if (fail) {
      const key = r.type ? `${r.field}.${r.type}` : `${r.field}`;
      const reason = isEmpty(val)
        ? "Empty (null/undefined/blank)"
        : "Placeholder value";

      const item = {
        key,
        field: r.field,
        type: r.type || null,
        label: r.label || "",
        reason,
        currentValue: val,
      };

      missing.push(item);
      missingByKey[key] = item;
    }
  }

  return {
    missing,
    missingByKey,
    stats: {
      mandatoryCount: mandatory.length,
      missingCount: missing.length,
      okCount: Math.max(0, mandatory.length - missing.length),
    },
  };
}
