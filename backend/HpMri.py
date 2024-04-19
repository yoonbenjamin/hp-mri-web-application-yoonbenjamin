import cv2
import io
import os
import pydicom
import struct
import traceback
import numpy as np
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from PIL import Image
from scipy.fft import fftn
from werkzeug.utils import secure_filename


app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "/Users/benjaminyoon/Desktop/PIGI folder/Projects/Project4 HP MRI Web Application/hpmri-benjaminyoon/data"

# Path to the folder containing .dcm files
folder_path = "/Users/benjaminyoon/Desktop/PIGI folder/Projects/Project4 HP MRI Web Application/hpmri-benjaminyoon/data_mouse_kidney/s_2023041103/fsems_rat_liver_03.dmc/"

# Count the number of .dcm files
dcm_files = [file for file in os.listdir(folder_path) if file.endswith(".dcm")]
num_slider_values = len(dcm_files)
info_epsi = {"pictures_to_read_write": 1, "proton": 60, "centric": 1}
path_epsi = ""
path_13c = "/Users/benjaminyoon/Desktop/PIGI folder/Projects/Project4 HP MRI Web Application/hpmri-benjaminyoon/data_mouse_kidney/s_2023041103/epsi_16x12_13c_"
path_fid = "/Users/benjaminyoon/Desktop/PIGI folder/Projects/Project4 HP MRI Web Application/hpmri-benjaminyoon/data_mouse_kidney/s_2023041103/fsems_rat_liver_03"
scale = True
rows = 12
columns = 16
moving_average_window = 1


@app.route("/api/get_proton_picture/<int:slider_value>", methods=["POST"])
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
        filename = f"slice{slider_value:03d}image001echo001.dcm"
        dicom_path = os.path.join(folder_path, filename)

        # Check if the file exists
        if not os.path.exists(dicom_path):
            return jsonify({"error": "DICOM file not found"}), 404

        # Read the DICOM file
        dcm = pydicom.dcmread(dicom_path)
        slice_image = dcm.pixel_array

        # Apply threshold
        threshold_value = 5
        slice_image[slice_image < threshold_value] = 0

        # Normalize pixel values to [0, 1]
        proton_picture_normalized = (slice_image - np.min(slice_image)) / (
            np.max(slice_image) - np.min(slice_image)
        )

        # Apply threshold again
        threshold_value_normalized = 0.05
        proton_picture_normalized[
            proton_picture_normalized < threshold_value_normalized
        ] = 0.0

        # Get the contrast value from the request data
        request_data = request.get_json()
        contrast_value = request_data.get("contrast", 1)

        # Apply CLAHE for contrast adjustment
        clahe = cv2.createCLAHE(clipLimit=contrast_value, tileGridSize=(8, 8))
        proton_picture_clahe = clahe.apply(np.uint8(proton_picture_normalized * 255))

        # Apply threshold again
        proton_picture_clahe[proton_picture_clahe < threshold_value] = 0

        # Rescale pixel values back to [0, 1]
        proton_picture_rescaled = proton_picture_clahe / 255.0

        # Apply threshold again
        proton_picture_rescaled[
            proton_picture_rescaled < threshold_value_normalized
        ] = 0.0

        # Create a buffer to hold the image data
        buffer = io.BytesIO()

        # Convert NumPy array to PIL Image
        pil_image = Image.fromarray((proton_picture_rescaled * 255).astype(np.uint8))

        # Save the PIL Image to the buffer
        pil_image.save(buffer, format="PNG")  # Convert to PNG

        # Move the buffer position to the start
        buffer.seek(0)

        return send_file(buffer, mimetype="image/png")
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


def sanitize_data(data):
    if isinstance(data, list):
        return [sanitize_data(item) for item in data]
    elif isinstance(data, dict):
        return {key: sanitize_data(value) for key, value in data.items()}
    elif isinstance(data, float) and np.isnan(data):
        return None  # Replace NaN with None
    return data


