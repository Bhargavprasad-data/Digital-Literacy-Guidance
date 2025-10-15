const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api', require('./routes/app'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

async function start() {
  const port = process.env.PORT || 5000;
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_guide';
  await mongoose.connect(uri);
  app.listen(port, () => console.log(`API listening on ${port}`));
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

module.exports = app;


