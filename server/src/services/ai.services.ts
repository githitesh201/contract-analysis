import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";
import pdfParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const AI_MODEL = "gemini-2.5-flash";

const getGeminiModel = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim().length < 12 || key.startsWith("local-")) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({
    model: AI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
};

const aiModel = getGeminiModel();

const inferContractTypeFromText = (text: string): string => {
  const normalized = text.toLowerCase();

  if (normalized.includes("non-disclosure") || normalized.includes("nda")) {
    return "Non-Disclosure Agreement";
  }
  if (normalized.includes("employment") || normalized.includes("employee")) {
    return "Employment";
  }
  if (normalized.includes("lease") || normalized.includes("landlord")) {
    return "Lease";
  }
  if (normalized.includes("purchase") || normalized.includes("buyer")) {
    return "Sales";
  }
  if (normalized.includes("service") || normalized.includes("scope of work")) {
    return "Service Agreement";
  }

  return "General Contract";
};

type Tier = "free" | "premium";

const buildFallbackAnalysis = (contractType: string, tier: Tier) => {
  const base = {
    risks: [
      {
        risk: "Ambiguous obligations",
        explanation:
          "Some duties may be broadly defined and could create interpretation disputes.",
        severity: "medium" as const,
      },
      {
        risk: "Termination imbalance",
        explanation:
          "Termination rights may favor one party and limit flexibility.",
        severity: "medium" as const,
      },
      {
        risk: "Liability exposure",
        explanation:
          "Liability limits may not fully protect against indirect losses.",
        severity: "high" as const,
      },
      {
        risk: "Payment timing uncertainty",
        explanation: "Payment triggers may be unclear or dependent on broad terms.",
        severity: "low" as const,
      },
      {
        risk: "Weak dispute language",
        explanation: "Dispute resolution details may not be comprehensive.",
        severity: "low" as const,
      },
    ],
    opportunities: [
      {
        opportunity: "Scope clarity improvements",
        explanation:
          "Defining deliverables and milestones clearly can reduce misunderstandings.",
        impact: "high" as const,
      },
      {
        opportunity: "Negotiable renewal terms",
        explanation:
          "Renewal and extension clauses can be tuned for better long-term value.",
        impact: "medium" as const,
      },
      {
        opportunity: "Performance-linked safeguards",
        explanation:
          "Adding objective KPIs can improve enforceability and transparency.",
        impact: "medium" as const,
      },
      {
        opportunity: "Stronger confidentiality wording",
        explanation:
          "Clarified confidentiality scope can better protect sensitive information.",
        impact: "low" as const,
      },
      {
        opportunity: "Balanced indemnity terms",
        explanation:
          "Refining indemnity language can reduce one-sided legal and financial risk.",
        impact: "low" as const,
      },
    ],
    summary: `This ${contractType} was analyzed in local demo mode. The structure appears usable, but obligations, termination, and liability sections should be reviewed and negotiated before signing.`,
    overallScore: 67,
  };

  if (tier === "free") {
    return base;
  }

  return {
    ...base,
    risks: [
      ...base.risks,
      {
        risk: "Jurisdiction mismatch",
        explanation:
          "Governing law and venue may increase litigation cost or complexity.",
        severity: "medium" as const,
      },
      {
        risk: "Data handling ambiguity",
        explanation:
          "Data ownership and retention language may not align with best practices.",
        severity: "medium" as const,
      },
    ],
    opportunities: [
      ...base.opportunities,
      {
        opportunity: "Defined change control process",
        explanation:
          "A formal change process helps manage scope changes without disputes.",
        impact: "high" as const,
      },
      {
        opportunity: "Explicit acceptance criteria",
        explanation:
          "Acceptance standards reduce delivery ambiguity and payment delays.",
        impact: "medium" as const,
      },
    ],
    recommendations: [
      "Clarify scope, deliverables, and acceptance criteria.",
      "Cap liability and exclude indirect damages where possible.",
      "Add objective milestones tied to payment terms.",
      "Define clear cure periods before termination.",
    ],
    keyClauses: [
      "Scope of Work",
      "Payment Terms",
      "Termination",
      "Confidentiality",
      "Liability and Indemnity",
      "Dispute Resolution",
    ],
    legalCompliance:
      "No legal opinion. Perform jurisdiction-specific legal review before execution.",
    negotiationPoints: [
      "Liability cap and indemnity scope",
      "Termination for convenience and notice period",
      "Payment timing and late-fee handling",
      "IP ownership and license rights",
    ],
    contractDuration: "As specified in agreement term section",
    terminationConditions:
      "Typically includes breach, insolvency, and convenience with notice.",
    financialTerms: {
      description: "Review fee schedule, payment milestones, and penalties.",
      details: [
        "Validate invoicing cycles",
        "Confirm taxes and pass-through costs",
        "Clarify refund or holdback terms",
      ],
    },
    performanceMetrics: ["Delivery timelines", "Quality benchmarks"],
    specificClauses:
      "Verify clauses specific to this contract type and applicable regulations.",
  };
};

const normalizeAnalysis = (
  raw: Record<string, any>,
  contractType: string,
  tier: Tier
) => {
  const fallback = buildFallbackAnalysis(contractType, tier);

  const risks = Array.isArray(raw.risks) && raw.risks.length > 0 ? raw.risks : fallback.risks;
  const opportunities =
    Array.isArray(raw.opportunities) && raw.opportunities.length > 0
      ? raw.opportunities
      : fallback.opportunities;
  const summary =
    typeof raw.summary === "string" && raw.summary.trim().length > 0
      ? raw.summary
      : fallback.summary;
  const overallScore =
    typeof raw.overallScore === "number"
      ? raw.overallScore
      : Number(raw.overallScore) || fallback.overallScore;

  return {
    ...fallback,
    ...raw,
    risks,
    opportunities,
    summary,
    overallScore,
  };
};

const tryParseJsonFromText = (text: string): Record<string, any> | null => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

export const extractTextFromPDF = async (fileBuffer: Buffer) => {
  try {
    const pdf = await getDocument({
      data: new Uint8Array(fileBuffer),
      // Serverless environments often fail to spin up a pdf.js worker.
      // Disabling the worker avoids "Error: {}" failures on Vercel.
      disableWorker: true,
    }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  } catch (error) {
    const details =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : String(error);
    try {
      const parsed = await pdfParse(fileBuffer);
      if (parsed.text && parsed.text.trim().length > 0) {
        return parsed.text;
      }
    } catch (fallbackError) {
      const fallbackDetails =
        fallbackError instanceof Error
          ? `${fallbackError.name}: ${fallbackError.message}`
          : String(fallbackError);
      throw new Error(
        `Failed to extract text from PDF. Error: ${details}. Fallback failed: ${fallbackDetails}`
      );
    }

    throw new Error(`Failed to extract text from PDF. Error: ${details}`);
  }
};

export const detectContractType = async (
  contractText: string
): Promise<string> => {
  if (!aiModel) {
    return inferContractTypeFromText(contractText);
  }

  const prompt = `
    Analyze the following contract text and determine the type of contract it is.
    Provide only the contract type as a single string (e.g., "Employment", "Non-Disclosure Agreement", "Sales", "Lease", etc.).
    Do not include any additional explanation or text.

    Contract text:
    ${contractText.substring(0, 2000)}
  `;

  try {
    const results = await aiModel.generateContent(prompt);
    const response = results.response;
    return response.text().trim();
  } catch {
    return inferContractTypeFromText(contractText);
  }
};

export const analyzeContractWithAI = async (
  contractText: string,
  tier: Tier,
  contractType: string
) => {
  if (!aiModel) {
    return buildFallbackAnalysis(contractType, tier);
  }

  let prompt;
  if (tier === "premium") {
    prompt = `
    Analyze the following ${contractType} contract and provide:
    1. A list of at least 10 potential risks for the party receiving the contract, each with a brief explanation and severity level (low, medium, high).
    2. A list of at least 10 potential opportunities or benefits for the receiving party, each with a brief explanation and impact level (low, medium, high).
    3. A comprehensive summary of the contract, including key terms and conditions.
    4. Any recommendations for improving the contract from the receiving party's perspective.
    5. A list of key clauses in the contract.
    6. An assessment of the contract's legal compliance.
    7. A list of potential negotiation points.
    8. The contract duration or term, if applicable.
    9. A summary of termination conditions, if applicable.
    10. A breakdown of any financial terms or compensation structure, if applicable.
    11. Any performance metrics or KPIs mentioned, if applicable.
    12. A summary of any specific clauses relevant to this type of contract.
    13. An overall score from 1 to 100.

    Return a JSON object only.
    `;
  } else {
    prompt = `
    Analyze the following ${contractType} contract and provide:
    1. At least 5 potential risks with severity.
    2. At least 5 potential opportunities with impact.
    3. A brief summary.
    4. An overall score from 1 to 100.

    Return a JSON object only.
    `;
  }

  prompt += `
    Contract text:
    ${contractText}
    `;

  try {
    const results = await aiModel.generateContent(prompt);
    const response = await results.response;
    const text = response
      .text()
      .replace(/```json\n?|\n?```/g, "")
      .trim();
    const parsed = tryParseJsonFromText(text);
    if (!parsed) {
      return buildFallbackAnalysis(contractType, tier);
    }
    return normalizeAnalysis(parsed, contractType, tier);
  } catch {
    return buildFallbackAnalysis(contractType, tier);
  }
};
