const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  transactionId: {
    type: String
  },
  couponId: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null
  },
  total: {
    type: Number,
    required: true
  },
  order_items: [{
    type: Schema.Types.ObjectId,
    ref: 'OrderItem'
  }]
},
 { timestamps: true });
 

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
