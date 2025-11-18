// client/src/App.jsx
import { useState } from "react";
import CvUploadCard from "./components/CvUploadCard";

function App() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [pdfFilename, setPdfFilename] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async ({ cvFile, jobDescription }) => {
    try {
      setLoading(true);
      setError("");
      setAnalysis(null);
      setPdfFilename("");

      const formData = new FormData();
      formData.append("cv", cvFile);               // חייב להיות "cv"
      formData.append("jobDescription", jobDescription);

      const res = await fetch("http://localhost:3001/api/optimize-for-job", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "שגיאה בשרת");
      }

      setAnalysis(data.analysis);
      setPdfFilename(data.filename);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfFilename) return;
    window.location.href = `http://localhost:3001/api/download/${pdfFilename}`;
  };

  return (
    <div dir="rtl">
      <CvUploadCard onSubmit={handleSubmit} />

      {/* איזור תוצאות / שגיאות */}
      <div className="max-w-3xl mx-auto mt-6 px-4">
        {loading && <p>🔄 מבצעת אופטימיזציה, רגע...</p>}
        {error && <p style={{ color: "red" }}>❌ {error}</p>}

        {analysis && (
          <div className="mt-4 bg-white rounded-2xl shadow p-4 space-y-3">
            <h2 className="font-semibold text-lg">תוצאות ניתוח</h2>
            {analysis.score !== null && (
              <p>
                <strong>ציון התאמה:</strong> {analysis.score}
              </p>
            )}

            {analysis.keySkills?.length > 0 && (
              <>
                <h3 className="font-medium">מיומנויות מרכזיות:</h3>
                <ul className="list-disc pr-5 text-sm">
                  {analysis.keySkills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </>
            )}

            {analysis.missingSkills?.length > 0 && (
              <>
                <h3 className="font-medium">מיומנויות חסרות:</h3>
                <ul className="list-disc pr-5 text-sm">
                  {analysis.missingSkills.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </>
            )}

            {analysis.recommendations && (
              <>
                <h3 className="font-medium">המלצות:</h3>
                <p className="text-sm whitespace-pre-wrap">
                  {analysis.recommendations}
                </p>
              </>
            )}

            {pdfFilename && (
              <button
                onClick={handleDownload}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm text-white"
              >
                הורדת PDF משופר
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
