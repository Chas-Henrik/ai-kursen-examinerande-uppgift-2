import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Säkerställ att uploads-mappen finns
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Konfiguration för fillagring
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Skapa säkert filnamn med timestamp
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-_]/g, '_');
    const fileName = `${timestamp}-${sanitizedName}`;
    cb(null, fileName);
  },
});

// Filfilter för säkerhet
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Tillåtna filtyper
  const allowedTypes = ['.pdf', '.txt', '.docx'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Filtyp ${fileExt} stöds inte. Tillåtna typer: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer-konfiguration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 1, // Endast en fil åt gången
  },
});

// Felhantering för multer-fel
export function handleMulterError(error: any) {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return 'Filen är för stor. Max storlek är 10MB.';
      case 'LIMIT_FILE_COUNT':
        return 'För många filer. Ladda upp en fil åt gången.';
      case 'LIMIT_UNEXPECTED_FILE':
        return 'Oväntat filnamn. Använd fältnamnet "document".';
      default:
        return `Fel vid filuppladdning: ${error.message}`;
    }
  }
  
  if (error.message.includes('Filtyp')) {
    return error.message;
  }
  
  return 'Ett oväntat fel uppstod vid filuppladdning.';
}
