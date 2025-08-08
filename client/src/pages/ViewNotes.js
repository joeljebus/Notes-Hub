import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AuthStyles.css";
import "./dashboard.css";

const ViewNotes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    subject: "",
    unit: "",
  });
  const [options, setOptions] = useState({
    departments: [],
    subjects: [],
    units: [],
  });
  const [credits, setCredits] = useState(0);

  const [showComments, setShowComments] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const userRes = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCredits(userRes.data.creditsEarned || 0);

        const notesRes = await axios.get(
          "http://localhost:5000/api/notes/view",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setNotes(notesRes.data);
        extractFilterOptions(notesRes.data);
      } catch (err) {
        console.error("❌ Error fetching notes/user:", err);
        alert("Error fetching data");
      }
    };

    fetchData();
  }, []);

  const extractFilterOptions = (data) => {
    const departments = [...new Set(data.map((n) => n.department))];
    const subjects = [...new Set(data.map((n) => n.subject))];
    const units = [...new Set(data.map((n) => n.unit))];
    setOptions({ departments, subjects, units });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    const filtered = notes.filter((note) => {
      return (
        (!newFilters.department || note.department === newFilters.department) &&
        (!newFilters.subject || note.subject === newFilters.subject) &&
        (!newFilters.unit || note.unit.toString() === newFilters.unit)
      );
    });

    setFilteredNotes(filtered);
  };

  const displayedNotes = filteredNotes.length > 0 ? filteredNotes : notes;

  return (
    <div className="auth-container" style={{ padding: "2rem" }}>
      <div className="auth-card">
        <h2 className="auth-heading">📚 View Notes</h2>

        <div
          className="credit-display"
          style={{ position: "absolute", top: "10px", right: "20px" }}
        >
          <strong>Credits:</strong> {credits}
        </div>

        {/* Filter Controls */}
        <div style={{ marginBottom: "1rem" }}>
          <select
            name="department"
            onChange={handleFilterChange}
            value={filters.department}
          >
            <option value="">All Departments</option>
            {options.departments.map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>

          <select
            name="subject"
            onChange={handleFilterChange}
            value={filters.subject}
           
          >
            <option value="">All Subjects</option>
            {options.subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <select
            name="unit"
            onChange={handleFilterChange}
            value={filters.unit}
           
          >
            <option value="">All Units</option>
            {options.units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        {/* Notes Display */}
        <ul>
          {displayedNotes.map((note) => (
            <li key={note._id} style={{ marginBottom: "1.5rem" }}>
              <strong>{note.title || note.topic}</strong> - {note.subject} (Unit{" "}
              {note.unit})
              <br />
              {note.canAccess ? (
                <a
                  href={`http://localhost:5000/${note.pdfUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "green" }}
                >
                  View PDF
                </a>
              ) : (
                <span style={{ color: "gray" }}>🔒 Not enough credits</span>
              )}
              {/* Ratings */}
              {note.avgStars ? (
                <div style={{ marginTop: "0.5rem" }}>
                  ⭐ Average Rating:{" "}
                  <span style={{ fontWeight: "bold" }}>
                    {note.avgStars} / 5
                  </span>
                  <br />
                  <button
                    onClick={() => {
                      setSelectedComments(note.comments);
                      setShowComments(true);
                    }}
                    style={{
                      backgroundColor: "#eee",
                      border: "none",
                      padding: "5px 10px",
                      marginTop: "4px",
                      cursor: "pointer",
                      borderRadius: "6px",
                    }}
                  >
                    💬 View Comments
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: "0.5rem", color: "gray" }}>
                  No ratings yet
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Modal to Show Comments */}
      {showComments && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowComments(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              minWidth: "300px",
              maxWidth: "500px",
              maxHeight: "70vh",
              overflowY: "auto",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>💬 Comments</h3>
            {selectedComments.length ? (
              <ul>
                {selectedComments.map((cmt, idx) => (
                  <li key={idx} style={{ marginBottom: "10px" }}>
                    📝 {cmt}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No comments available.</p>
            )}
            <button
              style={{
                marginTop: "1rem",
                backgroundColor: "#333",
                color: "#fff",
                border: "none",
                padding: "6px 12px",
                borderRadius: "5px",
              }}
              onClick={() => setShowComments(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewNotes;
