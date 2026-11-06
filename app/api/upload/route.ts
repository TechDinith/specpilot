import { NextResponse } from "next/server";
import { extractText } from "unpdf";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  const mime = file.type || "";
  const ext = extOf(file.name);
  const isPdf = mime === "application/pdf" || ext === ".pdf";
  const isDocx =
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx";
  const isText =
    mime.startsWith("text/") || ext === ".txt" || ext === ".md" || ext === ".markdown";

  if (!isPdf && !isDocx && !isText) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: PDF, DOCX, TXT, MD" },
      { status: 415 },
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());

  let text = "";
  try {
    if (isPdf) {
      const result = (await extractText(new Uint8Array(buf), { mergePages: true })) as {
        totalPages: number;
        text: string | string[];
      };
      text = typeof result.text === "string" ? result.text : (result.text ?? []).join("\n\n");
    } else if (isDocx) {
      const mammothMod = (await import("mammoth")) as { extractRawText: (o: { buffer: Buffer }) => Promise<{ value: string }> };
      const r = await mammothMod.extractRawText({ buffer: buf });
      text = r.value;
    } else {
      text = buf.toString("utf-8");
    }
  } catch (e) {
    console.error("[upload] parse failed:", e);
    return NextResponse.json({ error: "Failed to parse file" }, { status: 422 });
  }

  // Normalize whitespace.
  text = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  if (!text) {
    return NextResponse.json({ error: "No text could be extracted from file" }, { status: 422 });
  }

  // Cap extracted text to avoid token blowups.
  const capped = text.slice(0, 8000);

  return NextResponse.json({
    filename: file.name,
    chars: text.length,
    text: capped,
  });
}