import "dotenv/config";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { SifiOutputSchema } from "./schema/sifi_types.js";
import type { SifiInput, SifiOutput } from "./schema/sifi_types.js";
import { SIFI_SYSTEM_PROMPT } from "./agent/prompt.js";

// ═══════════════════════════════════════════════════════════════════════════
// TEST PAYLOAD — The Workday RaaS Edge Case
// ═══════════════════════════════════════════════════════════════════════════

const TEST_PAYLOAD: SifiInput = {
    Customer_Commercial_Context: {
        annual_contract_value_usd: 80000,
        employee_headcount: 5500,
        data_volume_metrics:
            "250,000 annual applications, highly active M&A resulting in frequent candidate merge events.",
    },
    Integration_Scope: {
        vendor_system: "Workday",
        target_objects:
            "Merge Candidate Events (Real-time synchronization required)",
        customer_poc_profile:
            "HR Operations Lead (No API or programming experience)",
    },
    Technical_Payload: {
        api_constraints:
            "Workday standard SOAP API does not provide a timestamp parameter for candidate modification events. Real-time event subscription via Outbound EIB is blocked by customer IT.",
        error_logs:
            "Forced to use Custom Report-as-a-Service (RaaS) via polling. Frequent polling causes silent failures and staled data copies when merge events occur between polling intervals. No standard HTTP error codes.",
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE EVALUATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function evaluateIntegration(payload: SifiInput): Promise<SifiOutput> {
    const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
    });

    console.log("🚀 NovaEdge SIFI Engine — Evaluating integration...\n");
    console.log(`   Vendor: ${payload.Integration_Scope.vendor_system}`);
    console.log(
        `   ACV: $${payload.Customer_Commercial_Context.annual_contract_value_usd.toLocaleString()}`
    );
    console.log(
        `   Target: ${payload.Integration_Scope.target_objects}\n`
    );

    const completion = await client.chat.completions.parse({
        model: "gemini-2.5-flash",
        messages: [
            {
                role: "system",
                content: SIFI_SYSTEM_PROMPT,
            },
            {
                role: "user",
                content: `Evaluate the following SaaS integration payload and produce a complete SIFI assessment:\n\n${JSON.stringify(payload, null, 2)}`,
            },
        ],
        response_format: zodResponseFormat(SifiOutputSchema, "sifi_output"),
    });

    const result = completion.choices[0]?.message?.parsed;

    if (!result) {
        throw new Error(
            "LLM returned no parsed output. Check model availability and API key."
        );
    }

    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
    try {
        const result = await evaluateIntegration(TEST_PAYLOAD);

        console.log("═══════════════════════════════════════════════════════");
        console.log("  ✅  SIFI EVALUATION COMPLETE");
        console.log("═══════════════════════════════════════════════════════\n");

        // ── Complexity Assessment ──
        const assessment = result.SIFI_Complexity_Assessment;
        console.log(`📊 SIFI Score: ${assessment.total_score}/25 → Tier: ${assessment.tier}\n`);

        const dimensions = [
            ["Protocol Antiquity", assessment.Protocol_Antiquity],
            ["Schema Volatility", assessment.Schema_Volatility],
            ["Auth/Sandbox Friction", assessment.Auth_Sandbox_Friction],
            ["Error Observability", assessment.Error_Observability],
            ["POC Tech Maturity", assessment.POC_Tech_Maturity],
        ] as const;

        for (const [name, dim] of dimensions) {
            console.log(`   ${dim.score}/5  ${name}`);
            console.log(`         └─ ${dim.justification}\n`);
        }

        // ── Commercial Proposal ──
        const proposal = result.Commercial_Proposal;
        console.log("💰 Commercial Proposal");
        console.log(`   Fee: $${proposal.recommended_implementation_fee.toLocaleString()}`);
        console.log(`   Timeline: ${proposal.estimated_timeline}`);
        console.log(`   Breakdown: ${proposal.calculation_breakdown}`);
        console.log(`   ⚠️  Risk: ${proposal.deal_risk_warning}\n`);

        // ── Engineering Action Plan ──
        const plan = result.Engineering_Action_Plan;
        console.log("🔧 Engineering Action Plan");
        console.log(`   Internal Ticket:\n${indent(plan.internal_engineering_ticket, 6)}\n`);
        console.log(`   Customer Playbook:\n${indent(plan.customer_facing_playbook_draft, 6)}\n`);

        // ── Raw JSON ──
        console.log("═══════════════════════════════════════════════════════");
        console.log("  📋  RAW JSON OUTPUT");
        console.log("═══════════════════════════════════════════════════════\n");
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("❌ SIFI Engine Error:", error);
        process.exit(1);
    }
}

/** Indent multiline text for clean console output */
function indent(text: string, spaces: number): string {
    const pad = " ".repeat(spaces);
    return text
        .split("\n")
        .map((line) => `${pad}${line}`)
        .join("\n");
}

main();
