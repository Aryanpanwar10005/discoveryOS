import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  console.log("Enteredc")
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

  return new Promise((resolve) => {
    const python = spawn("python3", [
      path.join(process.cwd(), "python", "extract.py"),
      filePath,
    ]);

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", async (code) => {

      console.log("Exit code:", code);
      console.log("STDOUT:", stdout);
      console.log("STDERR:", stderr);
      if (stderr) {
        resolve(
          NextResponse.json(
            {
              success: false,
              error: stderr,
            },
            { status: 500 }
          )
        );
        return;
      }

      const result = JSON.parse(stdout);
      const { data, error } = await supabase
        .from("extracted")
        .insert({
          content: JSON.stringify(result),
          filetype: file.type,
        });

      if (error) {
        resolve(
          NextResponse.json(
            { error: error.message },
            { status: 500 }
          )
        );
        console.log("DATA:", data);
        console.log("ERROR:", error);
        return;
      }

      resolve(
        NextResponse.json({
          success: true,
          extracted: result,
        })
      );
    });
  });
}