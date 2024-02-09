

from flask import Flask, render_template, request, redirect, session, url_for
from werkzeug.utils import secure_filename
import os
import cv2
import numpy as np
import tensorflow as tf
from keras.models import load_model
import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth

app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("C:\serviceAccountKey.json")
firebase_admin.initialize_app(cred)

# Specify the upload folder
app.config['UPLOAD_FOLDER'] = 'uploads'
# Specify the allowed extensions for file uploads
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Load the pre-trained model
loaded_model = load_model(r'C:\Users\chris\Music\majorprj\model\RESNET-50-v1(gokul).h5')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def contrast_stretching(img):
    if img.shape[-1] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    min_val, max_val, _, _ = cv2.minMaxLoc(img)
    stretched_img = np.uint8((img - min_val) / (max_val - min_val) * 255)

    if len(stretched_img.shape) == 2:
        stretched_img = cv2.cvtColor(stretched_img, cv2.COLOR_GRAY2BGR)

    return stretched_img

def preprocess_image(img_path):
    img = cv2.imread(img_path)

    if img is None:
        print(f"Error: Unable to load image from {img_path}")
        return None

    img = contrast_stretching(img)

    img = cv2.resize(img, (224, 224))
    img = np.expand_dims(img, axis=0)
    img = tf.keras.applications.resnet50.preprocess_input(img)

    return img

def predict_image(model, preprocessed_image):
    predictions = model.predict(preprocessed_image)
    return predictions

def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        try:
            user = auth.create_user(email=email, password=password)
            session['user'] = user.uid
            return redirect('/front')
        except Exception as e:
            return str(e)
    return render_template('signup.html')

@app.route('/')
def home(debug = True):
    return render_template('landingpage.html')

@app.route('/signup')
def signup(debug = True):
    return render_template('signup.html')

@app.route('/front')
def front(debug = True):
    return render_template('front.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return "No file part"

    file = request.files['file']

    if file.filename == '':
        return "No selected file"

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        image_url = url_for('static', filename='uploads/' + filename)
        preprocessed_image = preprocess_image(file_path)

        if preprocessed_image is not None:
            predictions = loaded_model.predict(preprocessed_image)
            predicted_class = (predictions > 0.65).astype(int).flatten()[0]


            if predicted_class == 0:
                xem = (predictions > 0.5).astype(int).flatten()[0]
                if xem == 1:
                    prediction_result = "The cow may have an infection"
                else:
                    prediction_result = "The uploaded image is predicted to be healthy."
            else:
                prediction_result = "The uploaded image is predicted to be infected."

            return render_template('result.html', prediction=prediction_result, image_url=image_url)
        else:
            return "Error in image preprocessing."
    else:
        return "File type not allowed"

if __name__ == '__main__':
    app.run(debug=True)
