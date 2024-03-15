# EPSI App

## Introduction
EPSI App is a dynamic data visualization tool developed by Benjamin Yoon and Medcap Computing at the PIGI Lab (University of Pennsylvania Perelman School of Medicine), designed to facilitate the analysis and interpretation of EPSI (Echo Planar Spectroscopic Imaging) data. Through an intuitive user interface, users can interactively adjust image slices, contrast levels, and dataset parameters, and visualize EPSI grids overlaid on proton images.

## Features
- Interactive sliders for adjusting image slices and contrast.
- Real-time EPSI grid overlay on proton images.
- Dynamic grid position adjustment with control buttons.
- Ability to toggle EPSI data display on/off.
- Responsive design for various window sizes.
- Export functionality to save the current view as a PNG image.
- Access to an About page with additional information about the app and developers.

## Installation (Local)
- Create a new folder with subfolders frontend, backend, and data. Install dependencies for React App in frontend and Flask in backend 
- Clone the repository to access source code

```bash
git clone https://github.com/benjaminyoon/Epsi-App.git epsi-app
```

- Replace public and src in your frontend folder with src and public from github
- Place EpsiGui.py into your backend folder
- Place your data into your data folder

## Usage
- Start the application locally (separate shell instance):

```bash
cd <your-folder>/backend
source .venv/bin/activate
python EpsiGui.py
```

```bash
cd <your-folder>/frontend
npm start
```

- Navigate to http://localhost:3000 in your web browser to access the EPSI App.

## License
This project is licensed under the MIT License - React (software)

## About PIGI Lab
PIGI Lab is a MRI technology research lab in the University of Pennsylvania Perelman School of Medicine dedicated to creating innovative solutions across various fields. Learn more at www.pigilab.com.

## Author
Benjamin Yoon, EPSI App lead developer, is a B.S.E. student at the University of Pennsylvania. For any questions or suggestions regarding the EPSI App, please contact us:

- Benjamin Yoon - yoonb2002@gmail.com

2024 University of Pennsylvania Perelman School of Medicine, PIGI Lab. All rights reserved.
