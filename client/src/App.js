import CvUploadCard from "./components/CvUploadCard";

function App() {
  const handleOptimize = ({ cvFile, jobDescription }) => {
    // כאן את עושה את הקריאה ל־backend עם FormData
    // לדוגמה:
    // const formData = new FormData();
    // formData.append("cv", cvFile);
    // formData.append("jobDescription", jobDescription);
    // fetch("http://localhost:3001/api/optimize-for-job", { method: "POST", body: formData });
  };

  return <CvUploadCard onSubmit={handleOptimize} />;
}

export default App;
