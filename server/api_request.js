import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Export Directory Paths
// נתיב לתיקייה שבה נשמרים קורות החיים שהועלו
export const uploadsDir = path.join(__dirname, "uploads");
// נתיב לתיקייה שבה נשמרים קובצי ההמלצות שנוצרו על ידי Gemini
export const generatedDir = path.join(__dirname, "generated");

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir);
}

// 2. Corrected Gemini Client Initialization
// יצירת לקוח Gemini (שימוש בשם המחלקה הנכון: GoogleGenerativeAI)
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// בחירת מודל
export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash" 
});

// פונקציה: המרת קובץ ל־base64 (משמשת גם ל-PDF)
export function fileToBase64(filePath, mimeType) {
  const fileBuffer = fs.readFileSync(filePath);
  return {
    mimeType: mimeType || "application/pdf", 
    data: fileBuffer.toString("base64")
  };
}

/**
 * פונקציה: שליחת בקשת עיבוד ל־Gemini
 * @param {string} promptText - הטקסט המנחה (תיאור משרה + הנחיות).
 * @param {{mimeType: string, data: string}} fileData - נתוני הקובץ ב-Base64.
 * @returns {Promise<string>} - טקסט התשובה מ-Gemini.
 */
export async function sendToGemini(promptText, fileData) {
  const result = await model.generateContent([
    { text: promptText },
    { inlineData: fileData },
  ]);

  const response = await result.response;
  return response.text;
}

/**
 * שמירת טקסט של המלצות לקובץ בתיקיית generated
 * @param {string} text - התוכן שנוצר על ידי Gemini.
 * @returns {string} - שם הקובץ שנוצר.
 */
function saveGeneratedContent(text) {
  // שמירת התוצאה כקובץ טקסט עם המלצות (במקום PDF משופר)
  const filename = `optimized-cv-recommendations-${Date.now()}.txt`;
  const filePath = path.join(generatedDir, filename);
  fs.writeFileSync(filePath, text, "utf8");
  return filename;
}


// 3. Export the Main Handler Function (req, res)
/**
 * פונקציה ראשית המטפלת בבקשת POST לשיפור קורות חיים.
 * @param {express.Request} req - אובייקט הבקשה (מכיל את הקובץ שהועלה ואת jobDescription).
 * @param {express.Response} res - אובייקט התגובה.
 */
export async function handleOptimizeForJob(req, res) {
  // req.file מגיע מ-Multer
  if (!req.file) {
    return res.status(400).json({ error: "לא נמצא קובץ קורות חיים (CV)." });
  }

  const { jobDescription } = req.body;
  if (!jobDescription) {
    // Clean up uploaded file if data is missing
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: "חסר תיאור משרה (jobDescription) בגוף הבקשה." });
  }

  const uploadedFilePath = req.file.path;
  
  try {
    // 1. Convert file to Base64
    const fileData = fileToBase64(uploadedFilePath, req.file.mimetype);

    // 2. Build the prompt
    const prompt = `Optimize the attached CV (which is in a PDF/document format) to better fit the following Job Description. Provide a clear, structured summary of suggested changes, focusing on keywords, experience alignment, and skills matching. Write the summary in HEBREW. Do not rewrite the entire CV. The Job Description is: ${jobDescription}`;

    // 3. Call the model
    const geminiResponseText = await sendToGemini(prompt, fileData);

    // 4. Save the response to the generated folder
    const generatedFileName = saveGeneratedContent(geminiResponseText);

    // 5. Clean up the original uploaded file
    fs.unlinkSync(uploadedFilePath);
    console.log(`קובץ קורות חיים מקורי נמחק: ${uploadedFilePath}`);

    // 6. Send the response back to the client
    res.json({
      message: "המלצות לשיפור קורות החיים נוצרו בהצלחה.",
      response_text: geminiResponseText,
      download_link: `/api/download/${generatedFileName}`, 
    });

  } catch (error) {
    console.error("שגיאה בתהליך שיפור קורות החיים:", error);
    if (fs.existsSync(uploadedFilePath)) {
        fs.unlinkSync(uploadedFilePath);
    }
    res.status(500).json({ error: "שגיאה פנימית בשרת במהלך עיבוד הבקשה." });
  }
}

// שינוי שם: היצוא המקורי pdfToBase64 שונה ל-fileToBase64, 
// אך נשאיר אותו כאן למען תאימות לאחור אם יש מקומות אחרים שמשתמשים בו
export const pdfToBase64 = fileToBase64;