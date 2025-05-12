const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: String,
  discountPercentage: Number,
  type: { type: String, enum: ['seasonal', 'manual'] },
  duration: {
    start: Date,
    end: Date
  },
  isListed:{
    type:Boolean,
    default:true
  },
  createdAt: { type: Date, default: Date.now }
});



const offer = mongoose.model('Offer', offerSchema);
module.exports=offer;