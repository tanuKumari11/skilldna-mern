const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper: Skill Gap Detection
function analyzeSkills(userSkills, githubLanguages) {
  const user = userSkills.map(s => s.toLowerCase());
  const github = githubLanguages.map(s => s.toLowerCase());

  const matched = user.filter(skill => github.includes(skill));
  const missing = user.filter(skill => !github.includes(skill));

  const score = user.length
    ? Math.round((matched.length / user.length) * 100)
    : 0;

  return { matched, missing, score };
}

// API Route
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const { username } = req.body;
    const jobSkills = JSON.parse(req.body.jobSkills || "[]");

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    // Fetch GitHub repos
    const response = await axios.get(
      `https://api.github.com/users/${username}/repos`
    );

    const repos = response.data;

    // Extract languages
    let languages = [];
    repos.forEach(repo => {
      if (repo.language) languages.push(repo.language);
    });

    // Skill Gap Analysis
    const { matched, missing, score } = analyzeSkills(jobSkills, languages);

    // Resume preview (dummy for now)
    let resumePreview = "No resume uploaded";
    if (req.file) {
      resumePreview = "Resume uploaded successfully";
    }

    // Final Report
    const report = `
Profile Summary:
You are working with ${languages.join(", ") || "no major technologies"}.

Strengths:
${matched.length ? matched.map(s => `✔ Good in ${s}`).join("\n") : "No strong match found"}

Weakness:
${missing.length ? missing.map(s => `✘ Missing ${s}`).join("\n") : "No major gaps"}

Suggestions:
- Improve missing skills
- Build real-world projects
- Stay consistent on GitHub
- Learn backend & APIs
`;

    res.json({
      totalRepos: repos.length,
      languages,
      score,
      matchedSkills: matched,
      missingSkills: missing,
      resumePreview,
      report
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to analyze" });
  }
});

// Root test route
app.get("/", (req, res) => {
  res.send("SkillDNA Backend Running 🚀");
});

// PORT FIX (IMPORTANT FOR DEPLOY)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});