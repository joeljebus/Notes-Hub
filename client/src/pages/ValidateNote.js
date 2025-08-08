// src/pages/ValidateNotes.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ValidationStyles.css"; // custom styles (create if not exists)

const StarRating = ({ rating, onChange }) => {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "filled" : "empty"}
          onClick={() => onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ValidateNotes = () => {
  const [notes, setNotes] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    const fetchUnvalidatedNotes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/notes/unvalidated",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userId = JSON.parse(atob(token.split(".")[1])).id;
        const filteredNotes = res.data.filter(
          (note) =>
            !note.validations?.some(
              (v) => v.ratedBy === userId || v.ratedBy?._id === userId
            )
        );
        setNotes(filteredNotes);

        // ✅ Use directly
      } catch (err) {
        console.log("Fetch error:", err);
        alert("Failed to fetch notes to validate");
      }
    };

    fetchUnvalidatedNotes();
  }, []);


  const handleValidate = async (noteId) => {
    const stars = ratings[noteId];
    const comment = comments[noteId] || "";
    if (!stars) return alert("Please select a star rating");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/notes/validate/${noteId}`,
        { stars, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Note validated successfully");
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error("🛑 Validation failed:", err.response?.data || err.message);
      alert(
        `Validation failed: ${err.response?.data?.message || "Server error"}`
      );
    }

  };

  return (
    <div className="validate-container">
      <h2>Validate Uploaded Notes</h2>
      {notes.length === 0 && <p>No pending notes for validation.</p>}
      <ul className="note-list">
        {notes.map((note) => (
          <li key={note._id} className="note-item">
            <strong>{note.title || note.topic}</strong> - {note.subject} (Unit{" "}
            {note.unit})<br />
            <a
              href={`http://localhost:5000/${note.pdfUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              View PDF
            </a>
            <div className="rating-section">
              <label>Rate:</label>
              <StarRating
                rating={ratings[note._id] || 0}
                onChange={(star) =>
                  setRatings({ ...ratings, [note._id]: star })
                }
              />
            </div>
            <textarea
              placeholder="Comment (optional)"
              value={comments[note._id] || ""}
              onChange={(e) =>
                setComments({ ...comments, [note._id]: e.target.value })
              }
            />
            <button onClick={() => handleValidate(note._id)}>
              Submit Validation
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ValidateNotes;
