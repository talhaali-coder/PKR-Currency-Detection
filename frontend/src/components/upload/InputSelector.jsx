import { Image, Video, Camera } from "lucide-react";

const inputTypes = [
  {
    id: "image",
    name: "Image",
    description: "Upload a currency image",
    icon: Image,
  },
  {
    id: "video",
    name: "Video",
    description: "Analyze a currency video",
    icon: Video,
  },
  {
    id: "camera",
    name: "Camera",
    description: "Detect currency live",
    icon: Camera,
  },
];

function InputSelector({ selectedInput, onInputChange }) {
  return (
    <section className="input-selector">
      <div className="section-heading">
        <span>Input Source</span>
        <h2>Choose Detection Mode</h2>
      </div>

      <div className="input-grid">
        {inputTypes.map((input) => {
          const Icon = input.icon;
          const active = selectedInput === input.id;

          return (
            <button
              key={input.id}
              type="button"
              className={`input-card ${active ? "active" : ""}`}
              onClick={() => onInputChange(input.id)}
            >
              <div className="input-icon">
                <Icon size={24} />
              </div>

              <div className="input-info">
                <h3>{input.name}</h3>
                <p>{input.description}</p>
              </div>

              <div className="input-radio">
                <span />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default InputSelector;