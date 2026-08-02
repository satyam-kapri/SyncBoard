from flask import Flask, request, jsonify
import os
import re

from flask_cors import CORS

from inference import ShapePredictor

MODEL_PATH = os.environ.get("MODEL_PATH", "./shape_classifier.h5")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

app = Flask(__name__)
CORS(app, origins=[FRONTEND_URL])

predictor = ShapePredictor(MODEL_PATH)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["image"]
        result = predictor.predict(file.read())
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def extract_shape_and_parameters(text):
    text = text.lower().strip()

    shape_pattern = r"(line|square|rectangle|circle|hexagon|pentagon|parallelogram)"
    shape_match = re.search(shape_pattern, text)

    if not shape_match:
        return {"error": "No valid shape found in the text."}

    shape = shape_match.group(1)
    parameters = list(map(float, re.findall(r"(\d+(?:\.\d+)?)", text)))

    default_parameters = {
        "line": {"length": 100},
        "square": {"side": 50},
        "rectangle": {"width": 50, "height": 50},
        "circle": {"radius": 50},
        "hexagon": {"side": 50},
        "pentagon": {"side": 50},
        "parallelogram": {"base": 50, "height": 50},
    }

    result = {"shape": shape}
    if shape in default_parameters:
        for param in default_parameters[shape]:
            if parameters:
                result[param] = parameters.pop(0)
            else:
                result[param] = default_parameters[shape][param]

    return result


@app.route("/extract-shape", methods=["POST"])
def extract_shape():
    data = request.json
    text = data.get("text", "")
    result = extract_shape_and_parameters(text)
    return jsonify(result)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL_PATH}), 200
