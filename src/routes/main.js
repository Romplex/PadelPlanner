const express = require('express');
const Slot = require('../models/Slot');
const { fetchAllFreeSlots } = require('../scraper');
const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const slots = await Slot.getAvailableSlots(req.session.user);
  const today = new Date().toISOString().split('T')[0];
  const futureSlots = slots.filter(slot => slot.date >= today);
  res.render('index', { slots: futureSlots, user: req.session.user });
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', (req, res) => {
  req.session.user = req.body.username;
  // localStorage.removeItem('selectedDate'); not working... "localStorage is not defined.. 
  res.redirect('/');
});

router.get('/scrape', async (req, res) => {
  if (req.query.key !== process.env.SCRAPE_KEY) {
    return res.status(403).send('Unauthorized');
  }
  try {
    await fetchAllFreeSlots();
    res.send('Scraper erfolgreich ausgeführt.');
  } catch (error) {
    res.status(500).send('Scraper-Fehler: ' + error.message);
  }
});

module.exports = router;