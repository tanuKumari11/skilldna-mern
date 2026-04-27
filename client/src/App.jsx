import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [username, setUsername] = useState("");
  const [skills, setSkills] = useState("");
  const [file, setFile] = useState(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setError("");
      setLoading(true);
      setData(null);

      const formData = new FormData();
      formData.append("username", username);

      const skillArray = skills.split(",").map((s) => s.trim());
      formData.append("jobSkills", JSON.stringify(skillArray));

      if (file) formData.append("resume", file);

      const res = await axios.post(
        "https://skilldna-backend-ice7.onrender.com/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 20000, // ✅ prevents early failure
        }
      );

      setData(res.data);
    } catch (err) {
      console.log(err); // 👈 IMPORTANT for debugging
      setError("⚠️ Failed to analyze.");
    } finally {
      setLoading(false);
    }
  };

  const languageCounts = data
    ? data.languages.reduce((acc, lang) => {
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {})
    : {};

  const maxCount = Math.max(...Object.values(languageCounts), 1);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">🚀 SkillDNA</div>
        <nav>
          <p className="nav-item active">Dashboard</p>
          <p className="nav-item">Analyze</p>
        </nav>
      </aside>

      <main className="main">
        <div className="topbar">
          <h2>SkillDNA Analyzer</h2>
          <span className="status">Online</span>
        </div>

        <div className="grid">
          {/* FORM */}
          <div className="card">
            <h3>Analyze Profile</h3>

            <input
              placeholder="GitHub Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              placeholder="Skills (JavaScript, Python)"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />

            <label className="file-btn">
              Choose PDF
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            {file && <p className="file-name">{file.name}</p>}

            <button onClick={handleSubmit}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>

            {error && <p className="error">{error}</p>}
          </div>

          {/* STATS */}
          <div className="card stats">
            <h3>Stats</h3>

            <div className="stat-box">
              <p>Total Repos</p>
              <h2>{data ? data.totalRepos : "--"}</h2>
            </div>

            <div className="stat-box">
              <p>Score</p>
              <h2>{data ? data.score + "%" : "--"}</h2>
            </div>
          </div>

          {/* LANGUAGES */}
          <div className="card chart">
            <h3>Languages</h3>

            {data ? (
              Object.entries(languageCounts).map(([lang, count]) => (
                <div key={lang} className="bar-row">
                  <span>{lang}</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p>No data</p>
            )}
          </div>

          {/* RESUME */}
          <div className="card resume">
            <h3>Resume Preview</h3>
            <p>
              {data ? data.resumePreview : "Upload resume to preview..."}
            </p>
          </div>

          {/* REPORT */}
          <div className="card report">
            <h3>Analysis Report</h3>

            {!data ? (
              <p>No analysis yet...</p>
            ) : (
              <>
                <h4>Profile Summary</h4>
                <p>
                  You are working with{" "}
                  {Object.keys(languageCounts).join(", ")}
                </p>

                <h4>Strengths</h4>
                <ul>
                  {Object.keys(languageCounts).map((lang, i) => (
                    <li key={i}>Good understanding of {lang}</li>
                  ))}
                </ul>

                <h4>Weakness</h4>
                <ul>
                  {data.score < 40 && (
                    <li>Low match with required job skills</li>
                  )}
                  <li>Lack of backend/API experience</li>
                  <li>Limited real-world projects</li>
                </ul>

                <h4>Suggestions</h4>
                <ul>
                  <li>Focus on one stack (MERN recommended)</li>
                  <li>Build 2–3 strong projects</li>
                  <li>Improve GitHub activity</li>
                  <li>Learn APIs & database integration</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;