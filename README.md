# 🖌️ SyncBoard

> **Real-Time Collaborative Whiteboard with AI Shape Recognition & Voice-to-Shape Control**

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/RealTime-Socket.io-010101?logo=socketdotio)](https://socket.io/)
[![Flask](https://img.shields.io/badge/ML_API-Flask-000000?logo=flask)](https://flask.palletsprojects.com/)
[![TensorFlow Lite](https://img.shields.io/badge/Model-TFLite-FF6F00?logo=tensorflow)](https://www.tensorflow.org/lite)
[![Docker](https://img.shields.io/badge/Deployment-Docker_Compose-2496ED?logo=docker)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Proxy-Nginx_SSL-009639?logo=nginx)](https://nginx.org/)

SyncBoard is a feature-rich, low-latency collaborative whiteboard application. It combines real-time multi-user canvas synchronization, custom-built AI hand-drawn shape recognition, Web Speech API voice control, interactive element manipulation, and production-ready HTTPS deployment.

---

## ✨ Features Breakdown

### 🎨 1. Modern High-Contrast UI & AI Guidance
- **Brand Restored Header**: Vector SVG SyncBoard brand logo with smooth typography and room status badges.
- **High-Contrast Dock Controls**: Crisp `#0f172a` vector line outline SVG icons on clean white button cards for maximum visibility.
- **Interactive AI Onboarding Banner (`AiInfoPanel.jsx`)**: Floating guide banner with click-to-try shape draw suggestions (Circle, Triangle, Rectangle) and voice command tips.

### 🖌️ 2. Comprehensive Tool Suite & Vector Canvas
- **Select & Move Tool (`select`)**: Click any vector shape, freehand stroke, or text block to display bounding boxes and drag it anywhere on the canvas.
- **4-Corner Interactive Scaling Handles**: Drag the top-left (`nw`), top-right (`ne`), bottom-left (`sw`), or bottom-right (`se`) handles to dynamically resize shapes, text, or freehand strokes.
- **Direct Shape Insertion**: Instantly add Rectangles, Circles, Triangles, Lines, and Arrows.
- **Freehand Pen & AI Mode (`pen`)**: Smooth freehand drawing with optional **AI Auto-Recognition** mode. When AI Mode is enabled, rough hand-drawn strokes are automatically identified and replaced with perfectly clean vector shapes.
- **Text Tool (`text`)**: Insert, edit, drag, and recolor custom canvas text.
- **Color Swatches & Stroke Width Slider**: 7 preset color swatches (Purple, Blue, Green, Red, Orange, Dark, Light) and adjustable stroke thickness.
- **Element Eraser / Delete (`delete`)**: Select any element and press `Backspace`/`Delete` or click the Delete button.

### 🔄 3. Element-Based Undo & Redo System
- Maintained within `CanvasContext`, recording every addition, modification, resize, move, and deletion to allow infinite undo and redo traversal (`Ctrl + Z` / `Ctrl + Y`).

### 🎤 4. Voice-to-Shape Control
- Dedicated top navigation bar Voice Control widget integrated with the browser Web Speech API.
- Live microphone recording indicator with transparent CSS pulse animation (`@keyframes micPulse`).
- Speak natural commands such as:
  - *"Draw a circle with radius 70"*
  - *"Draw a rectangle 150 by 100"*
  - *"Draw a triangle"*
- Automatically parses shape parameters and renders interactive, selectable vector shapes on the canvas.

### 🌐 5. Real-Time Collaboration & Room Isolation
- Instant room creation and joining via unique room codes.
- Low-latency WebSocket event synchronization across all connected clients in the same room.
- Synchronized mouse cursor tracking (`receive_snap`), live stroke updates, room user count, and real-time chat.

### 📐 6. Canvas Grid Modes & PNG Export
- Background grid switcher: **Blank White**, **Dot Grid**, and **Line Grid**.
- High-resolution single-click canvas PNG export.

### 🔒 7. Secure HTTPS & SSL Termination
- Built-in Nginx reverse proxy with HTTP (port 80) to HTTPS (port 443) 301 redirection.
- Encrypted WebSocket (`wss://`) and ML API (`https://`) proxying configured with Let's Encrypt / Certbot SSL certificates.

---

## 🤖 How the ML Model Was Built From Scratch

The shape recognition system uses a custom-trained **Convolutional Neural Network (CNN)** converted to **TensorFlow Lite (TFLite)** for ultra-fast, lightweight inference.

```
       [ Hand-Drawn Stroke ]
                │
                ▼
   [ Grayscale 70x70 Normalization ]
                │
                ▼
      ┌──────────────────┐
      │  Conv2D (32, 3x3)│ ──► MaxPool (2x2)
      │  Conv2D (64, 3x3)│ ──► MaxPool (2x2)
      │  Conv2D (128, 3x3)│
      └──────────────────┘
                │
                ▼
     [ Dense 128 ──► Dense 4 (Softmax) ]
                │
                ▼
 [ Predicted Class: ellipse | rectangle | triangle | other ]
```

### 1. Dataset Selection & Preprocessing
- Trained on the **Hand-Drawn Shapes (HDS)** dataset from Kaggle (`frobert/handdrawn-shapes-hds-dataset`).
- Categorized into 4 target classes: `ellipse`, `rectangle`, `triangle`, and `other`.
- **Pipeline (`train.py`)**:
  1. Image files are loaded and converted to single-channel grayscale (`L`).
  2. Resized to a standard matrix dimension of **`70 x 70`** pixels.
  3. Min-max normalization scales pixel values between `0.0` and `1.0` (`img / 255.0`).

### 2. CNN Model Architecture
Built using TensorFlow / Keras `Sequential`:

```python
model = Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(70, 70, 1)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dense(4, activation='softmax')
])
```

- **Optimizer**: `Adam`
- **Loss Function**: `categorical_crossentropy`
- **Training**: 10 Epochs with a 70/15/15 Train/Validation/Test split, reaching high accuracy on hand-drawn shapes.

### 3. TFLite Conversion & Low-Memory Deployment
- Full TensorFlow models consume 500MB+ RAM during runtime. To keep SyncBoard light enough to run on cheap cloud VPS instances (such as AWS EC2 `t3.small`), the model is converted to **TensorFlow Lite (`shape_classifier.tflite`)**:

```python
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
with open("shape_classifier.tflite", "wb") as f:
    f.write(tflite_model)
```

- In production, the Flask ML server (`mlserver/inference.py`) uses `tflite-runtime` interpreter, consuming **~50 MB RAM** and executing shape classification in **under 20ms**.

---

## ⚙️ Technical Architecture & How Features Work

### System Architecture Overview

```
                      ┌───────────────────────────┐
                      │    Client Browser (React) │
                      └─────────────┬─────────────┘
                                    │ HTTPS (443)
                                    ▼
                      ┌───────────────────────────┐
                      │    Nginx Reverse Proxy    │
                      └──────┬─────────────┬──────┘
                             │             │
              ┌──────────────┘             └──────────────┐
              │ /socket.io/                               │ /ml/
              ▼                                           ▼
   ┌──────────────────────┐                    ┌──────────────────────┐
   │ Node.js + Socket.io  │                    │ Flask + TFLite API   │
   │ (Port 3001)          │                    │ (Port 5000)          │
   └──────────────────────┘                    └──────────────────────┘
```

### 🧠 Under the Hood Details

1. **Vector Element Manipulation & 4-Corner Scaling**:
   - Canvas elements are stored as structured JSON objects (`id`, `type`, `x`, `y`, `width`, `height`, `color`, `strokeWidth`, `text`).
   - When a user clicks on an element in `Select` mode, `Canvas.jsx` computes point-in-bounding-box math and renders 4 interactive square handles at the corners (`nw`, `ne`, `se`, `sw`).
   - Dragging a corner handle updates `width`, `height`, `x`, and `y` dynamically while preserving object anchor points.

2. **AI Shape Snapping (`/predict`)**:
   - When drawing in **AI Mode**, `Canvas.jsx` captures the user's bounding stroke data, rasterizes it to image bytes, and sends a `POST` request to `/ml/predict`.
   - The Flask ML server passes image bytes to `ShapePredictor`, which runs preprocessed tensor inputs through the `.tflite` model interpreter.
   - If confidence is high, `Canvas.jsx` replaces the freehand stroke with a clean vector shape at the exact bounding box coordinates of the user's sketch.

3. **Natural Language Voice Parser (`/ml/extract-shape`)**:
   - Speech transcriptions from `VoiceToShape.jsx` are posted to `/ml/extract-shape`.
   - Regex parameter extraction parses shape keywords (`circle`, `rectangle`, `square`, `triangle`, `line`) and dimensions (`radius`, `width`, `height`).
   - Generates and broadcasts the structured shape directly onto the active whiteboard context.

---

## 🛠️ Local Development Setup

### Running without Docker

Run each service in a separate terminal:

#### 1. ML Server
```bash
cd mlserver
python -m venv venv
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
python app.py
```

#### 2. Node Server
```bash
cd nodeserver
npm install
npm start
```

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## ☁️ Production Docker Deployment (With HTTPS)

SyncBoard runs entirely inside Docker containers orchestrated by `docker-compose`.

### 1. Inbound Firewall Rules (AWS Security Group / VPS)
Ensure the following ports are open:
- **Port 80** (HTTP - for SSL challenge & redirect)
- **Port 443** (HTTPS - for secure web app traffic)

### 2. Issue Free SSL Certificate (Certbot)
On your host server (e.g. EC2 / VPS):

```bash
# 1. Install certbot
sudo apt update && sudo apt install certbot -y

# 2. Issue certificate for your domain
sudo certbot certonly --standalone -d syncboard.duckdns.org
```

### 3. Build & Run Containers
```bash
git clone https://github.com/satyam-kapri/SyncBoard.git
cd SyncBoard

# Start Docker Compose
docker-compose up -d --build
```

Access your application at **`https://syncboard.duckdns.org`**!

### 🐳 Useful Docker Commands

```bash
docker-compose ps                # View running services status
docker-compose logs -f           # Follow container logs
docker-compose logs -f ml        # Follow ML server logs
docker-compose down              # Stop containers
docker-compose up -d --build     # Rebuild and restart containers
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