@app.route("/api/get_epsi_data/<int:epsi_value>", methods=["POST"])
def get_epsi_data(epsi_value):
    """
    Handle EPSI data retrieval based on the EPSI slider value.
    You can update the EPSI plot and return any relevant data.

    @author Benjamin (Ben) Yoon
    @date
    @version 1.0
    """
    global lro_fid, lpe_fid, lro_epsi, lpe_epsi, x_epsi, epsi, spectral_data, plot_shift
    try:
        # Process EPSI data
        read_epsi_plot(epsi_value)

        # Sanitize the data to ensure no NaN values are sent
        epsi_sanitized = np.nan_to_num(epsi, nan=-1).tolist()
        spectral_data_sanitized = np.nan_to_num(spectral_data, nan=-1).tolist()

        plot_shift = [-0.3, -0.4]

        # Return a JSON response with x_epsi, sanitized epsi, columns, sanitized spectral_data, and rows
        data_to_send = {
            "xEpsi": x_epsi.tolist(),
            "epsi": epsi_sanitized,
            "columns": columns,
            "spectralData": spectral_data_sanitized,
            "rows": rows,
            "lroFid": lro_fid,
            "lpeFid": lpe_fid,
            "lroEpsi": lro_epsi,
            "lpeEpsi": lpe_epsi,
            "plotShift": plot_shift,
        }

        return jsonify(data_to_send)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/upload", methods=["POST"])
def file_upload():
    try:
        uploaded_files = request.files.getlist("files")
        for file in uploaded_files:
            if file:
                filename = secure_filename(file.filename)
                save_path = os.path.join(UPLOAD_FOLDER, filename)
                file.save(save_path)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


def read_epsi_plot(epsi_value):
    """
    Set the EPSI data based on configuration and current value.

    @author Benjamin (Ben) Yoon
    @date Fri, Aug 11, 2023
    @version 1.0
    """
    global lro_fid, lpe_fid, lro_epsi, lpe_epsi, x_epsi, epsi, spectral_data
    # Constants
    proton_quarter = info_epsi["proton"] / 4

    # Read EPSI data based on the EPSI slider value
    path_epsi = f"{path_13c}{epsi_value:02d}"
    spectral_data = read_write_spectral_data(info_epsi, path_epsi, proton_quarter)
    # Preprocessing
    spectral_data = np.flip(np.flip(spectral_data, 0), 1)
    # if self.picture_information:
    #    spectral_data = self.class_spectral_data_instance.correct_epsi_plot(self, spectral_data)
    if scale:
        maximum_spectral_data_value = np.max(spectral_data)
        spectral_data = spectral_data / maximum_spectral_data_value
    else:
        maximum_spectral_data_value = np.max(spectral_data, axis=2)
        spectral_data = spectral_data / maximum_spectral_data_value
    epsi = []
    for i in range(0, rows):
        row_information = []
        for j in range(0, columns):
            if np.max(spectral_data[i, j, :]) < 0.20:
                spectral_data[i, j, :] = np.nan
            row_information = np.concatenate(
                (
                    np.squeeze(row_information),
                    np.squeeze(np.roll(spectral_data[i, j, :], 0)),
                )
            )
        epsi = np.concatenate(
            (np.squeeze(epsi), np.squeeze(row_information + rows - i))
        )
    x_epsi = np.tile(np.arange(0, spectral_data.shape[2] * columns), rows)
    for nan_rows in range(0, rows - 1):
        epsi[nan_rows * spectral_data.shape[2] * columns] = np.nan
    epsi = (
        np.convolve(epsi, np.ones(moving_average_window), mode="same")
        / moving_average_window
    )
    epsi[~np.isnan(epsi)] -= 1

    # Adjust subplot position
    lro_fid = read_write_procpar("lro", path_fid)[0] * 10
    lpe_fid = read_write_procpar("lpe 1", path_fid)[0] * 10
    lro_epsi = read_write_procpar("lro", path_epsi)[0] * 10
    lpe_epsi = read_write_procpar("lpe 1", path_epsi)[0] * 10


