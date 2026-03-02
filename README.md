<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Zod-3068B7?logo=zod&logoColor=white" alt="Zod" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/OpenAI_SDK-412991?logo=openai&logoColor=white" alt="OpenAI SDK" />
  <img src="https://img.shields.io/badge/Status-✅_Verified-brightgreen" alt="Verified" />
</p>

# 🚀 NovaEdge SIFI Engine

**An AI Copilot that turns messy SaaS integration chaos into priced, actionable delivery playbooks.**

NovaEdge ingests error logs and business context from enterprise HR/TA integrations (Workday, iCIMS, SAP SuccessFactors, etc.), evaluates them through a proprietary **SIFI (SaaS Integration Friction Index)** model, and outputs structured SOW pricing and engineering action plans — with zero JSON hallucination guaranteed via Zod-enforced Structured Outputs.

> Built for the **Amazon Nova Hackathon** as an FDE portfolio project.

---

## 🧠 What is SIFI?

The **SaaS Integration Friction Index** is a 5-dimensional scoring model (1–5 per dimension) that quantifies integration complexity:

| Dimension | What It Measures |
|-----------|-----------------|
| **Protocol Antiquity** | How outdated/non-standard the integration protocol is (REST → SOAP → FTP) |
| **Schema Volatility** | How frequently the vendor changes their API contract |
| **Auth & Sandbox Friction** | Pain of authentication flows and testing environments |
| **Error Observability** | How opaque error messages and debugging capabilities are |
| **POC Tech Maturity** | Technical capability of the customer's point-of-contact |

### Risk Tiers

| Tier | Score Range | Pricing Multiplier |
|------|-----------|-------------------|
| 🟢 Green | 5–9 | 1.0× |
| 🟡 Yellow | 10–14 | 1.3× |
| 🔴 Red | 15–19 | 1.7× |
| ⚫ Black | 20–25 | 2.5× |

**Pricing Formula**: `base_fee (10% ACV) × data_volume_multiplier × sifi_penalty`

---

## 📦 Output Structure

The engine produces a **strictly typed** JSON output with three sections:

```
SifiOutput
├── SIFI_Complexity_Assessment
│   ├── 5 dimension scores (each: score + justification)
│   ├── total_score
│   └── tier (Green | Yellow | Red | Black)
├── Commercial_Proposal
│   ├── calculation_breakdown
│   ├── recommended_implementation_fee
│   ├── estimated_timeline
│   └── deal_risk_warning
└── Engineering_Action_Plan
    ├── internal_engineering_ticket
    └── customer_facing_playbook_draft
```

The output shape is **enforced at the LLM API layer** via `zodResponseFormat()` — the model literally cannot hallucinate the JSON structure.

---

## 🏗️ Architecture

```
src/
├── index.ts              # Entry point — evaluates test payload
├── agent/
│   └── prompt.ts         # XML-tagged system prompt with SIFI rubric
└── schema/
    └── sifi_types.ts     # Zod schemas + TypeScript interfaces
```

**Key design decisions:**
- **LLM-agnostic**: Uses the OpenAI SDK pointed at Google's OpenAI-compatible endpoint. Model is a single config swap (`gemini-2.5-flash` → `gemini-3.1-pro-preview` → Amazon Nova Act)
- **Schema-first**: Zod schemas are the single source of truth — they generate both TypeScript types AND the JSON Schema sent to the LLM
- **No post-hoc parsing**: Structured Outputs guarantee the shape at the API level, not via regex or `JSON.parse` hacks

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** ≥ 18
- A **Google AI API key** (get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey))

### Setup

```bash
# Clone and install
git clone https://github.com/AlexFlanker/novaedge_sifi_engine.git
cd novaedge_sifi_engine
npm install

# Configure your API key
cp .env.example .env
# Edit .env:
#   OPENAI_API_KEY=AIza...
#   OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# Run the evaluation
npx tsx src/index.ts
```

### Verified Output (gemini-2.5-flash)

```
🚀 NovaEdge SIFI Engine — Evaluating integration...

   Vendor: Workday
   ACV: $80,000
   Target: Merge Candidate Events (Real-time synchronization required)

═══════════════════════════════════════════════════════
  ✅  SIFI EVALUATION COMPLETE
═══════════════════════════════════════════════════════

📊 SIFI Score: 23/25 → Tier: Black

   5/5  Protocol Antiquity
         └─ SOAP API, forced RaaS polling workaround

   5/5  Schema Volatility
         └─ Silent record mutations from M&A merge events

   4/5  Auth/Sandbox Friction
         └─ IT blocking Outbound EIB

   5/5  Error Observability
         └─ Silent failures, no HTTP error codes

   4/5  POC Tech Maturity
         └─ HR Ops Lead, zero API experience

💰 Commercial Proposal
   Fee: $40,000  ($8K base × 2.0× data × 2.5× Black penalty)
   Timeline: 10-16 weeks
```

---

## 🧪 Development

```bash
# Type-check (no API key required)
npx tsc --noEmit

# Run with live LLM
npx tsx src/index.ts
```

---

## 🗺️ Roadmap

- [ ] Swap to **Amazon Nova Act** for hackathon submission
- [ ] Add **NeMo Guardrails** for PII interception
- [ ] Multi-vendor payload support (iCIMS, SAP SuccessFactors, Greenhouse)
- [ ] Playbook export to PDF/Notion
- [ ] Triton Inference Server dynamic model routing

---

## 📄 License

MIT

---

<p align="center">
  <strong>NovaEdge</strong> — Because every SaaS integration is guilty until proven otherwise.
</p>
