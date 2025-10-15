const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    language: { type: String, default: 'en' },
    completedTutorials: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);




