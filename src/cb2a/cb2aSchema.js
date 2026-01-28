// src/cb2a/cb2aSchema.js
//
// CB2A schema v3:
// - Dropdown is driven by 56.0028 Payment Use Case (01–06) + variants (Non-3DS / 3DS / MIT)
// - Requirements are profile-based (remote_sec_ecom_0100 profile from your screenshots)
// - Presence conditions upgrade C(n) -> X based on tags (3ds/mit/remote/ecom/etc.)
// - Construction defaults provide the base message structure (TLV containers present)

export const CB2A_SCHEMA = {
  meta: {
    version: "v3",
    defaultMessageTemplate: "0100",
    notes: [
      "Dropdown = paymentUseCase (56.0028) × variant (Non-3DS / 3DS / MIT).",
      "Requirements are selected via requirementProfileId and then resolved via presenceConditions.",
      "XS in the spec tables is represented as req:'X' plus flags:['S'] where applicable (optional).",
    ],
  },

  // --------------------------------------------
  // Axis 1: Payment use case (56.0028) codes
  // --------------------------------------------
  paymentUseCases: [
    { code: "01", label: "Single payment" },
    { code: "02", label: "Recurring subscription (fixed amount / limited duration)" },
    { code: "03", label: "Instalment payment" },
    { code: "04", label: "Shipment payment" },
    { code: "05", label: "Recurring subscription (other)" },
    { code: "06", label: "Reservation and rental payment" },
  ],

  // ---------------------------------------------------------
  // Axis 2: Variants per payment use case (dropdown options)
  // - id must be unique
  // - paymentUseCaseCode must be one of the codes above
  // - tags are used by presenceConditions
  // - businessValues is applied on top of defaults
  // ---------------------------------------------------------
  paymentUseCaseVariants: [
    // ========== 01 Single payment ==========
    {
      id: "PUC01_NON3DS",
      paymentUseCaseCode: "01",
      labelSuffix: "Non-3DS",
      tags: ["remote", "ecom"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: {
        mti: "0100",
        fields: {
          "56": { tlv: {} },
          "59": { tlv: {} },
          "119": { tlv: {} },
        },
      },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "01" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          // Remote SEC eCom mandatory-by-table TLVs (keep placeholders until you set your real constants)
          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },
        },
      },
    },
    {
      id: "PUC01_3DS",
      paymentUseCaseCode: "01",
      labelSuffix: "3DS secured",
      tags: ["remote", "ecom", "3ds"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "01" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          // 3DS-related placeholders (made mandatory via presenceConditions for tag "3ds")
          "56.0022": { kind: "value", value: "<3DS_PROTOCOL_MAJOR_VERSION>" },
          "56.0023": { kind: "value", value: "<UUID_CONTAINER>" },
          "59.0412": { kind: "value", value: "<THREE_DS_RESULTS>" },

          // Optional eCom security set (conditional in tables)
          "59.0407": { kind: "value", value: "<ECOM_SECURITY_TYPE>" },
          "59.0416": { kind: "value", value: "<ECOM_INDICATOR>" },
        },
      },
    },
    {
      id: "PUC01_MIT",
      paymentUseCaseCode: "01",
      labelSuffix: "MIT (merchant-initiated)",
      tags: ["remote", "ecom", "mit"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "01" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          // MIT indicators / link to initial transaction (made mandatory via presenceConditions for tag "mit")
          "56.0029": { kind: "value", value: "K" }, // keep on file (placeholder encoding)
          "56.0046": { kind: "value", value: "<INITIAL_ECOM_TX_DATA>" },
          "119.0047": { kind: "value", value: "<ORIGINAL_DEBIT_UNIQUE_REF>" },
        },
      },
    },

    // ========== 02 Subscription fixed ==========
    {
      id: "PUC02_NON3DS",
      paymentUseCaseCode: "02",
      labelSuffix: "Non-3DS",
      tags: ["remote", "ecom", "subscription"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "02" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "01" }, // payment number
          "56.0032": { kind: "value", value: "<TOTAL_PAYMENTS>" },
        },
      },
    },
    {
      id: "PUC02_3DS_INITIAL",
      paymentUseCaseCode: "02",
      labelSuffix: "Initial (3DS)",
      tags: ["remote", "ecom", "subscription", "3ds"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "02" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "01" },
          "56.0032": { kind: "value", value: "<TOTAL_PAYMENTS>" },

          "56.0022": { kind: "value", value: "<3DS_PROTOCOL_MAJOR_VERSION>" },
          "56.0023": { kind: "value", value: "<UUID_CONTAINER>" },
          "59.0412": { kind: "value", value: "<THREE_DS_RESULTS>" },
        },
      },
    },
    {
      id: "PUC02_MIT_SUBSEQUENT",
      paymentUseCaseCode: "02",
      labelSuffix: "Subsequent (MIT)",
      tags: ["remote", "ecom", "subscription", "mit"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "02" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "<PAYMENT_NUMBER>" },
          "56.0032": { kind: "value", value: "<TOTAL_PAYMENTS>" },

          "56.0029": { kind: "value", value: "K" },
          "56.0046": { kind: "value", value: "<INITIAL_ECOM_TX_DATA>" },
          "119.0047": { kind: "value", value: "<ORIGINAL_DEBIT_UNIQUE_REF>" },
        },
      },
    },

    // ========== 03 Instalment ==========
    {
      id: "PUC03_NON3DS",
      paymentUseCaseCode: "03",
      labelSuffix: "Non-3DS",
      tags: ["remote", "ecom", "instalment"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "03" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "01" },
          "56.0032": { kind: "value", value: "<TOTAL_PAYMENTS>" },
        },
      },
    },
    {
      id: "PUC03_3DS",
      paymentUseCaseCode: "03",
      labelSuffix: "3DS secured",
      tags: ["remote", "ecom", "instalment", "3ds"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "03" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "01" },
          "56.0032": { kind: "value", value: "<TOTAL_PAYMENTS>" },

          "56.0022": { kind: "value", value: "<3DS_PROTOCOL_MAJOR_VERSION>" },
          "56.0023": { kind: "value", value: "<UUID_CONTAINER>" },
          "59.0412": { kind: "value", value: "<THREE_DS_RESULTS>" },
        },
      },
    },
    {
      id: "PUC03_MIT",
      paymentUseCaseCode: "03",
      labelSuffix: "Subsequent (MIT)",
      tags: ["remote", "ecom", "instalment", "mit"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "03" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "<PAYMENT_NUMBER>" },
          "56.0032": { kind: "value", value: "<TOTAL_PAYMENTS>" },

          "56.0029": { kind: "value", value: "K" },
          "56.0046": { kind: "value", value: "<INITIAL_ECOM_TX_DATA>" },
          "119.0047": { kind: "value", value: "<ORIGINAL_DEBIT_UNIQUE_REF>" },
        },
      },
    },

    // ========== 04 Shipment ==========
    {
      id: "PUC04_NON3DS",
      paymentUseCaseCode: "04",
      labelSuffix: "Non-3DS",
      tags: ["remote", "ecom", "shipment"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "04" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          // shipment often has validity date (conditional in table)
          "56.0045": { kind: "value", value: "<PAYMENT_VALIDITY_DATE_YYYYMMDD>" },
        },
      },
    },
    {
      id: "PUC04_3DS",
      paymentUseCaseCode: "04",
      labelSuffix: "3DS secured",
      tags: ["remote", "ecom", "shipment", "3ds"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "04" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0045": { kind: "value", value: "<PAYMENT_VALIDITY_DATE_YYYYMMDD>" },

          "56.0022": { kind: "value", value: "<3DS_PROTOCOL_MAJOR_VERSION>" },
          "56.0023": { kind: "value", value: "<UUID_CONTAINER>" },
          "59.0412": { kind: "value", value: "<THREE_DS_RESULTS>" },
        },
      },
    },
    {
      id: "PUC04_MIT",
      paymentUseCaseCode: "04",
      labelSuffix: "Subsequent (MIT)",
      tags: ["remote", "ecom", "shipment", "mit"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "04" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0045": { kind: "value", value: "<PAYMENT_VALIDITY_DATE_YYYYMMDD>" },

          "56.0029": { kind: "value", value: "K" },
          "56.0046": { kind: "value", value: "<INITIAL_ECOM_TX_DATA>" },
          "119.0047": { kind: "value", value: "<ORIGINAL_DEBIT_UNIQUE_REF>" },
        },
      },
    },

    // ========== 05 Subscription other ==========
    {
      id: "PUC05_NON3DS",
      paymentUseCaseCode: "05",
      labelSuffix: "Non-3DS",
      tags: ["remote", "ecom", "subscription_other"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "05" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "01" },
        },
      },
    },
    {
      id: "PUC05_3DS_INITIAL",
      paymentUseCaseCode: "05",
      labelSuffix: "Initial (3DS)",
      tags: ["remote", "ecom", "subscription_other", "3ds"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "05" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "01" },

          "56.0022": { kind: "value", value: "<3DS_PROTOCOL_MAJOR_VERSION>" },
          "56.0023": { kind: "value", value: "<UUID_CONTAINER>" },
          "59.0412": { kind: "value", value: "<THREE_DS_RESULTS>" },
        },
      },
    },
    {
      id: "PUC05_MIT_SUBSEQUENT",
      paymentUseCaseCode: "05",
      labelSuffix: "Subsequent (MIT)",
      tags: ["remote", "ecom", "subscription_other", "mit"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "05" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "56.0031": { kind: "value", value: "<PAYMENT_NUMBER>" },

          "56.0029": { kind: "value", value: "K" },
          "56.0046": { kind: "value", value: "<INITIAL_ECOM_TX_DATA>" },
          "119.0047": { kind: "value", value: "<ORIGINAL_DEBIT_UNIQUE_REF>" },
        },
      },
    },

    // ========== 06 Reservation & rental ==========
    {
      id: "PUC06_NON3DS",
      paymentUseCaseCode: "06",
      labelSuffix: "Non-3DS",
      tags: ["remote", "ecom", "rental"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "06" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          // rental service attribute placeholder (only if relevant in your remote profile)
          "59.0800": { kind: "value", value: "<SERVICE_ATTRIBUTE_RENTAL>" },
        },
      },
    },
    {
      id: "PUC06_3DS",
      paymentUseCaseCode: "06",
      labelSuffix: "3DS secured",
      tags: ["remote", "ecom", "rental", "3ds"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "06" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "59.0800": { kind: "value", value: "<SERVICE_ATTRIBUTE_RENTAL>" },

          "56.0022": { kind: "value", value: "<3DS_PROTOCOL_MAJOR_VERSION>" },
          "56.0023": { kind: "value", value: "<UUID_CONTAINER>" },
          "59.0412": { kind: "value", value: "<THREE_DS_RESULTS>" },
        },
      },
    },
    {
      id: "PUC06_MIT",
      paymentUseCaseCode: "06",
      labelSuffix: "Subsequent (MIT)",
      tags: ["remote", "ecom", "rental", "mit"],
      requirementProfileId: "remote_sec_ecom_0100",
      defaults: { mti: "0100", fields: { "56": { tlv: {} }, "59": { tlv: {} }, "119": { tlv: {} } } },
      businessValues: {
        set: {
          "56.0028": { kind: "value", value: "06" },
          "3": { kind: "processingCode", transactionDesc: "00", debit: "00", credit: "00" },

          "59.0101": { kind: "value", value: "<REASON_CODE>" },
          "59.0102": { kind: "value", value: "<TX_YEAR_YYYY>" },
          "59.0200": { kind: "value", value: "<ERT_SEC_ECOM>" },
          "59.0201": { kind: "value", value: "<ITP_SA>" },
          "59.0202": { kind: "value", value: "<ACCEPTOR_CONTRACT_NO>" },
          "59.0203": { kind: "value", value: "<ACCEPTANCE_SYS_LOGICAL_NO>" },
          "59.020B": { kind: "value", value: "<TASA>" },

          "59.0800": { kind: "value", value: "<SERVICE_ATTRIBUTE_RENTAL>" },

          "56.0029": { kind: "value", value: "K" },
          "56.0046": { kind: "value", value: "<INITIAL_ECOM_TX_DATA>" },
          "119.0047": { kind: "value", value: "<ORIGINAL_DEBIT_UNIQUE_REF>" },
        },
      },
    },
  ],

  // ----------------------------------------------------------
  // Requirement profiles
  // Note: This is a focused subset based on your screenshots,
  // emphasizing remote SEC eCom 0100 + 56/59/3DS/MIT relevancy.
  // Extend with more rows as you add more tables/screenshots.
  // ----------------------------------------------------------
  requirementProfiles: {
    remote_sec_ecom_0100: {
      requirements: [
        // ---- Core (subset) ----
        { field: "2", req: "X", label: "PAN", flags: ["S"] },
        { field: "3", req: "X", label: "Processing code", flags: ["S"] },
        { field: "4", req: "X", label: "Amount, transaction", flags: ["S"] },
        { field: "7", req: "C(117)", label: "Transmission date and time" },
        { field: "11", req: "X", label: "STAN", flags: ["S"] },
        { field: "12", req: "X", label: "Local time", flags: ["S"] },
        { field: "13", req: "X", label: "Local date", flags: ["S"] },
        { field: "22", req: "X", label: "POS entry mode", flags: ["S"] },
        { field: "25", req: "X", label: "POS condition code", flags: ["S"] },
        { field: "32", req: "X", label: "Acquirer ID", flags: ["S"] },
        { field: "41", req: "X", label: "Terminal ID", flags: ["S"] },
        { field: "42", req: "X", label: "Acceptor ID", flags: ["S"] },
        { field: "49", req: "X", label: "Currency code, transaction", flags: ["S"] },
        { field: "53", req: "X", label: "Security related control info", flags: ["S"] },

        // ---- Field 56 TLVs (from your screenshots) ----
        { field: "56", req: "C(2)", label: "Additional data" },
        { field: "56", type: "0020", req: "C(158)", label: "Resend counter" },
        { field: "56", type: "0022", req: "C(155)", label: "3DS protocol major version" },
        { field: "56", type: "0023", req: "C(103)", label: "UUID container" },
        { field: "56", type: "0028", req: "C(3)", label: "Payment use case" },
        { field: "56", type: "0029", req: "C(3)", label: "Card-on-file action" },
        { field: "56", type: "0031", req: "C(3)", label: "Payment number" },
        { field: "56", type: "0032", req: "C(3)", label: "Total number of payments" },
        { field: "56", type: "0033", req: "C(3)", label: "Exemption indicator" },
        { field: "56", type: "0045", req: "C(3)", label: "Payment validity date" },
        { field: "56", type: "0046", req: "C(3)", label: "Initial transaction eCommerce data" },
        { field: "56", type: "0056", req: "C(108)", label: "Payment account reference (PAR)" },

        // ---- Field 59 TLVs (subset from remote SEC eCom) ----
        { field: "59", req: "C(2)", label: "National data" },
        { field: "59", type: "0100", req: "C(98)", label: "Function code" },
        { field: "59", type: "0101", req: "X", label: "Message reason code", flags: ["S"] },
        { field: "59", type: "0102", req: "X", label: "Transaction year", flags: ["S"] },
        { field: "59", type: "0200", req: "X", label: "ERT", flags: ["S"] },
        { field: "59", type: "0201", req: "X", label: "ITP SA", flags: ["S"] },
        { field: "59", type: "0202", req: "X", label: "Acceptor contract number" },
        { field: "59", type: "0203", req: "X", label: "Acceptance system logical number", flags: ["S"] },
        { field: "59", type: "0207", req: "C(6)", label: "Cardholder total amount" },
        { field: "59", type: "020B", req: "X", label: "TASA" },

        // eCom security / 3DS (subset; extend with your full list if needed)
        { field: "59", type: "0400", req: "C(99)", label: "Transaction identifier / cryptogram (acceptor)" },
        { field: "59", type: "0401", req: "C(122)", label: "Cardholder authentication value" },
        { field: "59", type: "0407", req: "C(17)", label: "Electronic commerce security type" },
        { field: "59", type: "0412", req: "C(102)", label: "Three-domain secure results" },
        { field: "59", type: "0416", req: "C(29)", label: "Electronic commerce indicator" },

        // ---- Field 119 TLVs (refund/MIT linkage) ----
        { field: "119", req: "C(2)", label: "Reserved for national use" },
        { field: "119", type: "0047", req: "C(156)", label: "Debit unique reference identifier" },
      ],
    },
  },

  // -------------------------------------------------------
  // Presence conditions: decide when C(n) becomes mandatory
  // -------------------------------------------------------
  presenceConditions: [
    // Remote/ecom: require payment use case
    { id: 3, description: "Payment use case related TLVs required for remote/ecom flows", match: { tagsAny: ["remote", "ecom"] }, action: { upgradeTo: "X" } },

    // 3DS flows
    { id: 155, description: "3DS protocol major version required for 3DS-secured payments", match: { tagsAny: ["3ds"] }, action: { upgradeTo: "X" } }, // 56.0022
    { id: 103, description: "UUID container required for 3DS-secured payments", match: { tagsAny: ["3ds"] }, action: { upgradeTo: "X" } }, // 56.0023
    { id: 102, description: "3DS results required for 3DS-secured payments", match: { tagsAny: ["3ds"] }, action: { upgradeTo: "X" } }, // 59.0412

    // MIT flows (subsequent merchant-initiated)
    { id: 156, description: "Original debit unique reference required for MIT/subsequent flows", match: { tagsAny: ["mit"] }, action: { upgradeTo: "X" } }, // 119.0047

    // Often you want these upgraded for MIT too (linking to initial eCom tx)
    { id: 108, description: "PAR required in some MIT/tokenized contexts (enable if needed)", match: { tagsAny: ["mit"] }, action: { upgradeTo: "X" } }, // 56.0056

    // Transaction datetime condition (C117) - you can force it to X if you always populate it
    { id: 117, description: "Transmission datetime typically populated by the switch", match: { tagsAny: ["remote", "ecom", "3ds", "mit"] }, action: { upgradeTo: "X" } },
  ],

  // ------------------------------------------------
  // Base construction defaults (structure + placeholders)
  // ------------------------------------------------
  constructionDefaults: {
    mti: "0100",
    fields: {
      // core fields
      "2": "<PAN>",
      "3": "<PROC_CODE>",
      "4": "<AMOUNT>",
      "7": "<MMDDhhmmss>",
      "11": "<STAN>",
      "12": "<hhmmss>",
      "13": "<MMDD>",
      "22": "<POS_ENTRY_MODE>",
      "25": "<POS_CONDITION_CODE>",
      "32": "<ACQUIRER_ID>",
      "41": "<TERMINAL_ID>",
      "42": "<ACCEPTOR_ID>",
      "49": "<CURRENCY_NUMERIC>",
      "53": "<SECURITY_CTRL_INFO>",

      // containers
      "55": { tlv: {} },
      "56": { tlv: {} },
      "59": { tlv: {} },
      "119": { tlv: {} },
    },
  },
};
