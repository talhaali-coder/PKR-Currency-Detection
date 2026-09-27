import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

function CameraDetector({ selectedModel = "yolo" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const processingRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const [detections, setDetections] = useState([]);

  const startDetection = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      detectFrame();
    }, 700);
  };

  const detectFrame = async () => {
    if (
      processingRef.current ||
      !videoRef.current ||
      videoRef.current.readyState < 2
    ) {
      return;
    }

    processingRef.current = true;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.75);
      });

      if (!blob) {
        return;
      }

      const formData = new FormData();

      formData.append(
        "file",
        blob,
        "camera-frame.jpg"
      );

      formData.append(
        "model",
        selectedModel
      );

      const response = await axios.post(
        `${API_URL}/detect`,
        formData
      );

      setDetections(response.data.detections || []);

      drawDetections(
        response.data.detections || []
      );
    } catch (error) {
      console.error("Camera detection error:", error);
    } finally {
      processingRef.current = false;
    }
  };

  const drawDetections = (items) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    context.clearRect(
      0,
      0,
      width,
      height
    );

    items.forEach((detection) => {
      const box = detection.box;

      if (!box) {
        return;
      }

      const x1 = Number(box.x1);
      const y1 = Number(box.y1);
      const x2 = Number(box.x2);
      const y2 = Number(box.y2);

      const boxWidth = x2 - x1;
      const boxHeight = y2 - y1;

      context.strokeStyle = "#ef4444";
      context.lineWidth = 3;

      context.strokeRect(
        x1,
        y1,
        boxWidth,
        boxHeight
      );

      const label =
        `${detection.currency} ` +
        `${(detection.confidence * 100).toFixed(1)}%`;

      context.font = "bold 16px Arial";

      const textWidth =
        context.measureText(label).width;

      const labelHeight = 26;

      context.fillStyle = "#b91c1c";

      context.fillRect(
        x1,
        Math.max(0, y1 - labelHeight),
        textWidth + 12,
        labelHeight
      );

      context.fillStyle = "#ffffff";

      context.fillText(
        label,
        x1 + 6,
        Math.max(18, y1 - 8)
      );
    });
  };

  const startCamera = async () => {
    try {
      setError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      setCameraActive(true);

      setTimeout(() => {
        startDetection();
      }, 500);
    } catch (error) {
      console.error(error);

      setError(
        "Camera access was denied or is unavailable."
      );
    }
  };

  const stopCamera = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    const canvas = canvasRef.current;

    if (canvas) {
      const context = canvas.getContext("2d");

      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
    }

    setDetections([]);
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <section className="camera-detector">
      <div className="section-heading">
        <span>Live Detection</span>
        <h2>Detect Currency From Camera</h2>
      </div>

      <div className="camera-preview">
        {!cameraActive && (
          <div className="camera-placeholder">
            <Camera size={42} />

            <h3>Camera is not active</h3>

            <p>
              Start the camera to detect Pakistani
              currency.
            </p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={
            cameraActive
              ? "camera-video active"
              : "camera-video"
          }
        />

        <canvas
          ref={canvasRef}
          className="camera-overlay"
        />
      </div>

      {cameraActive && (
        <div className="camera-status">
          <span className="status-dot" />

          <span>
            {detections.length > 0
              ? `${detections.length} currency note(s) detected`
              : "Scanning for currency..."}
          </span>

          <strong>
            {selectedModel.toUpperCase()}
          </strong>
        </div>
      )}

      {error && (
        <p className="camera-error">
          {error}
        </p>
      )}

      <div className="camera-actions">
        {!cameraActive ? (
          <button
            type="button"
            className="primary-button"
            onClick={startCamera}
          >
            <Camera size={20} />
            Start Camera
          </button>
        ) : (
          <button
            type="button"
            className="secondary-button"
            onClick={stopCamera}
          >
            <CameraOff size={20} />
            Stop Camera
          </button>
        )}
      </div>
    </section>
  );
}

export default CameraDetector;