FROM python:3.11-slim-bookworm

WORKDIR /app

COPY requirements-docker.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py inference.py ./

ENV MODEL_PATH=/app/shape_classifier.tflite

EXPOSE 5000

CMD ["gunicorn", "-w", "1", "-b", "0.0.0.0:5000", "--timeout", "120", "app:app"]
