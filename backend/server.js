const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');
const Students =  require('../model/Students');
const Candidates =  require('../model/Candidate');

require("dotenv").config({ path: "../.env" });

// Admin password - take from env
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

mongoose.connect(process.env.LINK) //connecting db

    .then(() => console.log('MongoDB connected'))

    .catch(err => console.log('Connection error:', err));


// tells express to serve static files dekat folder public
app.use(express.static(path.join(__dirname, '..', 'public')));
// Serve static files from the 'assets' folder for images, CSS, JS, etc.
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// CHECK STUDENTS ID
app.post('/check', async (req,res) =>{
  
    const { studentId } = req.body;
    console.log(studentId);

    try{
      
       const stud = await Students.find({ id : studentId,voted:false});

       if(stud.length > 0){
        
         console.log("Matched Students:", stud);
        res.status(200).json({ stud });

       }else{
         console.log("Student does not exist");
         res.status(404).json({ error: "Student does not exist" });
       }
        
       
    }
    catch (e) {
        console.error(e);
    }
});

// ADD VOTE
app.post('/addVote', async (req, res) => {
  const { votes,studentId } = req.body;
  console.log("Received id",studentId)
  console.log(votes)

  if (!Array.isArray(votes) || votes.length !== 2) {
    console.log("error")
    return res.status(400).json({ message: "You must vote for exactly 2 candidates." });
  }

  try {
  const updateVote = await Students.updateOne({  id : studentId }, { $set: { voted:true } });
  console.log("Updated student:", updateVote);
  const updateResults = await Promise.all(
  votes.map(id =>
    Candidates.updateOne({ id }, { $inc: { total_votes: 1 } })
  )
  
);

  console.log("Results:", updateResults);

    res.status(200).json({ message: "Votes recorded", results: updateResults });
  } catch (e) {
    console.error("Error updating votes:", e);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET CANDIDATES DATA
app.get("/getCandidates", async (req, res) => {
  try {
    const candidates = await Candidates.find();
    res.status(200).json({ candidates });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET STUDENTS DATA
app.get("/getStudents", async (req, res) => {
  try {

    const [ 
      totalStudents, 
      totalVoted, 
      totalUnvoted
    ] = await Promise.all([
      Students.countDocuments({}),
      Students.countDocuments({ voted: true }),
      Students.countDocuments({ voted:  false})
    ]);

    res.status(200).json({ totalStudents,totalVoted,totalUnvoted });


  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET VOTERS
app.get("/getVoters", async (req, res) => {
  try {
    const voters = await Students.find();
    res.status(200).json({ voters });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin authentication
app.post('/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    
    if (password === ADMIN_PASSWORD) {
      res.status(200).json({ 
        success: true, 
        message: "Authentication successful" 
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: "Invalid password" 
      });
    }
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
