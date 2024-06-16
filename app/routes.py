import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import io
import tensorflow as tf
import numpy as np
from PIL import Image
from flask import Blueprint, Flask, request, jsonify, render_template

main = Blueprint('main', __name__)

# Load model.tflite
interpreter = tf.lite.Interpreter(model_path="model/Minyaq.tflite")
interpreter.allocate_tensors()

# Label yang ada di dalam model.tflite
label = ["bersih", "kotor", "lumayan_kotor"]

# Function yang berfungsi untuk melakukan prediksi pada gambar yang di input
def predict_label(img):
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    input_shape = input_details[0]['shape']
    img = np.asarray(img.resize((input_shape[1], input_shape[2])))
    img = (img / 255.0).astype('float32')
    img = np.expand_dims(img, axis=0)

    interpreter.set_tensor(input_details[0]['index'], img)
    interpreter.invoke()
    output_data = interpreter.get_tensor(output_details[0]['index'])
    
    result = label[np.argmax(output_data)]
    return result

@main.route('/')
def index():
    return render_template('index.html')

@main.route("/predict", methods=["POST"])
def predict():
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"})

    try:
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert('RGB')  # Convert to RGB mode
        pred_img = predict_label(img)
        return jsonify({"prediction": pred_img})
    except Exception as e:
        return jsonify({"error": str(e)})