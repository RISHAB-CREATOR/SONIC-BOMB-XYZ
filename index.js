const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// GitHub API configuration
const GITHUB_REPO = "fmhy/edit";
const GITHUB_BRANCH = "main";
const BASE_URL = `https://api.github.com/repos/${GITHUB_REPO}/commits`;

// Function to fetch all commits with pagination
const fetchAllCommits = async () => {
    const commits = [];
    let page = 1;

    try {
        while (true) {
            const response = await axios.get(BASE_URL, {
                params: {
                    sha: GITHUB_BRANCH,
                    per_page: 100, // Maximum allowed per page
                    page: page,
                },
            });

            // Append the fetched commits
            commits.push(...response.data);

            // Break if there are no more commits to fetch
            if (response.data.length < 100) {
                break;
            }

            page++;
        }
    } catch (error) {
        console.error("Error fetching commits:", error.message);
    }

    return commits;
};

// API endpoint
app.get('/repo-info', async (req, res) => {
    const commits = await fetchAllCommits();

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
        date: lastCommit.commit.author.date, // ISO 8601 date format
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
