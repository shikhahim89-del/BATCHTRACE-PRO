import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-container">

      <div className="about-box">

        <h1>About BatchTrace Pro</h1>

        <p className="about-text">
  BatchTrace Pro is a modern web application designed to manage batches,
  users, and certifications efficiently.
</p>

<p className="about-text">
  It provides a secure and user-friendly platform to track progress
  and streamline workflows.
</p>

        <div className="cards">

          <div className="card">
            <h3>🚀 Mission</h3>
            <p>To simplify batch management.</p>
          </div>

          <div className="card">
            <h3>🌍 Vision</h3>
            <p>To build scalable systems.</p>
          </div>

          <div className="card">
            <h3>🔒 Security</h3>
            <p>We protect user data securely.</p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default About;