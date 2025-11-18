import { useState } from "react";

export default function CvUploadCard({ onSubmit }) {
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setCvFile(file);
      setError("");
    } else {
      setError("נא להעלות קובץ PDF בלבד");
      setCvFile(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!cvFile) {
      setError("נא לבחור קובץ קורות חיים (PDF)");
      return;
    }
    if (!jobDescription.trim()) {
      setError("נא להכניס תיאור משרה");
      return;
    }

    setError("");

    if (onSubmit) {
      // נעביר החוצה ל־parent (למשל לקריאה ל־API)
      onSubmit({ cvFile, jobDescription });
    } else {
      console.log("CV File:", cvFile);
      console.log("Job Description:", jobDescription);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-100 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-sky-100 p-6 md:p-8"
        dir="rtl"
      >
        {/* כותרת */}
        <div className="mb-6 text-right">
          <p className="text-xs font-semibold tracking-[0.25em] text-cyan-500 mb-2">
            GEMINI AI · CV OPTIMIZER
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
            שיפור קורות חיים לפי משרה ספציפית
          </h1>
          <p className="text-sm md:text-base text-slate-500">
            העלי את קובץ ה-PDF של קורות החיים שלך, הדביקי את תיאור המשרה
            וקבלי גרסה משודרגת ומותאמת.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* אזור העלאת קובץ */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              קובץ קורות חיים (PDF)
            </label>

            <label
              className="flex flex-col items-center justify-center w-full border-2 border-dashed border-cyan-200 hover:border-cyan-400 transition-colors rounded-2xl bg-cyan-50/40 cursor-pointer px-4 py-6"
            >
              <span className="flex items-center gap-3 text-slate-600">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
                  {/* אייקון "ענן" קטן ב־SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-cyan-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.6"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 16a4 4 0 01.88-7.903A5 5 0 1119 11a3 3 0 01-.176 5.995H7z"
                    />
                  </svg>
                </span>
                <span className="flex flex-col text-right">
                  <span className="text-sm font-medium text-slate-800">
                    גררי לכאן קובץ PDF או לחצי לבחירה
                  </span>
                  <span className="text-xs text-slate-500">
                    עדיף קובץ עדכני ומעוצב, בגודל סביר
                  </span>
                </span>
              </span>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* תצוגת שם קובץ */}
            {cvFile && (
              <div className="mt-2 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 border border-slate-200">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-700">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-sky-600 text-[10px] font-semibold">
                    PDF
                  </span>
                  <span className="truncate max-w-[220px] md:max-w-xs">
                    {cvFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCvFile(null)}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                >
                  הסרה
                </button>
              </div>
            )}
          </div>

          {/* תיאור משרה */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              תיאור משרה
            </label>
            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm md:text-[0.95rem] text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition resize-none min-h-[150px]"
              placeholder="הדביקי כאן את תיאור המשרה המלא (כפי שהוא מופיע בלינקדאין/בלוח משרות)..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
            <p className="text-[11px] text-slate-400">
              טיפ: ככל שתיאור המשרה יהיה יותר מפורט, השיפור של קורות החיים יהיה יותר ממוקד.
            </p>
          </div>

          {/* הודעת שגיאה */}
          {error && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-2.5 text-xs md:text-sm text-rose-700 flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-500 text-[10px] font-bold">
                !
              </span>
              <span>{error}</span>
            </div>
          )}

          {/* כפתור */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-2.5 text-sm md:text-[0.95rem] font-semibold text-white shadow-lg shadow-cyan-500/30 hover:shadow-indigo-500/40 hover:translate-y-[1px] active:translate-y-[2px] transition-transform transition-shadow"
            >
              התחילי אופטימיזציה
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.75 3.75a.75.75 0 00-1.5 0v8.69L6.3 9.49a.75.75 0 10-1.06 1.06l4.25 4.25a.75.75 0 001.06 0l4.25-4.25a.75.75 0 10-1.06-1.06l-2.95 2.95V3.75z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
