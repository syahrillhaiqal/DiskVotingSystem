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

mongoose.connect(process.env.LINK) //connecting db

    .then(() => console.log('MongoDB connected'))

    .catch(err => console.log('Connection error:', err));


// tells express to serve static files dekat folder public
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



app.post('/check', async (req,res) =>{
  
    const { id } = req.body;
    console.log(id);

    try{
      
       const stud = await Students.find({ id,voted:false});

       if(stud.length > 0){
         console.log("Matched Students:", stud);
        res.status(201).json({stud });
       }else{
         console.log("Student does not exist");
         res.status(404).json({ error: "Student does not exist" });
       }
        
       
    }
    catch (e) {
        console.error(e);
    }
});

app.post('/addVote', async (req, res) => {
  const { votes,id } = req.body;
  console.log("Received id",id)

  if (!Array.isArray(votes) || votes.length !== 2) {
    return res.status(400).json({ message: "You must vote for exactly 2 candidates." });
  }

  try {
  const updateVote = await Students.updateOne({ id }, { $set: { voted:true } });
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
