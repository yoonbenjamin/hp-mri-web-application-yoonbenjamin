/**
 * AboutPage.js
 * 
 * This component renders the About Page for the EPSI App. It provides insights into
 * the Penn Image-Guided Interventions (PIGI) Lab and introduces the development team.
 * Version 1.1.1 introduces an About page accessible from the main application, enhancing
 * user engagement and providing background information on the project and its contributors.
 *
 * @version 1.1.1
 * @author Benjamin Yoon
 * @date 2024-03-15
 */

import React from 'react';
import { Link } from 'react-router-dom';
import './AboutPage.css'; // Styles for the About Page layout and content

function AboutPage() {
  return (
    <div className="about-page">
      <h1>About</h1>
      {/* PIGI Lab Section */}
      <section className="about-section">
        <h2>
          <a href="https://www.pigilab.com/" target="_blank" rel="noopener noreferrer" className="pigilab-link">
            PIGI Lab
          </a>
        </h2>
        <p>
          The Penn Image-Guided Interventions Lab is part of the Departments of Radiology and
          Cancer Biology in the Perelman School of Medicine at the University of Pennsylvania.
          The lab focuses on translational research for developing novel imaging approaches
          and advanced therapeutics in interventional radiology. Our research is motivated by
          clinical needs and aims to bridge bench-to-bedside gaps in diagnosis and treatment.
        </p>
      </section>
      {/* Author and Team Section */}
      <section className="author-section">
        <h2>Medcap Computing</h2>
        <h3>Terence P. Gade, MD, PhD</h3>
        <p>Co-Director of PIGI Lab, Assistant Professor of Radiology and Cancer Biology</p>
        <h3>Alexander “Shurik” Zavriyev, mS</h3>
        <p>PhD student, focusing on HP imaging applications in clinical models</p>
        <h3>Team Lead Developer: Benjamin Yoon</h3>
        <p>
          B.S.E. student at the University of Pennsylvania, developing impactful software solutions. Benjamin's work
          showcases his commitment to leveraging technology for transformative purposes.
        </p>
        <h3>Steve Kadlecek</h3>
        <h3>Zihao Zhou</h3>
      </section>
      {/* Navigation back to the main app page */}
      <Link to="/" className="back-to-home">Back to EPSI App</Link>
    </div>
  );
}

export default AboutPage;
