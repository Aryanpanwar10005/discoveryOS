import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { supabase } from "@/lib/supabase"

// Helper to spawn Python process
function spawnPython(scriptPath: string, args: string[]): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const python = spawn("python3", [scriptPath, ...args]);

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code: any) => {
      resolve({ stdout, stderr, code });
    });
  });
}

export async function POST(req: NextRequest) {
  console.log("Upload API called");
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "uploads");

  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);

  await fs.writeFile(filePath, bytes);

  try {
    // Step 1: Extract text from file
    console.log("Step 1: Extracting text from file...");
    const extractResult = await spawnPython(
      path.join(process.cwd(), "python", "extract.py"),
      [filePath]
    );

    if (extractResult.code !== 0) {
      console.error(extractResult.stderr);

      return NextResponse.json(
        {
          success: false,
          error: extractResult.stderr,
        },
        { status: 500 }
      );
    }

    let extractedText: string;
    try {
      const extractedData = JSON.parse(extractResult.stdout);
      extractedText = extractedData.text || extractResult.stdout;
    } catch {
      extractedText = extractResult.stdout;
    }

    console.log("Extracted text length:", extractedText.length);

    // Step 2: Run semantic analysis
    console.log("Step 2: Running semantic analysis...");
    const semanticResult = await spawnPython(
      path.join(process.cwd(), "python", "semantic_analysis.py"),
      [extractedText, file.name.replace(/\.[^.]+$/, ""), "auto"]
    );

    if (semanticResult.code !== 0) {
      console.error(semanticResult.stderr);

      return NextResponse.json(
        {
          success: false,
          error: semanticResult.stderr,
        },
        { status: 500 }
      );
    }

    let semanticAnalysis: any;
    try {
      semanticAnalysis = JSON.parse(semanticResult.stdout);
    } catch (e) {
      console.error("Failed to parse semantic analysis:", e);
      return NextResponse.json(
        { success: false, error: "Failed to parse analysis results" },
        { status: 500 }
      );
    }

    if (semanticAnalysis.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: semanticAnalysis.error ?? "Semantic analysis failed",
        },
        { status: 500 }
      );
    }

    console.log(
      "Semantic analysis successful, insights:",
      semanticAnalysis.dashboard?.total_insights ?? 0
    );
    // Step 3: Store in database
    console.log("Step 3: Storing analysis results in database...");

    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data, error } = await supabase
      .from("extracted")
      .insert({
        // File metadata
        filename: file.name,
        filetype: file.type || "unknown",
        file_size_bytes: bytes.length,

        // Document info
        document_id: documentId,
        raw_text: extractedText,
        raw_text_length: extractedText.length,

        // Complete analysis JSON (storing the entire DiscoveryOS response)
        analysis_results: semanticAnalysis,

        // Processing info
        processing_time_seconds: semanticAnalysis.processing_time || 0,
        model_used: semanticAnalysis.metadata?.model_used || "unknown",
        model_type: semanticAnalysis.metadata?.model_type || "balanced",

        // Status
        status: semanticAnalysis.status === "success" ? "completed" : "error",
        error_message: semanticAnalysis.error || null,
        processed_at: new Date().toISOString(),

        // Metadata
        metadata: {
          source: "api_upload",
          version: "1.0",
          insights_count: semanticAnalysis.dashboard?.total_insights ?? 0,
          insight_types: semanticAnalysis.dashboard?.insights_by_type ?? {}
        }
      })
      .select();

    if (error) {
      console.error("❌ Database insert error:", error);
      return NextResponse.json(
        { error: "Failed to store results: " + error.message },
        { status: 500 }
      );
    }

    console.log("✅ Successfully stored in database");
    console.log(`   Document ID: ${documentId}`);
    console.log(
      `   Insights: ${semanticAnalysis.dashboard?.total_insights ?? 0}`
    );
    console.log(`   Processing time: ${semanticAnalysis.processing_time}s`);

    // Step 4: Return response
    return NextResponse.json({
      success: true,
      extracted: semanticAnalysis,
      document_id: data?.[0]?.id,
      document_reference_id: documentId,
      insights_count: semanticAnalysis.dashboard?.total_insights ?? 0,
      processing_time: semanticAnalysis.processing_time,
      status: "completed",
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Unexpected error: " + String(error) },
      { status: 500 }
    );

  }
}

export async function GET(req: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("extracted")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rows: data || [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch upload history" },
      { status: 500 }
    );
  }
}
