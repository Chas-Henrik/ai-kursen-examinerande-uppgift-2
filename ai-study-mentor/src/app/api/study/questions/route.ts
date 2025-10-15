import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Document from '@/models/Document';
import { generateStudyQuestions } from '@/lib/questionGenerator';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Autentisering krävs' },
        { status: 401 }
      );
    }

    const { documentId, questionCount = 10, difficulty = 'medel' } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Dokument-ID krävs' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the document and verify ownership
    const document = await Document.findOne({
      _id: documentId,
      userId: user.userId
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Dokument hittades inte eller du har inte behörighet' },
        { status: 404 }
      );
    }

    if (!document.processed) {
      return NextResponse.json(
        { error: 'Dokumentet bearbetas fortfarande' },
        { status: 400 }
      );
    }

    // Generate study questions from document content
    const questions = await generateStudyQuestions(
      document.originalText,
      questionCount,
      difficulty
    );

    return NextResponse.json({
      success: true,
      message: 'Studiefrågor genererade framgångsrikt',
      questions,
      document: {
        id: document._id,
        filename: document.filename
      }
    });

  } catch (error) {
    console.error('Error generating study questions:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid generering av studiefrågor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Autentisering krävs' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get all documents for the user
    const documents = await Document.find({
      userId: user.userId,
      processed: true
    }).select('_id filename fileType uploadDate').sort({ uploadDate: -1 });

    return NextResponse.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc._id,
        filename: doc.filename,
        fileType: doc.fileType,
        uploadDate: doc.uploadDate
      }))
    });

  } catch (error) {
    console.error('Error fetching documents for study:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid hämtning av dokument' },
      { status: 500 }
    );
  }
}