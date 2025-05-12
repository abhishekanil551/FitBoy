const mongoose = require('mongoose');
const { Schema } = mongoose;

const bannerSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'], 
    default: 'inactive'
  },
  startingDate: {
    type: Date,
    required: true
  },
  endingDate: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    required: true 
  }
}, { timestamps: true });

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