def read_write_spectral_data(epsi_tmp, file_path, proton_quarter):
    """
    Reads and processes spectral data from the specified file.

    :param epsi: A dictionary containing configuration parameters for data processing.
    :param file_path: The path to the directory containing the spectral data files.
    :param proton_quarter: The proton quarter value used in data processing.
    :return: Processed spectral data as a complex numpy array.
    :rtype: ndarray

    @author: Benjamin (Ben) Yoon
    @date: Fri, Jul 21, 2023
    @version: 1.0
    """
    global lro_fid, lpe_fid, lro_epsi, lpe_epsi, x_epsi, epsi, spectral_data
    ne = read_write_procpar("ne", file_path)
    ne = ne[0]
    number_of_points = read_write_procpar("np", file_path)
    number_of_points = number_of_points[0] // 2
    nv = read_write_procpar("nv 1", file_path)
    nv = nv[0]
    te = read_write_procpar("te2", file_path)
    et = 1 / te[0]

    # Arrange echoes
    if epsi_tmp["centric"]:
        echoes = np.array([0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6]) + 7
    else:
        echoes = np.arange(1, nv + 1)
    tmp_spectral_data_array = np.zeros(
        (int(nv), int(number_of_points), int(ne), epsi_tmp["pictures_to_read_write"]),
        dtype=complex,
    )
    tmp_spectral_data_array_1 = tmp_spectral_data_array.copy()
    tmp_spectral_data_array_2 = tmp_spectral_data_array.copy()
    tmp_spectral_data_array_3 = np.zeros(
        (
            int(nv),
            int(number_of_points),
            int(2 * ne),
            epsi_tmp["pictures_to_read_write"],
        ),
        dtype=complex,
    )
    spectral_data = tmp_spectral_data_array_3.copy()
    tmp_spectral_data = spectral_data.copy()
    for i in range(epsi_tmp["pictures_to_read_write"]):
        real_information, imaginary_information, _, _, _, _ = read_write_fid(file_path)
        for j in range(int(ne)):
            ix = np.arange(j, int(nv * ne), int(ne))
            tmp_spectral_data_array[:, :, j, i] = (
                real_information[:, ix] - 1j * imaginary_information[:, ix]
            ).T
        for j in range(int(nv)):
            tmp_spectral_data_array_1[echoes[j] - 1, :, :, :] = tmp_spectral_data_array[
                j, :, :, :
            ]
        for j in range(int(nv)):
            for k in range(int(number_of_points)):
                line = np.squeeze(tmp_spectral_data_array_1[j, k, :, i])
                tmp_spectral_data_array_2[j, k, :, i] = line * np.exp(
                    -np.arange(0, int(ne)).T * proton_quarter / et
                )
        tmp_spectral_data_array_3[:, :, 0 : int(ne), i] = tmp_spectral_data_array_2[
            :, :, 0 : int(ne), i
        ]
        tmp_spectral_data_1 = np.fft.fftshift(
            fftn(np.squeeze(tmp_spectral_data_array_3[:, :, :, i]))
        )
        tmp_spectral_data_2 = tmp_spectral_data_1.copy()
        for j in range(0, int(nv)):
            for k in range(0, int(number_of_points)):
                tmp_spectral_data[j, k, :, i] = tmp_spectral_data_2[
                    j, int(number_of_points - k - 1), ::-1
                ]
    spectral_data = np.abs(tmp_spectral_data)
    epsi = epsi_tmp
    return spectral_data


