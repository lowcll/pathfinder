import React, { useState } from "react";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thanks for reaching out! We'll get back to you soon.");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>📬 Contact Us</h2>
      <p style={{ marginBottom: "2rem", fontSize: "16px" }}>
        Have questions, feedback, or just want to say hello? Fill out the form below—we'd love to hear from you!
      </p>
      <form onSubmit={handleSubmit} style={formStyle}>
        <label style={labelStyle}>Your Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Email Address</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label style={labelStyle}>Message</label>
        <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        rows="5"
        required
        style={textareaStyle}
        />
        <button type="submit" style={buttonStyle}>🚀 Send Message</button>
      </form>
    </div>
  );
};

// 🔵 Styling
const containerStyle = {
  padding: "2rem",
  maxWidth: "600px",
  margin: "0 auto",
  backgroundColor: "#e3f2fd",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  color: "#212121",
};

const headingStyle = {
  textAlign: "center",
  fontSize: "2rem",
  marginBottom: "1rem",
  color: "#0077cc",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  fontWeight: "bold",
  marginBottom: "6px",
};

const inputStyle = {
    padding: "10px",
    marginBottom: "20px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
    backgroundColor: "#ffffff", 
    color: "#000000",          
  };
  
  const textareaStyle = {
    ...inputStyle,
    resize: "vertical",
  };
  

const buttonStyle = {
  padding: "12px",
  backgroundColor: "#0077cc",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
  transition: "background-color 0.3s ease",
};

export default ContactUs;
