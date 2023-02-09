const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    path:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        immutable:true,
        default:()=> Date.now()
    }
});



let file = mongoose.model('subtitles', fileSchema);

module.exports = { file }