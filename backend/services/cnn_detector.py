
import os
import torch
from PIL import Image
import torchvision
from torchvision.transforms import functional as F

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "models",
    "cnn",
    "cnn_pkr_best.pth"
)

DEVICE = torch.device("cpu")

CLASS_NAMES = {
    1: "Rs. 10",
    2: "Rs. 100",
    3: "Rs. 1000",
    4: "Rs. 20",
    5: "Rs. 50",
    6: "Rs. 500",
    7: "Rs. 5000",
    8: "Rs. 75"
}

model = torchvision.models.detection.fasterrcnn_resnet50_fpn(
    weights=None,
    weights_backbone=None,
    num_classes=9
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
    weights_only=False
)

if "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
elif "state_dict" in checkpoint:
    model.load_state_dict(checkpoint["state_dict"])
else:
    model.load_state_dict(checkpoint)

model.to(DEVICE)
model.eval()


def detect_currency(image_path):
    image = Image.open(image_path).convert("RGB")
    tensor = F.to_tensor(image).to(DEVICE)

    with torch.no_grad():
        output = model([tensor])[0]

    detections = []

    for box, label, score in zip(
        output["boxes"],
        output["labels"],
        output["scores"]
    ):
        confidence = float(score)

        if confidence < 0.25:
            continue

        class_id = int(label)

        x1, y1, x2, y2 = box.tolist()

        detections.append({
            "currency": CLASS_NAMES.get(class_id, "Unknown"),
            "confidence": round(confidence, 4),
            "box": {
                "x1": round(x1, 2),
                "y1": round(y1, 2),
                "x2": round(x2, 2),
                "y2": round(y2, 2)
            }
        })

    return detections