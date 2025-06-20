const mongoose = require('mongoose')
const Students = new mongoose.Schema({
    id : {type: String, required: true},
    name:  {type: String, required: true},
    part: {type: String, required: true},
    voted : {type: Boolean, required: true},
})

module.exports = mongoose.model('students',Students)