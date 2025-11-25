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

System Role: Resume Tailor & Senior Recruiter
Analyze the following CV PDF and compare it to the provided job description. Perform these steps:

1. Keep only the most relevant experience, skills, and achievements for the job.
2. Omit any non-essential details, redundant sentences, or long explanations.
3. Rewrite the CV in very concise bullet points or brief lines.
4. Output a full HTML document with clean, professional styling.
5. Use a compact, small font size and minimal spacing between lines and sections.
6. Headings (h1, h2, h3) should be only slightly larger than the body text, keeping the layout dense.
7. Ensure the content fits as much as possible into one A4 page when converted to PDF.
8. Avoid extra margins or padding that could waste space.
9. Use a bit of color to highlight headings or key sections, but keep it professional.
10. Any hyperlinks should be clearly marked with a link icon or symbol, so they stand out.

Job Description:
${jobDescription}


`;




// const prompt = `
// System Role: Resume Tailor & Senior Recruiter

// You will receive a CV in PDF format (provided as Base64) and a job description. Your task:

// 1. Ignore any analysis or commentary.
// 2. Rewrite and tailor the CV to maximize fit for the job description.
// 3. Output only a clean, professional HTML document of the CV.
// 4. Use inline CSS to ensure a neat, readable layout. 
//    - Make the font concise and not too large.
//    - Include headings, sections for experience, skills, education, and contact info.
// 5. Do not include any text outside of the HTML document.

// Job Description:
// ${jobDescription}
// `;

// **System Role: Resume Tailor & Senior Recruiter**
// Rewrite and tailor this CV PDF according to the following job description:
// ---
// ${jobDescription}
// ---
// Output as a full HTML document with clean professional styling.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        pdfPart,
        prompt
      ]
    });
debugger
    return response.text;

  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
}
