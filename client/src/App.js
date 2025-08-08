// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";

import UploadNote from "./pages/UploadNote";

import ValidateNote from "./pages/ValidateNote";




import ViewNotes from "./pages/ViewNotes";





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadNote />} />;
        <Route path="/validate" element={<ValidateNote />} />;
        <Route path="/view" element={<ViewNotes />} />;
      </Routes>
    </Router>
  );
}

export default App;
