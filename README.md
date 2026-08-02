# SyncBoard(http://http://13.201.132.182/)

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
| **t3.small** | 2 GB | Demo OK — Docker uses TFLite (~50 MB), not full TensorFlow |
| t3.medium | 4 GB | Comfortable headroom |
| t3.large | 8 GB | Only if you train the model on EC2 |

**Disk:** use at least **15 GB** root volume. Default 8 GB Ubuntu AMIs often run out of space during `docker compose build`.

Train the model on your laptop once, then copy `mlserver/shape_classifier.tflite` to the server (a few MB).

### 1. Launch EC2

- **AMI:** Ubuntu 22.04 LTS
- **Instance type:** `t3.small` or `t3.medium`
- **Storage:** **15 GB minimum** (20 GB recommended)
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

If you don't already have `mlserver/shape_classifier.tflite`:

```bash
cd mlserver
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train.py   # creates shape_classifier.h5 and shape_classifier.tflite
```

Copy the **`.tflite`** file to EC2 (much smaller than the `.h5`):

```bash
scp mlserver/shape_classifier.tflite ubuntu@YOUR_EC2_IP:~/SyncBoard/mlserver/
```

If you only have an older `.h5` file, re-run `python train.py` locally to generate the `.tflite`, or convert manually with TensorFlow.

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
- **Model file** must exist at `mlserver/shape_classifier.tflite` before starting.
- If the build fails with **no space left on device**, free Docker cache then rebuild:

```bash
docker system prune -af
docker compose up -d --build
```

If still tight on disk, expand the EBS volume in AWS (EC2 → Storage → Increase volume size), then on the instance:

```bash
sudo growpart /dev/nvme0n1 1
sudo resize2fs /dev/nvme0n1p1
```
