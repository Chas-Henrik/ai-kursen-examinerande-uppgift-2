import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { processDocument } from "@/lib/documentProcessor";
import { uploadEmbeddingsToPinecone } from "@/lib/pinecone";
import { connectDB } from "@/lib/mongodb";
import DocumentModel from "@/models/Document";
import fs from "fs";
import path from "path";

// Hantera icke-POST requests
export async function GET() {
  return NextResponse.json(
    { error: "Endast POST-metoden stöds för denna endpoint" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Endast POST-metoden stöds för denna endpoint" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Endast POST-metoden stöds för denna endpoint" },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  console.log("📤 Upload API anropad - PDF-parse fix implementerad");

  try {
    // Verifiera JWT token (från header eller cookies)
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") ||
      request.cookies.get("auth-token")?.value;

    console.log("🔐 Token finns:", !!token);

    if (!token) {
      console.log("❌ Ingen token hittad");
      return NextResponse.json(
        { error: "Ingen autentisering angiven. Du måste logga in." },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Ogiltig token. Logga in igen." },
        { status: 401 }
      );
    }

    // Konvertera NextRequest till Express-format för multer
    const formData = await request.formData();
    const file = formData.get("document") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Ingen fil uppladdad" },
        { status: 400 }
      );
    }

    // Validera filtyp
    const allowedTypes = [".pdf", ".txt", ".docx"];
    const fileExt = path.extname(file.name).toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
      return NextResponse.json(
        {
          error: `Filtyp ${fileExt} stöds inte. Tillåtna typer: ${allowedTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validera filstorlek (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Filen är för stor. Max storlek är 10MB." },
        { status: 400 }
      );
    }

    // Spara fil temporärt
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-_]/g, "_");
    const fileName = `${timestamp}-${sanitizedName}`;
    const filePath = path.join(uploadsDir, fileName);

    // Skriv fil till disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    try {
      // Bearbeta dokumentet
      console.log("🔄 Bearbetar dokument:", file.name);
      const documentData = await processDocument(filePath);

      // Ladda upp embeddings till Pinecone
      console.log("📊 Laddar upp embeddings till Pinecone...");
      await uploadEmbeddingsToPinecone(
        documentData.embeddings,
        documentData.chunks,
        {
          userId: user.userId,
          fileName: file.name,
          fileType: fileExt,
          uploadDate: new Date(),
          chunkCount: documentData.chunks.length,
          fileSize: file.size,
        },
        user.userId // namespace per användare
      );

      // Spara dokument metadata i MongoDB
      await connectDB();
      const document = new DocumentModel({
        userId: user.userId,
        filename: file.name,
        originalText: documentData.chunks.join("\n"),
        chunks: documentData.chunks,
        vectorIds: [], // Kommer fyllas i när vi har vector IDs från Pinecone
        fileType: fileExt,
        fileSize: file.size,
        uploadDate: new Date(),
        processed: true,
      });

      await document.save();

      // Rensa upp temporär fil
      fs.unlinkSync(filePath);

      return NextResponse.json({
        success: true,
        message: "Dokument uppladdades och bearbetades framgångsrikt",
        document: {
          id: document._id,
          fileName: document.filename,
          fileType: document.fileType,
          fileSize: document.fileSize,
          chunkCount: document.chunkCount,
          uploadDate: document.uploadDate,
        },
      });
    } catch (processingError) {
      // Rensa upp vid fel
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      console.error("Fel vid dokumentbearbetning:", processingError);
      return NextResponse.json(
        {
          error: `Fel vid bearbetning av dokument: ${
            processingError instanceof Error
              ? processingError.message
              : "Okänt fel"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Fel vid dokumentuppladdning:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "Ingen stack trace"
    );

    if (error instanceof Error && error.message.includes("Filtyp")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Ett oväntat fel uppstod vid uppladdning av dokument" },
      { status: 500 }
    );
  }
}
