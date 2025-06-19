const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const Students = require('../model/Students');
const Candidates = require('../model/Candidate');

require('dotenv').config({ path: '../.env' });

// ✅ CONNECT DB
mongoose.connect(process.env.LINK)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Connection error:', err));

// ✅ SERVE STATIC FILES CORRECTLY
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ✅ USE RAILWAY'S PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
