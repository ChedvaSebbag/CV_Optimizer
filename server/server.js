// server.js (הקוד המאוחד עם שמירת קובץ והורדה נפרדת)

// --- 1. ייבוא מודולים ---
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import * as dotenv from 'dotenv';
import pdf from 'html-pdf'; 
import fs from 'fs';        // לטיפול בקבצים ושמירה זמנית
import path from 'path';    // לטיפול בנתיבים
import { fileURLToPath } from 'url'; // לצורך ES Modules
import { matchCVToJob } from './api_request.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// שיניתי את הפורט ל-3001 כפי שמופיע בקוד ה-React שלך
const PORT = process.env.PORT ; 
const UPLOADS_DIR = path.join(__dirname, 'temp_resumes');

// ודא שתיקיית השמירה הזמנית קיימת
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// --- 2. Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// הגדרת Multer לאחסון קבצים בזיכרון (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- 3. Route הראשי: אופטימיזציה ויצירת PDF ---

// Route: POST http://localhost:3001/api/optimize-for-job
app.post('/api/optimize-for-job', upload.single('cv'), async (req, res) => {
    // 3.1. חילוץ נתונים
    const jobDescription = req.body.jobDescription;
    // שם השדה הוא 'cv' כדי להתאים ל-formData.append("cv", cvFile) ב-React
    const cvFile = req.file; 

    // 3.2. אימות קלט
    if (!jobDescription || !cvFile) {
        return res.status(400).json({ success: false, message: 'חסרים קובץ CV ותיאור משרה.' });
    }

    // 3.3. המרה לטקסט קריא (פענוח Base64 בשרת)
    let cvContent;
    try {
        // ממיר את ה-Buffer ל-Base64 ומיד מפצח ל-String (UTF-8)
        cvContent = cvFile.buffer.toString('base64').toString('utf8');
        if (!cvContent.trim()) throw new Error('קובץ ריק.');
    } catch (e) {
        return res.status(400).json({ success: false, message: 'כשל בהמרת הקובץ לטקסט.' });
    }

    try {
        // 4. קריאה לפונקציית API לקבלת תוכן ה-HTML
        const response = await matchCVToJob(cvContent, jobDescription);
        const htmlContent = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!htmlContent) {
            throw new Error("המודל לא החזיר תוכן HTML תקין.");
        }

        // 5. יצירת שם קובץ ייחודי ושמירה זמנית
        const filename = `resume_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.pdf`;
        const filePath = path.join(UPLOADS_DIR, filename);

        // 6. הגדרות יצירת PDF
        const pdfOptions = { 
            format: 'A4', 
            orientation: 'portrait',
            border: { top: "0.8in", right: "0.8in", bottom: "0.8in", left: "0.8in" },
            timeout: 60000
        };

        // 7. המרת HTML ל-PDF ושמירה לקובץ
        pdf.create(htmlContent, pdfOptions).toFile(filePath, (err) => {
            if (err) {
                console.error('שגיאה ביצירת PDF:', err);
                return res.status(500).json({ success: false, message: 'כשל ביצירת קובץ PDF.' });
            }

            // 8. החזרת JSON ללקוח (כפי שה-React Component מצפה)
            // (הערה: ה-analysis בקוד ה-React הוא כעת null, כי המודל החזיר HTML. 
            // נחזיר הודעת הצלחה)
            res.json({
                success: true,
                message: 'קורות חיים מותאמים נוצרו בהצלחה.',
                analysis: 'התוכן המותאם נוצר כקובץ PDF.', // שינוי התוכן לטקסט הצלחה
                filename: filename // שם הקובץ לצורך הורדה עתידית
            });
        });

    } catch (error) {
        console.error('שגיאה בטיפול בבקשה:', error.message);
        const apiErrorDetails = error.response ? error.response.data : error.message;
        res.status(500).json({
            success: false,
            message: 'כשל בשליחת הבקשה למודל או בתהליך יצירת PDF.',
            details: apiErrorDetails
        });
    }
});

// --- 4. Route להורדת קובץ ---

// Route: GET http://localhost:3001/api/download/:filename
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(UPLOADS_DIR, filename);

    // בדיקה אם הקובץ קיים
    if (fs.existsSync(filePath)) {
        // שליחת הקובץ
        res.setHeader('Content-Type', 'application/pdf');
        res.download(filePath, (err) => {
            if (err) {
                console.error('שגיאה בשליחת קובץ:', err);
                // אם נכשל לשלוח, אל תמחק
            } else {
                // מחיקת הקובץ הזמני לאחר השליחה (לשמירה על ניקיון השרת)
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('שגיאה במחיקת קובץ זמני:', unlinkErr);
                });
            }
        });
    } else {
        res.status(404).json({ success: false, message: 'קובץ לא נמצא.' });
    }
});


// --- 5. הפעלת השרת ---
app.listen(PORT, () => {
    console.log(`🚀 השרת פועל בכתובת: http://localhost:${PORT}`);
});