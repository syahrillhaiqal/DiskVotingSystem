const mongoose = require('mongoose')
const Candidates = new mongoose.Schema({
    id : {type: String, required: true},
    total_votes : {type: Number, required: true},
})

module.exports = mongoose.model('candidates',Candidates)