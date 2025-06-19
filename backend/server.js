const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Import models
const Students = require('../model/Students');
const Candidates = require('../model/Candidate');

// Load environment variables
require("dotenv").config({ path: "../.env" });

// Connect to MongoDB
mongoose.connect(process.env.LINK)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Connection error:', err));

// Serve static files from /public
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// Serve index.html on root route
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ✅ Use Railway's dynamic port or fallback to 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// ==== ROUTES ==== //

// Check student voting status
app.post('/check', async (req, res) => {
  const { id } = req.body;
  console.log("Checking ID:", id);

  try {
    const stud = await Students.find({ id, voted: false });

    if (stud.length > 0) {
      console.log("Matched Students:", stud);
      res.status(201).json({ stud });
    } else {
      console.log("Student does not exist or has already voted.");
      res.status(404).json({ error: "Student does not exist" });
    }
  } catch (e) {
    console.error("Check error:", e);
    res.status(500).json({ error: "Server error" });
  }
});


// Submit votes
app.post('/addVote', async (req, res) => {
  const { votes, id } = req.body;
  console.log("Received vote from ID:", id);

  if (!Array.isArray(votes) || votes.length !== 2) {
    return res.status(400).json({ message: "You must vote for exactly 2 candidates." });
  }

  try {
    // Mark student as voted
    const updateVote = await Students.updateOne({ id }, { $set: { voted: true } });
    console.log("Updated student:", updateVote);

    // Increment votes for candidates
    const updateResults = await Promise.all(
      votes.map(candidateId =>
        Candidates.updateOne({ id: candidateId }, { $inc: { total_votes: 1 } })
      )
    );

    console.log("Updated candidate results:", updateResults);
    res.status(200).json({ message: "Votes recorded", results: updateResults });
  } catch (e) {
    console.error("Error updating votes:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get candidate list
app.get("/getCandidates", async (req, res) => {
  try {
    const candidates = await Candidates.find();
    res.status(200).json({ candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
