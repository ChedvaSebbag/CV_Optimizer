// api_request.js

// --- 1. ייבוא מודולים וקבועים ---
import axios from 'axios';

// קבועים עבור ה-Gemini API (נשלפים ממשתני סביבה)
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
const MODEL_NAME = 'gemini-2.5-flash';

/**
 * שולח את תוכן ה-CV ותיאור המשרה למודל השפה ומחזיר את תוצאת ההתאמה.
 *
 * @param {string} cvContent - תוכן קורות החיים כטקסט.
 * @param {string} jobDescription - תיאור המשרה כטקסט.
 * @returns {Promise<object>} - אובייקט ה-JSON המנותח שהוחזר על ידי המודל.
 */
export async function matchCVToJob(cvContent, jobDescription) {

    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY אינו מוגדר במשתני הסביבה.");
    }

  // --- 2. בניית הפרומפט ---
    const prompt = `
        **System Role: The Ultimate Resume Tailor & Senior Recruiter**

        **Instructions:**
        You are a highly experienced Senior Tech Recruiter. Your task is to create a new, fully tailored, and polished resume based on the provided Job Description (JD) and the candidate's Original Resume/CV. **NEVER** invent, fabricate, or add any experience.

        **🔶 Output Format Rule (STRICT HTML):**
        You MUST output the final tailored resume as a single, valid HTML file structure (including <html>, <head>, and <body> tags). The design must be clean, modern, and professional, using **CSS Inline or a <style> block** within the <head> tag. Do not include any commentary outside the HTML structure.

        **🔶 Required Structure & Styling:**
        * **Styling:** Use a professional, clean font (like Arial or Helvetica), and ensure strong visual separation between sections. Use light grey for subheadings and dark text for content.
        * **Sections:** The HTML content must include the following sections in order, using appropriate HTML tags (like <h1>, <h2>, <ul>, <li>):
            1.  **Header:** Name, tailored title, contact details.
            2.  **Professional Summary** (Fully rewritten for the JD).
            3.  **Experience & Projects** (Reordered by relevance, with bold keywords).
            4.  **Education & Relevant Courses.**
            5.  **Technical Skills** (Grouped logically; **BOLD** required skills).
            6.  **Languages.**

        **🔶 Key Tailoring Goals:**
        * Reorder content so the most relevant items are first.
        * Use the exact terminology and keywords from the JD.
        * **Bold** required skills in the 'Technical Skills' section.

        **🔶 Inputs Provided:**
        Job Description:
        ---
        ${jobDescription}
        ---

        Original Resume/CV:
        ---
        ${cvContent}
        ---

        **✅ Final Output Required:**
        A single, complete HTML document containing the fully rewritten, tailored resume.
    `;

    // --- 3. בניית ה-Payload ל-API ---
    const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            temperature: 0.2,
            // נסיר את responseMimeType: "application/json" כדי לקבל טקסט חופשי (HTML)
        }
    };
    // --- 4. שליחת הבקשה ---
    try {
        const response = await axios.post(API_URL, payload);

        // ניתוח התגובה של Gemini
        const responseText = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
             throw new Error("תגובת API לא תקינה או ריקה.");
        }

        // המודל מחזיר מחרוזת JSON, מנתחים אותה לאובייקט
        return JSON.parse(responseText);

    } catch (error) {
        // זורק את השגיאה לטיפול ב-server.js
        console.error('Axios Error:', error.message);
        throw error;
    }
}