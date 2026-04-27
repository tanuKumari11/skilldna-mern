const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");

const app = express();

// ✅ FIX 1: Proper CORS (IMPORTANT)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ FIX 2: Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Helper function
function analyzeSkills(userSkills, githubLanguages) {
  const user = userSkills.map((s) => s.toLowerCase());
  const github = githubLanguages.map((s) => s.toLowerCase());

  const matched = user.filter((skill) => github.includes(skill));
  const missing = user.filter((skill) => !github.includes(skill));

  const score = user.length
    ? Math.round((matched.length / user.length) * 100)
    : 0;

  return { matched, missing, score };
}

// ✅ API ROUTE
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const { username } = req.body;

    // ✅ FIX 3: Safe JSON parsing
    let jobSkills = [];

try {
  if (req.body.jobSkills) {
    jobSkills = JSON.parse(req.body.jobSkills);
  }
} catch (err) {
  console.log("JSON parse error:", err);
  jobSkills = [];
}

    if (!username) {
      return res.status(400).json({ error: "Username required" });
    }

    // ✅ FIX 4: GitHub API with headers (VERY IMPORTANT)
    const response = await axios.get(
  `https://api.github.com/users/${username}/repos`,
  {
    headers: {
      "User-Agent": "SkillDNA-App",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, // 🔥 FIX
    },
  }
);

    const repos = response.data;

    // Extract languages
    let languages = [];
    repos.forEach((repo) => {
      if (repo.language) languages.push(repo.language);
    });

    // Skill analysis
    const { matched, missing, score } = analyzeSkills(
      jobSkills,
      languages
    );

    let resumePreview = "No resume uploaded";
    if (req.file) {
      resumePreview = "Resume uploaded successfully";
    }

    const report = `
Profile Summary:
You are working with ${languages.join(", ") || "no major technologies"}.

Strengths:
${
  matched.length
    ? matched.map((s) => `✔ Good in ${s}`).join("\n")
    : "No strong match found"
}

Weakness:
${
  missing.length
    ? missing.map((s) => `✘ Missing ${s}`).join("\n")
    : "No major gaps"
}

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
      report,
    });
  } catch (error) {
  console.error("FULL ERROR:", error);

  res.status(500).json({
    error: "Failed to analyze",
    message: error.message
  });
}
});

// Root route
app.get("/", (req, res) => {
  res.send("SkillDNA Backend Running 🚀");
});

// PORT FIX
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

// async function fetchRepos(username) {
//   try {
//     return await axios.get(
//       `https://api.github.com/users/${username}/repos`,
//       {
//         headers: { "User-Agent": "SkillDNA-App" },
//         timeout: 20000,
//       }
//     );
//   } catch (err) {
//     console.log("Retrying GitHub API...");
//     return await axios.get(
//       `https://api.github.com/users/${username}/repos`,
//       {
//         headers: { "User-Agent": "SkillDNA-App" },
//         timeout: 20000,
//       }
//     );
//   }
// }
// const response = await fetchRepos(username);






















































// const express = require("express");
// const cors = require("cors");
// const multer = require("multer");
// const axios = require("axios");

// const app = express();

// // Middleware
// app.use(cors({ origin: "*" }));
// app.use(express.json());

// // File upload setup
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // Helper: Skill Gap Detection
// function analyzeSkills(userSkills, githubLanguages) {
//   const user = userSkills.map(s => s.toLowerCase());
//   const github = githubLanguages.map(s => s.toLowerCase());

//   const matched = user.filter(skill => github.includes(skill));
//   const missing = user.filter(skill => !github.includes(skill));

//   const score = user.length
//     ? Math.round((matched.length / user.length) * 100)
//     : 0;

//   return { matched, missing, score };
// }

// // API Route
// app.post("/analyze", upload.single("resume"), async (req, res) => {
//   try {
//     const { username } = req.body;
//     const jobSkills = JSON.parse(req.body.jobSkills || "[]");

//     if (!username) {
//       return res.status(400).json({ error: "Username required" });
//     }

//     // Fetch GitHub repos
//     const response = await axios.get(
//       `https://api.github.com/users/${username}/repos`
//     );

//     const repos = response.data;

//     // Extract languages
//     let languages = [];
//     repos.forEach(repo => {
//       if (repo.language) languages.push(repo.language);
//     });

//     // Skill Gap Analysis
//     const { matched, missing, score } = analyzeSkills(jobSkills, languages);

//     // Resume preview (dummy for now)
//     let resumePreview = "No resume uploaded";
//     if (req.file) {
//       resumePreview = "Resume uploaded successfully";
//     }

//     // Final Report
//     const report = `
// Profile Summary:
// You are working with ${languages.join(", ") || "no major technologies"}.

// Strengths:
// ${matched.length ? matched.map(s => `✔ Good in ${s}`).join("\n") : "No strong match found"}

// Weakness:
// ${missing.length ? missing.map(s => `✘ Missing ${s}`).join("\n") : "No major gaps"}

// Suggestions:
// - Improve missing skills
// - Build real-world projects
// - Stay consistent on GitHub
// - Learn backend & APIs
// `;

//     res.json({
//       totalRepos: repos.length,
//       languages,
//       score,
//       matchedSkills: matched,
//       missingSkills: missing,
//       resumePreview,
//       report
//     });

//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ error: "Failed to analyze" });
//   }
// });

// // Root test route
// app.get("/", (req, res) => {
//   res.send("SkillDNA Backend Running 🚀");
// });

// // PORT FIX (IMPORTANT FOR DEPLOY)
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log("Server running on port", PORT);
// });