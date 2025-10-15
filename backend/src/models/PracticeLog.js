const mongoose = require('mongoose');

const practiceLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['send_money', 'book_ticket', 'order_food'], required: true },
    payload: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PracticeLog', practiceLogSchema);




