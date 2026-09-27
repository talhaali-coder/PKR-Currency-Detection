# PKR Currency Detection System

An AI-powered computer vision system for detecting and identifying Pakistani currency notes using three object detection models: **YOLO11n, SSD300, and CNN/Faster R-CNN**.

The system supports **image detection, video detection, and real-time camera detection** through a React frontend connected to a FastAPI backend.

## Overview

This project was developed as a Computer Vision assignment to study and compare different object detection architectures on Pakistani currency notes.

The system can detect the following Pakistani currency denominations:

* Rs. 10
* Rs. 20
* Rs. 50
* Rs. 75
* Rs. 100
* Rs. 500
* Rs. 1000
* Rs. 5000

## Features

* Pakistani currency note detection
* YOLO11n model
* SSD300 model with VGG16 backbone
* CNN / Faster R-CNN with ResNet50 + FPN
* Image detection
* Video detection
* Real-time webcam detection
* Bounding boxes around detected notes
* Currency denomination labels
* Detection confidence scores
* Dynamic model performance information
* React-based frontend
* FastAPI backend
* Local/offline processing
* Processed video output
* Model selection from the frontend

## System Architecture

```text
                    PKR Currency Detection System
                              |
                +-------------+-------------+
                |                           |
          React Frontend              FastAPI Backend
                |                           |
       +--------+--------+          +-------+-------+
       |        |        |          |       |       |
     Image    Video   Camera      YOLO    SSD     CNN
                                    |       |       |
                                    +-------+-------+
                                            |
                                  Currency Detection
                                            |
                              Bounding Boxes + Confidence
```

## Models

### YOLO11n

YOLO11n is a single-stage object detection model designed for fast real-time inference.

* Architecture: YOLO11n
* Training images: 2,801
* Training epochs: 50
* Precision: 89.60%
* Recall: 88.90%
* F1 Score: 89.20%
* mAP@50: 90.70%
* mAP@50–95: 47.50%
* Speed: 107.50 FPS
* Approximate inference time: 9.3 ms/frame

### SSD300

SSD300 is a single-stage object detector using a VGG16 backbone.

* Architecture: SSD300 + VGG16
* Training images: 2,801
* Training epochs: 30
* Precision: 73.64%
* Recall: 69.17%
* F1 Score: 71.33%
* mAP@50: 73.64%*
* mAP@50–95: 33.28%*
* Speed: 42.92 FPS
* Approximate inference time: 23.3 ms/frame

### CNN / Faster R-CNN

The CNN-based detector uses Faster R-CNN with a ResNet50 backbone and Feature Pyramid Network.

* Architecture: Faster R-CNN + ResNet50 + FPN
* Training images: 800
* Training epochs: 3
* Precision: 58.97%
* Recall: 78.93%
* F1 Score: 67.51%
* mAP@50: 74.08%
* mAP@50–95: 33.57%
* Speed: 10.52 FPS
* Approximate inference time: 95.1 ms/frame

> **Note:** The training conditions were not identical for all three models. YOLO11n was trained for 50 epochs, SSD300 for 30 epochs, and the Faster R-CNN model for 3 epochs using 800 training images. Therefore, the results should be interpreted as the results of the implemented experiments rather than a strictly controlled benchmark.

> **SSD metric note:** The SSD mAP values marked with `*` were calculated using the project's simplified custom evaluation method and should not be treated as directly equivalent to official COCO/Ultralytics mAP measurements.

## Dataset

The models were trained for Pakistani currency note detection using an annotated dataset containing eight classes:

```text
10
20
50
75
100
500
1000
5000
```

Dataset split:

| Split      | Images |
| ---------- | -----: |
| Training   |  2,801 |
| Validation |    802 |
| Testing    |    403 |

Total images: **4,006**

## Frontend

The frontend is built with:

* React
* Vite
* Axios
* Lucide React
* CSS

The interface provides:

```text
Model Selection
      ↓
Input Selection
      ↓
Image / Video / Camera
      ↓
FastAPI Detection API
      ↓
Selected AI Model
      ↓
Detection Results
      ↓
Confidence + Bounding Boxes
```

## Backend

The backend is built with:

* Python
* FastAPI
* OpenCV
* PyTorch
* Torchvision
* Ultralytics

API endpoints include:

```text
GET  /
GET  /health
POST /detect
POST /detect-video
GET  /video/{filename}
```

## Project Structure

```text
PKR-Currency-Detection/
│
├── backend/
│   │
│   ├── models/
│   │   ├── yolo/
│   │   │   └── best.pt
│   │   │
│   │   ├── ssd/
│   │   │   └── ssd300_pkr_pretrained_best.pth
│   │   │
│   │   └── cnn/
│   │       └── cnn_pkr_best.pth
│   │
│   ├── services/
│   │   ├── yolo_detector.py
│   │   ├── ssd_detector.py
│   │   └── cnn_detector.py
│   │
│   ├── uploads/
│   │   └── results/
│   │
│   └── main.py
│
├── frontend/
│   │
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── camera/
│   │   │   ├── detection/
│   │   │   ├── model/
│   │   │   └── upload/
│   │   │
│   │   ├── services/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/talhaali-coder/PKR-Currency-Detection.git
cd PKR-Currency-Detection
```

### 2. Backend setup

Create and activate a Python virtual environment:

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the required packages:

```bash
pip install fastapi uvicorn python-multipart opencv-python torch torchvision ultralytics
```

### 3. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
```

## Running the Application

### Start the backend

From the `backend` directory:

```bash
python -m uvicorn main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

### Start the frontend

From the `frontend` directory:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## Detection Workflow

### Image Detection

1. Select a model.
2. Select **Image**.
3. Upload a Pakistani currency image.
4. Click **Detect Currency**.
5. The selected model processes the image.
6. Detected denominations and confidence scores are displayed.

### Video Detection

1. Select YOLO11n, SSD300, or CNN/Faster R-CNN.
2. Select **Video**.
3. Upload a supported video.
4. The backend processes the video frames.
5. Bounding boxes and currency labels are added.
6. The processed video is returned to the frontend.

### Camera Detection

1. Select **Camera**.
2. Allow browser camera access.
3. The application captures frames from the webcam.
4. Frames are sent to the selected detection model.
5. Detection boxes and labels are displayed over the camera feed.

## Supported File Types

### Images

```text
.jpg
.jpeg
.png
.webp
.bmp
```

### Videos

```text
.mp4
.avi
.mov
.mkv
.webm
```

Maximum upload size:

```text
100 MB
```

## Performance Metrics

The system reports:

* Precision
* Recall
* F1 Score
* mAP@50
* mAP@50–95
* FPS
* Approximate inference time
* Training images
* Training epochs

These metrics are displayed dynamically according to the selected model.

## Important Notes

The model files are intentionally excluded from the Git repository because trained `.pt` and `.pth` files are large.

The `.gitignore` file excludes:

```text
*.pt
*.pth
.venv/
node_modules/
uploads/
generated results
```

The trained model files must therefore be placed manually in:

```text
backend/models/yolo/
backend/models/ssd/
backend/models/cnn/
```

with the filenames expected by the backend.

## Future Improvements

Possible future improvements include:

* GPU acceleration for local inference
* Improved training with equal experimental conditions
* Larger and more diverse datasets
* Model quantization
* Faster video processing
* Multi-note tracking across video frames
* Better confidence filtering
* Mobile device support
* Cloud deployment
* Authentication and user history
* Detailed analytics dashboard

## Technologies

| Technology   | Purpose                   |
| ------------ | ------------------------- |
| Python       | Backend and AI processing |
| FastAPI      | REST API                  |
| PyTorch      | Deep learning             |
| Torchvision  | Detection models          |
| Ultralytics  | YOLO                      |
| OpenCV       | Image/video processing    |
| React        | Frontend                  |
| Vite         | Frontend development      |
| Axios        | API communication         |
| Lucide React | UI icons                  |

## Project Purpose

This project demonstrates the practical application of deep learning and computer vision for Pakistani currency recognition while providing an experimental comparison between different object detection architectures.

---

**PKR Currency Detection System**

Computer Vision Assignment
YOLO11n • SSD300 • CNN / Faster R-CNN
