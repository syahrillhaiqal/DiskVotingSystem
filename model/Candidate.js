const mongoose = require('mongoose')
const Candidates = new mongoose.Schema({
    id : {type: String, required: true},
    name : {type: String, required: true},
    candidate_pic : {type: String, required: true},
    candidate_poster : {type: String, required: true},
    candidates_vid : {type: String, required: true},
    total_votes : {type: Number, required: true},
})

module.exports = mongoose.model('candidates',Candidates)