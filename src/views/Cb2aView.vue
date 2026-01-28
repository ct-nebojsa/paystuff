<template>
  <div class="cb2a-builder">
    <header class="header">
      <h1>CB2A Builder (56.0028-driven)</h1>
      <p class="muted">
        Dropdown is built from <span class="mono">56.0028 Payment use case</span> (01–06) and variants
        (Non-3DS / 3DS / MIT). Requirements come from the selected profile (remote SEC eCom 0100), then
        C(n) is resolved to mandatory based on variant tags (e.g., <span class="mono">3ds</span>, <span class="mono">mit</span>).
      </p>
    </header>

    <section class="panel">
      <label class="label" for="variant">Payment use case + variant</label>
      <select id="variant" v-model="selectedVariantId" class="select">
        <option v-for="opt in dropdownOptions" :key="opt.id" :value="opt.id">
          {{ opt.label }}
        </option>
      </select>

      <div class="uc-meta">
        <div class="chip">{{ (selectedVariant.tags || []).join(", ") || "—" }}</div>
        <div class="muted small">
          Conditionals <span class="mono">C(n)</span> are upgraded to <span class="mono">X</span> by rules (e.g., tags
          <span class="mono">3ds</span> / <span class="mono">mit</span>).
        </div>
      </div>
    </section>

    <section class="grid">
      <div class="panel">
        <h2>Resolved requirements</h2>

        <div class="summary" :class="{ bad: validation.stats.missingCount > 0 }">
          <div class="summary-title">
            Validation:
            <span class="mono">{{ validation.stats.okCount }}/{{ validation.stats.mandatoryCount }}</span>
            mandatory populated
          </div>
          <div v-if="validation.stats.missingCount > 0" class="summary-sub muted">
            Missing: <strong>{{ validation.stats.missingCount }}</strong>
          </div>
          <div v-else class="summary-sub muted">
            All mandatory fields are populated (for this selection).
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Base</th>
              <th>Resolved</th>
              <th>Missing?</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in resolvedRequirementsSorted"
              :key="r.key + r.reqResolved"
              :class="{ rowMissing: !!missingByKey[r.key] }"
            >
              <td class="mono">{{ r.key }}</td>
              <td><span class="pill">{{ r.req }}</span></td>
              <td>
                <span
                  class="pill"
                  :class="{
                    pillX: r.reqResolved === 'X',
                    pillC: r.reqResolved.startsWith('C'),
                    pillF: r.reqResolved === 'F'
                  }"
                >
                  {{ r.reqResolved }}
                </span>
              </td>
              <td>
                <span v-if="missingByKey[r.key]" class="pill pillMissing">
                  {{ missingByKey[r.key].reason }}
                </span>
                <span v-else class="muted">—</span>
              </td>
              <td class="muted">{{ r.whyResolved }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h2>Constructed message</h2>
        <div class="toolbar">
          <button class="btn" @click="copyJson">Copy JSON</button>
          <button class="btn" @click="rebuildMessage">Rebuild</button>
        </div>
        <pre class="pre">{{ prettyMessage }}</pre>
      </div>
    </section>
  </div>
</template>

<script>
import { CB2A_SCHEMA } from "@/cb2a/cb2aSchema";
import { resolveRequirements } from "@/cb2a/presenceResolver";
import { buildMessage } from "@/cb2a/mergeBuilder";
import { validateMissingRequired } from "@/cb2a/validator";

export default {
  name: "Cb2aBuilderView",

  data() {
    return {
      schema: CB2A_SCHEMA,
      selectedVariantId: null, // derived from paymentUseCaseVariants
      messageDraft: null,
      lockAutoFields: false,
    };
  },

  created() {
    this.selectedVariantId = this.dropdownOptions?.[0]?.id || null;
    this.rebuildMessage();
  },

  watch: {
    selectedVariantId() {
      this.rebuildMessage();
    },
  },

  computed: {
    // Build dropdown labels: "01 — Single payment — 3DS secured"
    dropdownOptions() {
      const paymentUseCases = this.schema.paymentUseCases || [];
      const variants = this.schema.paymentUseCaseVariants || [];

      const pucByCode = new Map(paymentUseCases.map((p) => [p.code, p]));

      return variants
        .map((v) => {
          const puc = pucByCode.get(v.paymentUseCaseCode);
          const base = puc ? `${puc.code} — ${puc.label}` : `${v.paymentUseCaseCode} — (Unknown)`;
          return {
            id: v.id,
            label: `${base} — ${v.labelSuffix}`,
            tags: v.tags || [],
            requirementProfileId: v.requirementProfileId || "remote_sec_ecom_0100",
            defaults: v.defaults || null,
            businessValues: v.businessValues || null,
            // keep original
            _raw: v,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    },

    selectedVariant() {
      return (
        this.dropdownOptions.find((o) => o.id === this.selectedVariantId) ||
        this.dropdownOptions[0] ||
        {}
      );
    },

    requirementsForSelection() {
      const profileId = this.selectedVariant.requirementProfileId || "remote_sec_ecom_0100";
      return this.schema.requirementProfiles?.[profileId]?.requirements || [];
    },

    resolvedRequirements() {
      // Important: pass selectedVariant (tags) so resolver can match tagsAny/useCaseIds logic
      return resolveRequirements(
        this.requirementsForSelection,
        this.schema.presenceConditions || [],
        this.selectedVariant
      );
    },

    resolvedRequirementsSorted() {
      const rows = [...this.resolvedRequirements];
      rows.sort((a, b) => {
        const [af, at] = a.key.split(".");
        const [bf, bt] = b.key.split(".");
        const an = parseInt(af, 10);
        const bn = parseInt(bf, 10);
        if (an !== bn) return an - bn;
        return String(at || "").localeCompare(String(bt || ""));
      });
      return rows;
    },

    message() {
      return this.messageDraft || { mti: "0100", fields: {} };
    },

    prettyMessage() {
      return JSON.stringify(this.message, null, 2);
    },

    validation() {
      return validateMissingRequired({
        message: this.message,
        resolvedRequirements: this.resolvedRequirements,
        placeholderMatchers: [/^<.+>$/, /^null$/i],
      });
    },

    missingByKey() {
      return this.validation.missingByKey || {};
    },
  },

  methods: {
    rebuildMessage() {
      // 1) Build base from constructionDefaults + optional variant defaults
      const built = buildMessage(
        this.schema.constructionDefaults,
        this.selectedVariant.defaults || { mti: "0100", fields: {} }
      );
      this.messageDraft = built;

      // 2) Apply variant business intent (56.0028 + 3DS/MIT payloads)
      this.applyBusinessValues(this.messageDraft, this.selectedVariant);

      // 3) Autofill dynamic + dummy values (demo)
      if (!this.lockAutoFields) this.autofillDynamicFields();
    },

    // Normalized application of businessValues (schema-driven)
    applyBusinessValues(messageDraft, variant) {
      const bv = variant?.businessValues;
      if (!bv || !messageDraft?.fields) return;

      const fields = messageDraft.fields;

      const ensureTlv = (field) => {
        if (!fields[field]) fields[field] = { tlv: {} };
        if (!fields[field].tlv) fields[field].tlv = {};
      };

      const setByKey = (key, val) => {
        const [field, type] = key.split(".");
        if (!type) {
          fields[field] = val;
          return;
        }
        ensureTlv(field);
        fields[field].tlv[type] = val;
      };

      for (const [key, spec] of Object.entries(bv.set || {})) {
        if (!spec || spec.kind === "unset") {
          setByKey(key, null);
          continue;
        }

        if (spec.kind === "value") {
          setByKey(key, spec.value);
          continue;
        }

        if (spec.kind === "processingCode") {
          const td = String(spec.transactionDesc ?? "00").padStart(2, "0");
          const da = String(spec.debit ?? "00").padStart(2, "0");
          const ca = String(spec.credit ?? "00").padStart(2, "0");
          setByKey(key, `${td}${da}${ca}`);
          continue;
        }
      }

      for (const key of bv.unset || []) {
        setByKey(key, null);
      }
    },

    // Dummy + dynamic values (safe testing)
    autofillDynamicFields() {
      if (!this.messageDraft?.fields) return;
      const f = this.messageDraft.fields;

      const pad = (n, w) => String(n).padStart(w, "0");
      const now = new Date();
      const MM = pad(now.getMonth() + 1, 2);
      const DD = pad(now.getDate(), 2);
      const hh = pad(now.getHours(), 2);
      const mm = pad(now.getMinutes(), 2);
      const ss = pad(now.getSeconds(), 2);

      // timestamps
      f["7"] = `${MM}${DD}${hh}${mm}${ss}`;
      f["12"] = `${hh}${mm}${ss}`;
      f["13"] = `${MM}${DD}`;

      // STAN
      f["11"] = pad(Math.floor(Math.random() * 1_000_000), 6);

      // core dummy payment data
      f["2"] = "4111111111111111";
      f["4"] = "000000001000"; // 10.00
      f["49"] = "978"; // EUR

      // POS/merchant ids (dummy)
      // remote/ecom typically differs from f2f; keep stable dummy for your profile
      f["22"] = "010";
      f["25"] = "00";
      f["32"] = "123456";
      f["41"] = "TERM0001";
      f["42"] = "ACCEPTOR0000001";
      f["53"] = "2600000000000000";

      // keep 59.0207 aligned if present
      if (f["59"]?.tlv) {
        f["59"].tlv["0207"] = f["4"];
      }

      // If selection contains 3ds tag, ensure dummy non-placeholder values exist
      if (this.selectedVariant.tags?.includes("3ds")) {
        if (!f["56"]) f["56"] = { tlv: {} };
        if (!f["56"].tlv) f["56"].tlv = {};

        f["56"].tlv["0022"] = f["56"].tlv["0022"] ?? "2"; // example major version
        f["56"].tlv["0023"] = f["56"].tlv["0023"] ?? "DUMMY-UUID-CONTAINER";

        if (!f["59"]) f["59"] = { tlv: {} };
        if (!f["59"].tlv) f["59"].tlv = {};
        f["59"].tlv["0412"] = f["59"].tlv["0412"] ?? "DUMMY-3DS-RESULTS";
      }

      // If MIT tag, ensure link to initial transaction exists
      if (this.selectedVariant.tags?.includes("mit")) {
        if (!f["119"]) f["119"] = { tlv: {} };
        if (!f["119"].tlv) f["119"].tlv = {};
        f["119"].tlv["0047"] = f["119"].tlv["0047"] ?? "DUMMY-ORIGINAL-DEBIT-UNIQUE-REF";

        if (!f["56"]) f["56"] = { tlv: {} };
        if (!f["56"].tlv) f["56"].tlv = {};
        f["56"].tlv["0046"] = f["56"].tlv["0046"] ?? "DUMMY-INITIAL-ECOM-TX-DATA";
      }
    },

    async copyJson() {
      try {
        await navigator.clipboard.writeText(this.prettyMessage);
      } catch (e) {
        const ta = document.createElement("textarea");
        ta.value = this.prettyMessage;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    },
  },
};
</script>

<style scoped>
.cb2a-builder {
  max-width: 1200px;
  margin: 0 auto;
  padding: 18px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.header h1 {
  margin: 0 0 6px 0;
  font-size: 22px;
}

.muted {
  color: #6b7280;
}

.small {
  font-size: 12px;
}

.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
}

.select {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  outline: none;
}

.uc-meta {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chip {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 14px;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.table th,
.table td {
  border-top: 1px solid #f1f5f9;
  padding: 8px 6px;
  vertical-align: top;
  font-size: 13px;
}

.table th {
  text-align: left;
  color: #374151;
  font-weight: 700;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.pill {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pillX {
  background: #ecfeff;
  border-color: #a5f3fc;
}

.pillC {
  background: #fff7ed;
  border-color: #fed7aa;
}

.pillF {
  background: #f3f4f6;
  border-color: #e5e7eb;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin: 10px 0;
}

.btn {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
}

.pre {
  background: #0b1020;
  color: #e5e7eb;
  padding: 12px;
  border-radius: 12px;
  overflow: auto;
  font-size: 12px;
  line-height: 1.35;
}

.summary {
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px;
  padding: 10px;
  margin-top: 10px;
}

.summary.bad {
  border-color: #fecaca;
  background: #fff1f2;
}

.summary-title {
  font-weight: 700;
  color: #111827;
}

.summary-sub {
  margin-top: 4px;
}

.rowMissing {
  background: #fff7ed;
}

.pillMissing {
  background: #fee2e2;
  border-color: #fecaca;
}
</style>
