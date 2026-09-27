
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager

import os
import uuid
import cv2
import subprocess

from services.yolo_detector import detect_currency as detect_yolo
from services.ssd_detector import detect_currency as detect_ssd
from services.cnn_detector import detect_currency as detect_cnn


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
RESULT_DIR = os.path.join(UPLOAD_DIR, "results")

YOLO_MODEL = os.path.join(
    BASE_DIR,
    "models",
    "yolo",
    "best.pt"
)

SSD_MODEL = os.path.join(
    BASE_DIR,
    "models",
    "ssd",
    "ssd300_pkr_pretrained_best.pth"
)

CNN_MODEL = os.path.join(
    BASE_DIR,
    "models",
    "cnn",
    "cnn_pkr_best.pth"
)


os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):

    print("=" * 50)
    print("PKR CURRENCY DETECTION API")
    print("=" * 50)

    print("\nChecking required models...")

    models = {
        "YOLO": YOLO_MODEL,
        "SSD": SSD_MODEL,
        "CNN": CNN_MODEL
    }

    for name, path in models.items():

        if os.path.isfile(path):
            size_mb = os.path.getsize(path) / (1024 * 1024)

            print(
                f"[OK] {name} model found "
                f"({size_mb:.2f} MB)"
            )

        else:
            print(
                f"[ERROR] {name} model missing:"
            )
            print(path)

            raise RuntimeError(
                f"{name} model was not found."
            )

    print("\nChecking detector functions...")

    detectors = {
        "YOLO": detect_yolo,
        "SSD": detect_ssd,
        "CNN": detect_cnn
    }

    for name, detector in detectors.items():

        if callable(detector):
            print(f"[OK] {name} detector loaded")
        else:
            raise RuntimeError(
                f"{name} detector is not callable."
            )

    print("\nChecking OpenCV...")

    if cv2.__version__:
        print(
            f"[OK] OpenCV {cv2.__version__}"
        )

    print("\nChecking directories...")

    print(f"[OK] Upload directory: {UPLOAD_DIR}")
    print(f"[OK] Result directory: {RESULT_DIR}")

    print("\nAll startup checks passed.")
    print("API is ready.")
    print("=" * 50)

    yield

    print("\nPKR Currency Detection API stopped.")


app = FastAPI(
    title="PKR Currency Detection API",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ALLOWED_MODELS = {
    "yolo": detect_yolo,
    "ssd": detect_ssd,
    "cnn": detect_cnn
}


IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".bmp"
}


VIDEO_EXTENSIONS = {
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm"
}


MAX_FILE_SIZE = 100 * 1024 * 1024


def get_detector(model_name):

    model_name = model_name.lower().strip()

    if model_name not in ALLOWED_MODELS:
        raise HTTPException(
            status_code=400,
            detail="Invalid model. Choose yolo, ssd, or cnn."
        )

    return ALLOWED_MODELS[model_name]


async def save_upload(file, allowed_extensions):

    original_name = file.filename or ""

    extension = os.path.splitext(
        original_name
    )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type."
        )

    filename = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    total_size = 0

    try:

        with open(file_path, "wb") as buffer:

            while True:

                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:

                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "File is too large. "
                            "Maximum size is 100 MB."
                        )
                    )

                buffer.write(chunk)

    except HTTPException:

        if os.path.exists(file_path):
            os.remove(file_path)

        raise

    except Exception as error:

        if os.path.exists(file_path):
            os.remove(file_path)

        raise HTTPException(
            status_code=500,
            detail=f"Could not save file: {error}"
        )

    return file_path, original_name


@app.get("/")
def home():

    return {
        "message": (
            "PKR Currency Detection API "
            "is running"
        ),
        "models": [
            "yolo",
            "ssd",
            "cnn"
        ],
        "media": [
            "image",
            "video"
        ]
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "models": [
            "yolo",
            "ssd",
            "cnn"
        ]
    }
@app.post("/detect")
async def detect(
    file: UploadFile = File(...),
    model: str = Form("yolo")
):

    detector = get_detector(model)

    file_path = None

    try:

        file_path, original_name = await save_upload(
            file,
            IMAGE_EXTENSIONS
        )

        detections = detector(file_path)

        return {
            "filename": original_name,
            "model": model,
            "type": "image",
            "detections": detections,
            "count": len(detections)
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Image detection failed: {error}"
        )

    finally:

        if file_path and os.path.exists(file_path):
            os.remove(file_path)    
    
