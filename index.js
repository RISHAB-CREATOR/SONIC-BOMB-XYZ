const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// GitHub API configuration
const GITHUB_REPO = "fmhy/edit";
const GITHUB_BRANCH = "main";
const BASE_URL = `https://api.github.com/repos/${GITHUB_REPO}/commits`;

// Helper function to fetch commits
const fetchCommits = async () => {
    try {
        const response = await axios.get(`${BASE_URL}?sha=${GITHUB_BRANCH}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching commits:", error.message);
        return [];
    }
};

// API endpoint
app.get('/repo-info', async (req, res) => {
    const commits = await fetchCommits();

    if (commits.length === 0) {
        return res.status(500).json({ error: "Failed to fetch commit data." });
    }

    // Total commits
    const totalCommits = commits.length;

    // Last commit details
    const lastCommit = commits[0];
    const lastCommitDetails = {
        message: lastCommit.commit.message,
        author: lastCommit.commit.author.name,
        url: lastCommit.html_url,
    };

    // Total commits by each author
    const commitsByAuthor = {};
    commits.forEach(commit => {
        const authorName = commit.commit.author.name;
        if (!commitsByAuthor[authorName]) {
            commitsByAuthor[authorName] = 0;
        }
        commitsByAuthor[authorName]++;
    });

    res.json({
        totalCommits,
        lastCommit: lastCommitDetails,
        commitsByAuthor,
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
