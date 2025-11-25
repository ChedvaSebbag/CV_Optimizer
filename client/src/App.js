import { useState } from "react";
import CvUploadCard from "./components/CvUploadCard";
import AnalysisResult from "./components/AnalysisResult";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [pdfFilename, setPdfFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // הפונקציה שרצה כשמגישים את הטופס ב-CvUploadCard
  const handleOptimize = async ({ cvFile, jobDescription }) => {
    setError("");
    setLoading(true);
    setAnalysis(null);
    setPdfFilename("");

    const formData = new FormData();
    formData.append("cv", cvFile);              // חייב להתאים ל-upload.single("cv")
    formData.append("jobDescription", jobDescription);

    try {
      debugger
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
      console.error(err);
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-100 py-8">
      <CvUploadCard onSubmit={handleOptimize} />

      {error && (
        <div className="max-w-2xl mx-auto mt-4" dir="rtl">
          <div className="rounded-2xl bg-rose-50 border border-rose-100 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        </div>
      )}

      <AnalysisResult
        analysis={analysis}
        pdfFilename={pdfFilename}
        onDownload={handleDownload}
        loading={loading}
      />
    </div>
  );
}

export default App;
