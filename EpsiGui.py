from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
import pydicom
from PIL import Image
import cv2
import numpy as np
import traceback
import io

app = Flask(__name__)
CORS(app)

# Path to the folder containing .dcm files
folder_path = '/Users/benjaminyoon/Desktop/PIGI folder/Projects/Project4 EPSI App/epsi-app/data_mouse_kidney/s_2023041103/fsems_rat_liver_03.dmc/'

# Count the number of .dcm files
dcm_files = [file for file in os.listdir(folder_path) if file.endswith('.dcm')]
num_slider_values = len(dcm_files)

@app.route('/api/get_proton_picture/<int:slider_value>', methods=['POST'])
def get_proton_picture(slider_value):
    """
    # Handle image retrieval based on slider_value
    # You can load the corresponding .dcm file and convert it to an image
    # Return the image data as a response

    # Example: Load a proton image from a file and return it
    # Make sure to adjust the path to your image files

    @author Benjamin (Ben) Yoon
    @date 
    @version 1.2
    """
    try:
        # Generate the filename based on the slider value
        filename = f'slice{slider_value:03d}image001echo001.dcm'
        dicom_path = os.path.join(folder_path, filename)

        # Check if the file exists
        if not os.path.exists(dicom_path):
            return jsonify({'error': 'DICOM file not found'}), 404

        # Read the DICOM file
        dcm = pydicom.dcmread(dicom_path)
        slice_image = dcm.pixel_array

        # Convert DICOM image to PIL Image
        pil_image = Image.fromarray(slice_image)

        # Normalize pixel values to [0, 1]
        # proton_picture_normalized = (slice_image - np.min(slice_image)) / (
        #         np.max(slice_image) - np.min(slice_image))
        
        # Get the contrast value from the request data
        request_data = request.get_json()
        contrast_value = request_data.get('contrast', 1)

        # Apply CLAHE for contrast adjustment
        # clahe = cv2.createCLAHE(clipLimit=contrast_value, tileGridSize=(8, 8))
        # proton_picture_clahe = clahe.apply(np.uint8(proton_picture_normalized * 255))

        # Rescale pixel values back to [0, 1]
        # proton_picture_rescaled = proton_picture_clahe / 255.0

        # Create a buffer to hold the image data
        buffer = io.BytesIO()
        
        # Save the NumPy array as bytes
        # buffer.write(cv2.imencode('.png', proton_picture_rescaled)[1].tobytes())

        pil_image.save(buffer, format="PNG") # Convert to PNG

        # Move the buffer position to the start
        buffer.seek(0)

        return send_file(buffer, mimetype='image/png')
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)