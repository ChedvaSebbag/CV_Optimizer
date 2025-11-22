import express from 'express';
import multer from 'multer';
import cors from 'cors';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchCVToJob } from './api_request.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
const GENERATED_DIR = path.join(__dirname, 'generated');
if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * יוצר PDF חדש מ-HTML או טקסט
 */
async function createPDFFromHTML(htmlContent, filename) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const { width, height } = page.getSize();
  const fontSize = 12;

  page.drawText(htmlContent, {
    x: 50,
    y: height - 50,
    size: fontSize,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
    maxWidth: width - 100
  });

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(GENERATED_DIR, filename);
  fs.writeFileSync(filePath, pdfBytes);
  return filename;
}

app.post('/api/optimize-for-job', upload.single('cv'), async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const cvFile = req.file;

  if (!jobDescription || !cvFile) {
    return res.status(400).json({ success: false, message: 'חסרים קובץ CV ותיאור משרה.' });
  }

  const tempPath = path.join(UPLOADS_DIR, cvFile.originalname);
  fs.writeFileSync(tempPath, cvFile.buffer);

  try {
    const htmlContent = await matchCVToJob(tempPath, jobDescription);
    const filename = `resume_${Date.now()}.pdf`;
    await createPDFFromHTML(htmlContent, filename);

    fs.unlinkSync(tempPath); // מחיקת הקובץ הזמני

    res.json({
      success: true,
      message: 'קורות חיים מותאמים נוצרו בהצלחה.',
      analysis: 'התוכן המותאם נוצר כקובץ PDF.',
      filename
    });

  } catch (error) {
    fs.unlinkSync(tempPath);
    console.error('שגיאה בטיפול בבקשה:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(GENERATED_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.download(filePath, (err) => {
      if (!err) fs.unlinkSync(filePath); // אפשרי למחיקה אחרי הורדה
    });
  } else {
    res.status(404).json({ success: false, message: 'קובץ לא נמצא.' });
  }
});

app.listen(PORT, () => console.log(`🚀 השרת פועל בכתובת http://localhost:${PORT}`));
