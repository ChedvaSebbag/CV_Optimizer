import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/**
 * שולח קובץ PDF של CV ותיאור משרה למודל Gemini
 * ומחזיר HTML מותאם של קורות החיים.
 */
export async function matchCVToJob(pdfPath, jobDescription) {
  const pdfPart = {
    inlineData: {
      data: Buffer.from(fs.readFileSync(pdfPath)).toString('base64'),
      mimeType: 'application/pdf'
    }
  };

  const prompt = `
**System Role: Resume Tailor & Senior Recruiter**
Rewrite and tailor this CV PDF according to the following job description:
---
${jobDescription}
---
Output as a full HTML document with clean professional styling.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        pdfPart,
        prompt
      ]
    });

    return response.text;

  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
}
