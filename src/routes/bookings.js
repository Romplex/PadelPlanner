const express = require('express');
const Slot = require('../models/Slot');
const router = express.Router();

router.post('/', async (req, res) => {
  const { slotId } = req.body;
  const user = req.session.user;
  if (!user) return res.status(401).send('Login required');
  
  const success = await Slot.bookSlot(slotId, user);
  res.json({ success });
});

module.exports = router;