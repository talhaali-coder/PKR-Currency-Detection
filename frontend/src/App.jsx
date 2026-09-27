import { useState } from "react";

import ModelPerformance from "./components/model/ModelPerformance";
import ModelSelector from "./components/model/ModelSelector";
import InputSelector from "./components/upload/InputSelector";
import FileUploader from "./components/upload/FileUploader";
import CameraDetector from "./components/camera/CameraDetector";
import DetectionResults from "./components/detection/DetectionResults";

import { detectCurrency, detectVideo } from "./services/api";

import "./App.css";

function App() {
  const [selectedModel, setSelectedModel] = useState("yolo");
  const [selectedInput, setSelectedInput] = useState("image");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (type) => {
    setSelectedInput(type);
    setFile(null);
    setResult(null);
    setError("");
  };

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError("");
  };

  const handleDetect = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      let response;

      if (selectedInput === "image") {
        response = await detectCurrency(file, selectedModel);
      } else {
        response = await detectVideo(file, selectedModel);
      }

      setResult(response);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Detection failed. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span>PKR</span> Currency Detection
        </div>

        <div className="status">
          <span className="status-dot" />
          AI Detection System
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <span className="hero-label">AI-POWERED CURRENCY RECOGNITION</span>

          <h1>
            Pakistani Currency
            <br />
            <span>Detection System</span>
          </h1>

          <p>
            Detect and identify Pakistani currency notes using YOLO11n,
            SSD300, and CNN / Faster R-CNN.
          </p>
        </section>

        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />

        <InputSelector
          selectedInput={selectedInput}
          onInputChange={handleInputChange}
        />

        {selectedInput === "camera" ? (
          <CameraDetector selectedModel={selectedModel} />
        ) : (
          <>
            <FileUploader
              inputType={selectedInput}
              file={file}
              onFileChange={handleFileChange}
            />

            <button
              type="button"
              className="detect-button"
              onClick={handleDetect}
              disabled={!file || loading}
            >
              {loading ? "Detecting..." : "Detect Currency"}
            </button>
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        <DetectionResults result={result} />
<ModelPerformance selectedModel={selectedModel} />
      </main>

      <footer className="footer">
        <span>PKR Currency Detection</span>
        <span>YOLO11n • SSD300 • CNN / Faster R-CNN</span>
      </footer>
    </div>
  );
}

export default App;