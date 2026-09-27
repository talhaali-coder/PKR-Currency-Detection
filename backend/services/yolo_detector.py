
from ultralytics import YOLO
import os

MODEL_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "models",
        "yolo",
        "best.pt"
    )
)

model = YOLO(MODEL_PATH)

CLASS_NAMES = {
    0: "Rs. 10",
    1: "Rs. 100",
    2: "Rs. 1000",
    3: "Rs. 20",
    4: "Rs. 50",
    5: "Rs. 500",
    6: "Rs. 5000",
    7: "Rs. 75"
}


def detect_currency(image_path):
    results = model(image_path, conf=0.25)

    detections = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            x1, y1, x2, y2 = box.xyxy[0].tolist()

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