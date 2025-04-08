from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import io
from PIL import Image 
from flask_cors import CORS 
import re
# Initialize Flask app
app = Flask(__name__)
CORS(app)
# Load the pre-trained model
model = tf.keras.models.load_model("./shape_classifier.h5")
class_labels = ['ellipse', 'other', 'rectangle', 'triangle']

# Preprocessing function
def preprocess_image(image_bytes, image_size=(70,70)):
    # Convert the image bytes to a PIL image
    img = Image.open(io.BytesIO(image_bytes))
    img = img.convert('L')
    # Resize the image
    img = img.resize(image_size)
    
    # Convert the image to an array and normalize
    img_array = image.img_to_array(img) / 255.0  # Normalize to [0, 1]
    
    # Add a batch dimension (for model input)
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

# Define a route for prediction
@app.route("/predict", methods=["POST"])
def predict():
    try:
        # Ensure an image file is provided
        if "image" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["image"]

        # Preprocess the image
        preprocessed_image = preprocess_image(file.read())
        # Perform prediction
        predictions = model.predict(preprocessed_image)
        class_idx = np.argmax(predictions, axis=1)  # Get the index of the class with the highest probability
        predicted_class = class_labels[class_idx[0]]  # Map the class index to the actual label
        confidence = predictions[0][class_idx[0]]  # Get the confidence score for the predicted class
    
        # Prepare response
        response = {
            "shape": predicted_class,
            "confidence":float(confidence),
        }
        return jsonify(response), 200

    except Exception as e:
        # print(e)
        return jsonify({"error": str(e)}), 500





def extract_shape_and_parameters(text):
    """
    Extracts the shape and its parameters from the given text.
    
    Args:
        text (str): The input text containing the shape and parameters.
    
    Returns:
        dict: A dictionary containing the shape and its parameters.
              Example: {"shape": "circle", "radius": 50}
    """
    # Normalize the text: lowercase and remove extra spaces
    text = text.lower().strip()
    
    # Regex to match the shape
    shape_pattern = r"(line|square|rectangle|circle|hexagon|pentagon|parallelogram)"
    shape_match = re.search(shape_pattern, text)
    
    if not shape_match:
        return {"error": "No valid shape found in the text."}
    
    shape = shape_match.group(1)
    
    # Find all numbers in the text
    parameters = list(map(float, re.findall(r"(\d+(?:\.\d+)?)", text)))
    
    # Default parameters for each shape
    default_parameters = {
        "line": {"length": 100},
        "square": {"side": 50},
        "rectangle": {"width": 50, "height": 50},
        "circle": {"radius": 50},
        "hexagon": {"side": 50},
        "pentagon": {"side": 50},
        "parallelogram": {"base": 50, "height": 50},
    }
    
    # Extract parameters based on the shape
    result = {"shape": shape}
    if shape in default_parameters:
        for param in default_parameters[shape]:
            if parameters:
                result[param] = parameters.pop(0)
            else:
                result[param] = default_parameters[shape][param]
    
    return result

@app.route('/extract-shape', methods=['POST'])
def extract_shape():
    data = request.json
    text = data.get("text", "")
    result = extract_shape_and_parameters(text)
    return jsonify(result)
if __name__ == "__main__":
    app.run(debug=True)

