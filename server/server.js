import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Consolidated imports from api_request.js
import {
  uploadsDir,         // Directory for file uploads (needed by Multer)
  generatedDir,       // Directory for generated files (needed by download route)
  handleOptimizeForJob, // Main handler function (needed by POST route)
} from "./api_request.js";

dotenv.config();

// Define __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS - allows React client on 3000 to communicate with server on 3001
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Multer - Configure file upload to the 'uploadsDir'
const storage = multer.diskStorage({
  // Use the exported uploadsDir from api_request.js
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// 🔹 Main Route - Optimize CV for a specific job
app.post(
  "/api/optimize-for-job",
  upload.single("cv"),   // "cv" must match the FormData field name on the client side
  handleOptimizeForJob   // The handler function is exported from api_request.js
);

// 🔹 Route for downloading the generated file (recommendations text file)
app.get("/api/download/:filename", (req, res) => {
    const { filename } = req.params;
    // Use the statically imported generatedDir
    const filePath = path.join(generatedDir, filename); 
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(err.statusCode || 500).end();
      }
    });
});

// Server listener
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});