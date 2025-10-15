const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const PracticeLog = require('../models/PracticeLog');

const router = express.Router();
const Transaction = require('../models/Transaction');

router.get('/prefs', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ language: user.language, completedTutorials: user.completedTutorials });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/prefs', auth, async (req, res) => {
  try {
    console.log('POST /prefs - Request body:', req.body);
    console.log('POST /prefs - User ID:', req.user?.id);
    
    // Check if req.body exists and has the language property
    if (!req.body || typeof req.body !== 'object') {
      console.log('POST /prefs - Error: Request body is required');
      return res.status(400).json({ error: 'Request body is required' });
    }
    
    const { language } = req.body;
    
    // Validate that language is provided
    if (!language) {
      console.log('POST /prefs - Error: Language is required');
      return res.status(400).json({ error: 'Language is required' });
    }
    
    const user = await User.findByIdAndUpdate(req.user.id, { language }, { new: true });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ language: user.language });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/practice', auth, async (req, res) => {
  try {
    // Check if req.body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body is required' });
    }
    
    const { type, payload } = req.body;
    
    // Validate required fields
    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }
    
    const log = await PracticeLog.create({ userId: req.user.id, type, payload });
    res.json({ id: log._id, createdAt: log.createdAt });
  } catch (error) {
    console.error('Error creating practice log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/practice', auth, async (req, res) => {
  try {
    const logs = await PracticeLog.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    console.error('Error fetching practice logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

// Create a transaction (e.g., after simulated payment)
router.post('/transactions', auth, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Request body is required' });
    }
    const { type, name, amount, number, status, meta } = req.body;
    if (!type || !name || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const trx = await Transaction.create({
      userId: req.user.id,
      type,
      name,
      number,
      amount,
      status: status || (type === 'received' ? 'Credited to' : type === 'failed' ? 'Failed' : 'Debited from'),
      meta: meta || {},
    });
    res.json({ id: trx._id, createdAt: trx.createdAt });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List transactions for the current user (most recent first)
router.get('/transactions', auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
    const items = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ items });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




