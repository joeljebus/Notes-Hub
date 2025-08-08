import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AuthStyles.css";

const UploadNote = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    department: "",
    year: "",
    subject: "",
    unit: "",
    topic: "",
  });
  const [pdf, setPdf] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPdf(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdf) {
      return alert("Please upload a PDF file.");
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      formData.append(key, val);
    });
    formData.append("pdf", pdf);
    formData.append("uploadedBy", localStorage.getItem("userName"));

    // 🔍 Debugging formData
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/notes/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Note uploaded successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Upload error:", err);
      alert(
        "Failed to upload note: " +
          (err.response?.data?.message || err.message || "Unknown error")
      );
    }
  };

  return (
    <div className="auth-container" style={{ padding: "2rem" }}>
      <div className="auth-card">
        <h2 className="auth-heading">Upload Class Notes (PDF)</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <input
            className="auth-input"
            type="text"
            name="title"
            placeholder="Title"
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="text"
            className="auth-input"
            name="department"
            placeholder="Department"
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="text"
            className="auth-input"
            name="year"
            placeholder="Year"
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="text"
            className="auth-input"
            name="subject"
            placeholder="Subject"
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="text"
            className="auth-input"
            name="unit"
            placeholder="Unit"
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="text"
            className="auth-input"
            name="topic"
            placeholder="Topic"
            onChange={handleChange}
            required
          />
          <br />
          <input
            className="auth-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            required
          />
          <br />
          <button className="auth-button" type="submit">
            Upload
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadNote;