# Method to read specific lines from a 'procpar' file
def read_write_procpar(read_line, file_path):
    """
    Reads specific lines from the 'procpar' file located at 'file_path'.

    :param read_line: The parameter name to be read from 'procpar'.
    :param file_path: The path to the directory containing the 'procpar' file.
    :return: A list of values associated with the given parameter name.
    :rtype: list of float

    @author: Benjamin (Ben) Yoon
    @date: Fri, Jul 21, 2023
    @version: 1.0
    """
    global lro_fid, lpe_fid, lro_epsi, lpe_epsi, x_epsi, epsi, spectral_data
    file_path = file_path + ".fid"
    file_path = os.path.join(file_path, "procpar")
    with open(file_path) as g:
        read_lines = g.readlines()
        for i, line in enumerate(read_lines):
            if line.strip().startswith(read_line):
                line_read = read_lines[i + 1].strip()
                return [float(val) for val in line_read.split()[1:]]


# Method to read data from a 'fid' file
def read_write_fid(file_path):
    """
    Reads and processes data from the 'fid' file.

    :param file_path: The path to the 'fid' file.
    :return: A tuple containing various data elements.
    :rtype: tuple

    @author: Benjamin (Ben) Yoon
    @date: Fri, Jul 21, 2023
    @version: 1.0
    """
    global lro_fid, lpe_fid, lro_epsi, lpe_epsi, x_epsi, epsi, spectral_data
    path = f"{file_path}.fid/fid"
    with open(path, "rb") as fid:
        blocks = struct.unpack(">i", fid.read(4))[0]
        traces = struct.unpack(">i", fid.read(4))[0]
        points = struct.unpack(">i", fid.read(4))[0]
        eb = struct.unpack(">i", fid.read(4))[0]
        tb = struct.unpack(">i", fid.read(4))[0]
        bb = struct.unpack(">i", fid.read(4))[0]
        vi = struct.unpack(">h", fid.read(2))[0]
        s = struct.unpack(">h", fid.read(2))[0]
        number_of_headers = struct.unpack(">i", fid.read(4))[0]
        s32 = int(bool(s & 4))
        sf = int(bool(s & 8))
        real_information = []
        imaginary_information = []
        b = list(range(1, blocks + 1))
        ob = len(b)
        t = list(range(1, traces + 1))
        ot = len(t)
        i = 1
        j = 1
        for k in range(1, blocks + 1):
            # Read a block header
            scale = struct.unpack(">h", fid.read(2))[0]
            bs = struct.unpack(">h", fid.read(2))[0]
            index = struct.unpack(">h", fid.read(2))[0]
            m = struct.unpack(">h", fid.read(2))[0]
            cc = struct.unpack(">i", fid.read(4))[0]
            lv = struct.unpack(">f", fid.read(4))[0]
            rv = struct.unpack(">f", fid.read(4))[0]
            lvl = struct.unpack(">f", fid.read(4))[0]
            tl = struct.unpack(">f", fid.read(4))[0]
            a = 1
            kk = 0
            for c in range(1, traces + 1):
                # Read data for each trace
                if sf == 1:
                    d = struct.unpack(f">{points}f", fid.read(points * 4))
                elif s32 == 1:
                    d = struct.unpack(f">{points}i", fid.read(points * 4))
                else:
                    d = struct.unpack(f">{points}h", fid.read(points * 2))

                # Keep the data if it matches the desired blocks and traces
                if b[j - 1] == k:
                    if a <= ot:
                        if t[a - 1] == c:
                            real_information.append(list(d[::2]))
                            imaginary_information.append(list(d[1::2]))
                            i += 1
                            a += 1
                            kk = 1
            if kk:
                j += 1
            if j > ob:
                break
        real_information = np.array(real_information).T
        imaginary_information = np.array(imaginary_information).T
        number_of_points = points // 2
        number_of_blocks = blocks
        number_of_traces = traces
        header_information = [
            blocks,
            traces,
            points,
            eb,
            tb,
            bb,
            vi,
            s,
            number_of_headers,
            scale,
            bs,
            index,
            m,
            cc,
            lv,
            rv,
            lvl,
            tl,
        ]
        return (
            real_information,
            imaginary_information,
            number_of_points,
            number_of_blocks,
            number_of_traces,
            header_information,
        )


if __name__ == "__main__":
    app.run(debug=True)
