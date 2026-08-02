# SyncBoard

Collaborative whiteboard with real-time sync, AI shape recognition, and voice-to-shape.

## Local development (without Docker)

Run each service in a separate terminal.

```bash
# ML server
cd mlserver && python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt && python train.py && python app.py

# Node server
cd nodeserver && npm install && npm start

# Frontend
cd frontend && npm install && npm run dev
```

Open http://localhost:5173. See `frontend/.env.development` for local API URLs.

---

## Deploy on AWS EC2 with Docker (demo)

Everything runs via **Docker Compose** — no shell scripts, no domain required. Access the app at `http://YOUR_EC2_PUBLIC_IP`.

### Architecture

| URL path | Service |
|----------|---------|
| `/` | React app (Nginx) |
| `/socket.io/` | Node + Socket.io |
| `/ml/` | Flask ML API |

### EC2 instance size

**You do not need t3.large** for a demo if the model is already trained.

| Instance | RAM | Good for |
|----------|-----|----------|
| **t3.medium** (recommended) | 4 GB | Running all 3 containers with inference |
| t3.small | 2 GB | May run out of memory (TensorFlow is heavy) |
| t3.large | 8 GB | Only needed if you train the model on the EC2 instance |

Train the model on your laptop once, then copy `mlserver/shape_classifier.h5` to the server.

### 1. Launch EC2

- **AMI:** Ubuntu 22.04 LTS
- **Instance type:** `t3.medium`
- **Storage:** 20 GB
- **Security group inbound:**
  - SSH (22) — your IP
  - HTTP (80) — `0.0.0.0/0`

### 2. Install Docker on EC2

SSH in, then:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER
```

Log out and back in so the `docker` group applies.

### 3. Train the model (once, on your machine)

If you don't already have `mlserver/shape_classifier.h5`:

```bash
cd mlserver
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train.py
```

Copy `shape_classifier.h5` to the EC2 instance (or commit it to a private repo / scp it):

```bash
scp mlserver/shape_classifier.h5 ubuntu@YOUR_EC2_IP:~/SyncBoard/mlserver/
```

### 4. Clone and configure

On EC2:

```bash
git clone https://github.com/satyam-kapri/SyncBoard.git
cd SyncBoard
cp .env.example .env
```

Edit `.env` and set your public IP:

```env
FRONTEND_URL=http://54.123.45.67
```

Replace `54.123.45.67` with your EC2 public IP (from the AWS console).

### 5. Start

```bash
docker compose up -d --build
```

Open **http://YOUR_EC2_PUBLIC_IP** in your browser.

### Useful commands

```bash
docker compose ps          # status
docker compose logs -f     # all logs
docker compose logs -f ml  # ML server only
docker compose down        # stop
docker compose up -d --build   # rebuild after git pull
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | `http://YOUR_EC2_PUBLIC_IP` — used for CORS on Node and ML servers |

Frontend build uses same-origin URLs (`/ml`, current host for Socket.io), so no domain is needed.

### Notes for demo

- **No HTTPS** — fine for a demo over HTTP. Browser voice recognition may not work without HTTPS; drawing and shape detection still work.
- **Model file** must exist at `mlserver/shape_classifier.h5` before starting (mounted into the ML container).
- If the ML container keeps restarting, check logs: `docker compose logs ml`. Usually means the model file is missing or the instance is too small.
