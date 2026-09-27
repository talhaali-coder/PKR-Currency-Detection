
import {
  Target,
  Crosshair,
  Gauge,
  Timer,
  Layers,
  Database,
  Info,
} from "lucide-react";

const models = {
  yolo: {
    name: "YOLO11n",
    subtitle: "You Only Look Once",
    description:
      "Single-stage object detection model optimized for real-time Pakistani currency detection.",
    precision: "89.60%",
    recall: "88.90%",
    f1: "89.20%",
    map50: "90.70%",
    map5095: "47.50%",
    fps: "107.50",
    inference: "~9.3 ms",
    images: "2,801",
    epochs: "50",
  },

  ssd: {
    name: "SSD300",
    subtitle: "Single Shot Detector",
    description:
      "Single-stage object detection model using a VGG16 backbone for Pakistani currency recognition.",
    precision: "73.64%",
    recall: "69.17%",
    f1: "71.33%",
    map50: "73.64%*",
    map5095: "33.28%*",
    fps: "42.92",
    inference: "~23.3 ms",
    images: "2,801",
    epochs: "30",
  },

  cnn: {
    name: "CNN / Faster R-CNN",
    subtitle: "ResNet50 + FPN",
    description:
      "Two-stage object detection architecture using ResNet50 with Feature Pyramid Network.",
    precision: "58.97%",
    recall: "78.93%",
    f1: "67.51%",
    map50: "74.08%",
    map5095: "33.57%",
    fps: "10.52",
    inference: "~95.1 ms",
    images: "800",
    epochs: "3",
  },
};

const metrics = [
  {
    key: "precision",
    label: "Precision",
    icon: Target,
  },
  {
    key: "recall",
    label: "Recall",
    icon: Crosshair,
  },
  {
    key: "f1",
    label: "F1 Score",
    icon: Gauge,
  },
  {
    key: "map50",
    label: "mAP @50",
    icon: Target,
  },
  {
    key: "map5095",
    label: "mAP @50–95",
    icon: Target,
  },
  {
    key: "fps",
    label: "FPS",
    icon: Gauge,
  },
  {
    key: "inference",
    label: "Inference",
    icon: Timer,
  },
];

function ModelPerformance({ selectedModel }) {
  const model = models[selectedModel] || models.yolo;

  return (
    <section className="model-performance">
      <div className="section-heading">
        <span>Model Analysis</span>

        <h2>{model.name} Performance</h2>

        <p className="performance-intro">
          Performance details for the currently selected
          currency detection model.
        </p>
      </div>

      <div className="performance-main-card">
        <div className="performance-header">
          <div>
            <span className="performance-model-type">
              {model.subtitle}
            </span>

            <h3>{model.name}</h3>
          </div>

          <div className="model-badge">
            8 Classes
          </div>
        </div>

        <p className="performance-description">
          {model.description}
        </p>

        <div className="metric-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                className="metric-item"
                key={metric.key}
              >
                <div className="metric-icon">
                  <Icon size={17} />
                </div>

                <div>
                  <span>{metric.label}</span>

                  <strong>
                    {model[metric.key]}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        <div className="training-details">
          <div>
            <Database size={17} />

            <div>
              <span>Training Images</span>
              <strong>{model.images}</strong>
            </div>
          </div>

          <div>
            <Layers size={17} />

            <div>
              <span>Training Epochs</span>
              <strong>{model.epochs}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="performance-note">
        <Info size={17} />

        <p>
          SSD mAP values marked with * were calculated
          using the project's simplified custom evaluation
          method. Training conditions were not identical
          across all three models.
        </p>
      </div>
    </section>
  );
}

export default ModelPerformance;