// App.js
// Main routing component for the EPSI App.
// Author: Benjamin Yoon
// Date: Mar 15 2024
// Version: 1.1.1
// This version adds navigation between the home page and an about page,
// updates the app's icon and title, introduces a README file, and marks the app's
// official hosting on AWS. Previous features were introduced in versions 1.0.0, 1.0.1, and 1.1.0.

import './App.css'; // Importing CSS styles.
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importing components for routing.
import HomePage from './HomePage'; // HomePage component.
import AboutPage from './AboutPage'; // AboutPage component.

// The main function component for the app.
function App() {
    // Router component to manage routing between HomePage and AboutPage.
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} /> // Route for the home page.
                <Route path="/about" element={<AboutPage />} /> // Route for the about page.
            </Routes>
        </Router>
    );
}

export default App; // Exporting App component for use in index.js.
