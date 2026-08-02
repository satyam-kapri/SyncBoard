import io
import os

import numpy as np
from PIL import Image

CLASS_LABELS = ["ellipse", "other", "rectangle", "triangle"]


def preprocess_image(image_bytes, image_size=(70, 70)):
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert("L")
    img = img.resize(image_size)
    img_array = np.array(img, dtype=np.float32) / 255.0
    img_array = np.expand_dims(img_array, axis=-1)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


class ShapePredictor:
    def __init__(self, model_path: str):
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                f"Model file not found at {model_path}. Run `python train.py` first."
            )

        if model_path.endswith(".tflite"):
            self._backend = "tflite"
            self._load_tflite(model_path)
        else:
            self._backend = "keras"
            self._load_keras(model_path)

    def _load_tflite(self, model_path: str):
        try:
            from tflite_runtime.interpreter import Interpreter
        except ImportError:
            from tensorflow.lite import Interpreter

        self._interpreter = Interpreter(model_path=model_path)
        self._interpreter.allocate_tensors()
        self._input_index = self._interpreter.get_input_details()[0]["index"]
        self._output_index = self._interpreter.get_output_details()[0]["index"]

    def _load_keras(self, model_path: str):
        import tensorflow as tf

        self._model = tf.keras.models.load_model(model_path)

    def predict(self, image_bytes: bytes):
        preprocessed = preprocess_image(image_bytes)

        if self._backend == "tflite":
            self._interpreter.set_tensor(
                self._input_index, preprocessed.astype(np.float32)
            )
            self._interpreter.invoke()
            predictions = self._interpreter.get_tensor(self._output_index)
        else:
            predictions = self._model.predict(preprocessed, verbose=0)

        class_idx = int(np.argmax(predictions, axis=1)[0])
        return {
            "shape": CLASS_LABELS[class_idx],
            "confidence": float(predictions[0][class_idx]),
        }
