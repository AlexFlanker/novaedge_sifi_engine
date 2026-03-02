import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// INPUT TYPES — Plain TypeScript (we control these, no runtime validation needed)
// ═══════════════════════════════════════════════════════════════════════════

export interface CustomerCommercialContext {
    /** Annual contract value in USD */
    annual_contract_value_usd: number;
    /** Total employee headcount of the customer org */
    employee_headcount: number;
    /** Free-text description of data volume and complexity */
    data_volume_metrics: string;
}

export interface IntegrationScope {
    /** The vendor system being integrated (e.g., "Workday", "iCIMS") */
    vendor_system: string;
    /** Target data objects and sync requirements */
    target_objects: string;
    /** Profile of the customer's point-of-contact */
    customer_poc_profile: string;
}

export interface TechnicalPayload {
    /** Known API constraints, limitations, or blockers */
    api_constraints: string;
    /** Raw or summarized error logs from integration attempts */
    error_logs: string;
}

export interface SifiInput {
    Customer_Commercial_Context: CustomerCommercialContext;
    Integration_Scope: IntegrationScope;
    Technical_Payload: TechnicalPayload;
}

// ═══════════════════════════════════════════════════════════════════════════
// OUTPUT ZOD SCHEMA — Enforced at the LLM API layer via zodResponseFormat
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Each SIFI dimension is scored 1–5 with a mandatory justification.
 */
const SifiDimensionSchema = z.object({
    score: z
        .number()
        .int()
        .min(1)
        .max(5)
        .describe("Severity score from 1 (trivial) to 5 (catastrophic)"),
    justification: z
        .string()
        .describe("Concise, evidence-based reasoning for the score"),
});

/**
 * The 5-dimensional SIFI Complexity Assessment.
 */
const SifiComplexityAssessmentSchema = z.object({
    Protocol_Antiquity: SifiDimensionSchema.describe(
        "How outdated or non-standard is the integration protocol (SOAP, FTP, proprietary SDK)?"
    ),
    Schema_Volatility: SifiDimensionSchema.describe(
        "How frequently does the vendor change their data schema or API contract?"
    ),
    Auth_Sandbox_Friction: SifiDimensionSchema.describe(
        "How painful is the authentication flow and sandbox/testing environment?"
    ),
    Error_Observability: SifiDimensionSchema.describe(
        "How opaque are error messages, logging, and debugging capabilities?"
    ),
    POC_Tech_Maturity: SifiDimensionSchema.describe(
        "How technically capable is the customer's point-of-contact?"
    ),
    total_score: z
        .number()
        .describe("Sum of all 5 dimension scores (range: 5–25)"),
    tier: z
        .enum(["Green", "Yellow", "Red", "Black"])
        .describe(
            "Risk tier: Green (5-9), Yellow (10-14), Red (15-19), Black (20-25)"
        ),
});

/**
 * Commercial pricing proposal derived from SIFI assessment.
 */
const CommercialProposalSchema = z.object({
    calculation_breakdown: z
        .string()
        .describe(
            "Step-by-step breakdown: base fee, data volume multiplier, SIFI penalty, final fee"
        ),
    recommended_implementation_fee: z
        .number()
        .describe("Final recommended fee in USD"),
    estimated_timeline: z
        .string()
        .describe("Estimated delivery timeline (e.g., '6-8 weeks')"),
    deal_risk_warning: z
        .string()
        .describe(
            "Explicit risk warnings and deal-breaker flags for Sales/CS teams"
        ),
});

/**
 * Engineering action plan with internal and customer-facing deliverables.
 */
const EngineeringActionPlanSchema = z.object({
    internal_engineering_ticket: z
        .string()
        .describe(
            "Detailed internal JIRA-style ticket: scope, acceptance criteria, blockers"
        ),
    customer_facing_playbook_draft: z
        .string()
        .describe(
            "Non-technical, customer-friendly guide for config steps they must complete"
        ),
});

// ─────────────────────────────────────────────────────────────────────────
// TOP-LEVEL OUTPUT SCHEMA
// ─────────────────────────────────────────────────────────────────────────

export const SifiOutputSchema = z.object({
    SIFI_Complexity_Assessment: SifiComplexityAssessmentSchema,
    Commercial_Proposal: CommercialProposalSchema,
    Engineering_Action_Plan: EngineeringActionPlanSchema,
});

/** Inferred TypeScript type from the Zod schema */
export type SifiOutput = z.infer<typeof SifiOutputSchema>;