@app.post("/detect-video")
async def detect_video(
    file: UploadFile = File(...),
    model: str = Form("yolo")
):

    detector = get_detector(model)

    input_path = None
    temporary_frame = None
    temporary_video = None
    output_path = None

    try:

        input_path, original_name = await save_upload(
            file,
            VIDEO_EXTENSIONS
        )

        video = cv2.VideoCapture(input_path)

        if not video.isOpened():

            raise HTTPException(
                status_code=400,
                detail="Could not open the uploaded video."
            )

        fps = video.get(cv2.CAP_PROP_FPS)

        if fps <= 0:
            fps = 25

        width = int(
            video.get(cv2.CAP_PROP_FRAME_WIDTH)
        )

        height = int(
            video.get(cv2.CAP_PROP_FRAME_HEIGHT)
        )

        if width <= 0 or height <= 0:

            video.release()

            raise HTTPException(
                status_code=400,
                detail="Invalid video dimensions."
            )

        output_filename = f"{uuid.uuid4().hex}.mp4"

        output_path = os.path.join(
            RESULT_DIR,
            output_filename
        )

        temporary_video = os.path.join(
            RESULT_DIR,
            f"{uuid.uuid4().hex}_temp.avi"
        )

        # Create temporary video
        fourcc = cv2.VideoWriter_fourcc(
            *"XVID"
        )

        writer = cv2.VideoWriter(
            temporary_video,
            fourcc,
            fps,
            (width, height)
        )

        if not writer.isOpened():

            video.release()

            raise HTTPException(
                status_code=500,
                detail="Could not create temporary output video."
            )

        temporary_frame = os.path.join(
            UPLOAD_DIR,
            f"{uuid.uuid4().hex}_frame.jpg"
        )

        frame_count = 0
        detected_count = 0

        while True:

            success, frame = video.read()

            if not success:
                break

            cv2.imwrite(
                temporary_frame,
                frame
            )

            detections = detector(
                temporary_frame
            )

            for detection in detections:

                box = detection["box"]

                x1 = int(box["x1"])
                y1 = int(box["y1"])
                x2 = int(box["x2"])
                y2 = int(box["y2"])

                x1 = max(
                    0,
                    min(x1, width - 1)
                )

                y1 = max(
                    0,
                    min(y1, height - 1)
                )

                x2 = max(
                    0,
                    min(x2, width - 1)
                )

                y2 = max(
                    0,
                    min(y2, height - 1)
                )

                currency = detection["currency"]

                confidence = detection["confidence"]

                # Bounding box
                cv2.rectangle(
                    frame,
                    (x1, y1),
                    (x2, y2),
                    (0, 0, 255),
                    3
                )

                # Currency + confidence
                label = (
                    f"{currency} "
                    f"{confidence * 100:.1f}%"
                )

                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.65
                thickness = 2

                (text_width, text_height), baseline = (
                    cv2.getTextSize(
                        label,
                        font,
                        font_scale,
                        thickness
                    )
                )

                label_y = max(
                    y1,
                    text_height + 12
                )

                # Label background
                cv2.rectangle(
                    frame,
                    (
                        x1,
                        label_y - text_height - 12
                    ),
                    (
                        x1 + text_width + 10,
                        label_y
                    ),
                    (0, 0, 255),
                    -1
                )

                # Label text
                cv2.putText(
                    frame,
                    label,
                    (
                        x1 + 5,
                        label_y - 5
                    ),
                    font,
                    font_scale,
                    (255, 255, 255),
                    thickness,
                    cv2.LINE_AA
                )

                detected_count += 1

            writer.write(frame)

            frame_count += 1

        video.release()
        writer.release()

        # Convert temporary AVI to browser-compatible H.264 MP4
        ffmpeg_command = [
            "ffmpeg",
            "-y",
            "-i",
            temporary_video,
            "-c:v",
            "libx264",
            "-preset",
            "fast",
            "-crf",
            "23",
            "-pix_fmt",
            "yuv420p",
            "-movflags",
            "+faststart",
            output_path
        ]

        process = subprocess.run(
            ffmpeg_command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        if process.returncode != 0:

            raise HTTPException(
                status_code=500,
                detail=(
                    "FFmpeg video conversion failed: "
                    f"{process.stderr[-1000:]}"
                )
            )

        if not os.path.isfile(output_path):

            raise HTTPException(
                status_code=500,
                detail="Processed video was not created."
            )

        return {
            "filename": original_name,
            "model": model,
            "type": "video",
            "frames_processed": frame_count,
            "detections": detected_count,
            "video_url": f"/video/{output_filename}"
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Video detection failed: {error}"
        )

    finally:

        if input_path and os.path.exists(input_path):
            os.remove(input_path)

        if temporary_frame and os.path.exists(
            temporary_frame
        ):
            os.remove(temporary_frame)

        if temporary_video and os.path.exists(
            temporary_video
        ):
            os.remove(temporary_video)


@app.get("/video/{filename}")
def get_video(filename: str):

    safe_filename = os.path.basename(
        filename
    )

    file_path = os.path.join(
        RESULT_DIR,
        safe_filename
    )

    if not os.path.isfile(file_path):

        raise HTTPException(
            status_code=404,
            detail="Video not found."
        )

    return FileResponse(
        file_path,
        media_type="video/mp4",
        filename=safe_filename
    )