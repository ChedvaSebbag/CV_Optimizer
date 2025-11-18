import React from "react";

export default function AnalysisResult({ analysis, pdfFilename, onDownload, loading }) {
  if (loading) {
    return (
      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-sky-50 px-5 py-2 shadow-sm border border-sky-100">
          <span className="h-3 w-3 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
          <span className="text-sm text-slate-600">מבצעת אופטימיזציה לקו"ח…</span>
        </div>
      </div>
    );
  }

  if (!analysis) {
    // אם עדיין אין תוצאות – לא מציגים כלום
    return null;
  }

  return (
    <div className="mt-8 max-w-3xl mx-auto" dir="rtl">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-sky-100 p-6 md:p-8 space-y-6">
        {/* כותרת */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
              ניתוח התאמה למשרה
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              זהו סיכום הניתוח של Gemini AI ביחס לקורות החיים והמשרה שבחרת.
            </p>
          </div>

          {typeof analysis.score !== "undefined" && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-sky-500 to-indigo-500 px-4 py-3 text-white shadow-lg">
              <span className="text-[11px] uppercase tracking-[0.15em] opacity-80">
                SCORE
              </span>
              <span className="text-2xl md:text-3xl font-bold leading-none">
                {analysis.score}
              </span>
              <span className="text-[11px] mt-1 opacity-90">
                ציון התאמה / 100
              </span>
            </div>
          )}
        </div>

        {/* מיומנויות מרכזיות */}
        {analysis.keySkills && analysis.keySkills.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              מיומנויות מרכזיות שכדאי להדגיש
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.keySkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-xs text-sky-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* מיומנויות חסרות */}
        {analysis.missingSkills && analysis.missingSkills.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              מיומנויות שכדאי לחזק / להוסיף
            </h3>
            <ul className="list-disc pr-5 space-y-1 text-sm text-slate-700">
              {analysis.missingSkills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </section>
        )}

        {/* המלצות טקסטואליות */}
        {analysis.recommendations && (
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              המלצות ספציפיות לשיפור
            </h3>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 leading-relaxed">
              {analysis.recommendations}
            </div>
          </section>
        )}

        {/* טקסט מלא של קו"ח משופרים – אופציונלי */}
        {analysis.improvedCvText && (
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              נוסח קורות חיים משופר (טקסט)
            </h3>
            <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 max-h-72 overflow-y-auto text-xs md:text-sm text-slate-800 whitespace-pre-wrap">
              {analysis.improvedCvText}
            </div>
          </section>
        )}

        {/* כפתור הורדת PDF */}
        {pdfFilename && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 hover:shadow-xl transition"
            >
              הורדת קובץ PDF משופר
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.75 3.75a.75.75 0 00-1.5 0v8.19L7.3 9.99a.75.75 0 00-1.06 1.06l3.25 3.25a.75.75 0 001.06 0l3.25-3.25a.75.75 0 10-1.06-1.06l-1.95 1.95V3.75z" />
                <path d="M4 13.75A2.75 2.75 0 016.75 11h6.5A2.75 2.75 0 0116 13.75v.5A2.75 2.75 0 0113.25 17h-6.5A2.75 2.75 0 014 14.25v-.5z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
