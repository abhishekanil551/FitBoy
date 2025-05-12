const mongoose = require('mongoose');
const { Schema } = mongoose;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  isListed: {
    type: Boolean,
    default: true 
  }
}, { timestamps: true });

const category=mongoose.model('Category', categorySchema);
 module.exports =category;