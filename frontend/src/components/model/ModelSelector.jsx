import { Cpu, Zap, Target } from "lucide-react";

const models = [
  {
    id: "yolo",
    name: "YOLO11n",
    description: "Fast real-time object detection",
    icon: Zap,
  },
  {
    id: "ssd",
    name: "SSD300",
    description: "Single Shot Detector",
    icon: Target,
  },
  {
    id: "cnn",
    name: "CNN / Faster R-CNN",
    description: "High-detail region detection",
    icon: Cpu,
  },
];

function ModelSelector({ selectedModel, onModelChange }) {
  return (
    <section className="model-selector">
      <div className="section-heading">
        <span>Detection Model</span>
        <h2>Select AI Model</h2>
      </div>

      <div className="model-grid">
        {models.map((model) => {
          const Icon = model.icon;
          const active = selectedModel === model.id;

          return (
            <button
              key={model.id}
              type="button"
              className={`model-card ${active ? "active" : ""}`}
              onClick={() => onModelChange(model.id)}
            >
              <div className="model-icon">
                <Icon size={22} />
              </div>

              <div className="model-info">
                <h3>{model.name}</h3>
                <p>{model.description}</p>
              </div>

              <div className="model-radio">
                <span />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default ModelSelector;