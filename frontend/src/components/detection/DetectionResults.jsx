import { CheckCircle2, Target, Video } from "lucide-react";

function DetectionResults({ result }) {
  if (!result) {
    return null;
  }

  const detections = result.detections || [];

  const isVideo = result.type === "video" && result.video_url;

  return (
    <section className="detection-results">
      <div className="section-heading">
        <span>Analysis Complete</span>
        <h2>Detection Results</h2>
      </div>

      <div className="result-summary">
        <div className="result-status">
          <CheckCircle2 size={22} />

          <div>
            <strong>Detection completed</strong>

            <span>
              {result.type === "video"
                ? `${result.frames_processed || 0} frames processed`
                : `${detections.length} currency note(s) detected`}
            </span>
          </div>
        </div>

        <div className="result-model">
          <Target size={20} />
          <span>{result.model || "Selected Model"}</span>
        </div>
      </div>

      {isVideo && (
        <div className="processed-video">
          <div className="processed-video-heading">
            <div>
              <Video size={22} />
              <div>
                <strong>Processed Detection Video</strong>
                <span>
                  Bounding boxes, currency names and confidence are shown
                  directly on the video.
                </span>
              </div>
            </div>
          </div>

          <video
            className="result-video"
            controls
            playsInline
            preload="metadata"
            src={result.video_url}
          />

          <div className="video-stats">
            <div>
              <span>Model</span>
              <strong>{result.model}</strong>
            </div>

            <div>
              <span>Frames</span>
              <strong>{result.frames_processed}</strong>
            </div>

            <div>
              <span>Detections</span>
              <strong>{result.detections}</strong>
            </div>
          </div>
        </div>
      )}

      {!isVideo && (
        <>
          {detections.length > 0 ? (
            <div className="detections-list">
              {detections.map((detection, index) => (
                <div className="detection-item" key={index}>
                  <div>
                    <strong>{detection.currency}</strong>
                    <span>Detection #{index + 1}</span>
                  </div>

                  <div className="confidence">
                    {(detection.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-detections">
              <p>No currency notes were detected.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default DetectionResults;