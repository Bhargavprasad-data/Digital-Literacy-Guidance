const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    type: { type: String, enum: ['paid', 'received', 'failed'], required: true },
    name: { type: String, required: true },
    number: { type: String },
    amount: { type: Number, required: true },
    status: { type: String, default: '' },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);


