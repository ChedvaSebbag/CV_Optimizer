import express from 'express';
import multer from 'multer';
import cors from 'cors';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchCVToJob } from './api_request.js';
import puppeteer from "puppeteer";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// תיקיות אחסון
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

const GENERATED_DIR = path.join(__dirname, 'generated');
if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// multer – קבלת קובץ בזיכרון
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * 🔵 יצירת PDF אמיתי מ־HTML באמצעות Puppeteer
 */
async function createPDFFromHTML(htmlContent, filename) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const filePath = path.join(GENERATED_DIR, filename);

  await page.pdf({
    path: filePath,
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return filename;
}

/**
 * 🔵 נקודת קצה: התאמת קורות חיים למשרה ויצירת PDF
 */
app.post('/api/optimize-for-job', upload.single('cv'), async (req, res) => {
  const jobDescription = req.body.jobDescription;
  const cvFile = req.file;

  if (!jobDescription || !cvFile) {
    return res.status(400).json({ success: false, message: 'חסרים קובץ CV ותיאור משרה.' });
  }

  const tempPath = path.join(UPLOADS_DIR, cvFile.originalname);
  fs.writeFileSync(tempPath, cvFile.buffer);

  try {
    // קבלת HTML מהפונקציה שמנתחת את הקו"ח מול המשרה
    const htmlContent = await matchCVToJob(tempPath, jobDescription);

    const filename = `resume_${Date.now()}.pdf`;

    await createPDFFromHTML(htmlContent, filename);

    // מחיקת קובץ CV המקורי שהועלה
    fs.unlinkSync(tempPath);

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

/**
 * 🔵 הורדת הקובץ שנוצר
 */
app.get('/api/download/:filename', (req, res) => {
  const filePath = path.join(GENERATED_DIR, req.params.filename);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.download(filePath, (err) => {
      if (!err) fs.unlinkSync(filePath); // מחיקה לאחר הורדה
    });
  } else {
    res.status(404).json({ success: false, message: 'קובץ לא נמצא.' });
  }
});

app.listen(PORT, () => console.log(`🚀 השרת פועל בכתובת http://localhost:${PORT}`));
