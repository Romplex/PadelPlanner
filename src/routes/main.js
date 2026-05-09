const express = require('express');
const Slot = require('../models/Slot');
const { fetchAllFreeSlots } = require('../scraper');
const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const slots = await Slot.getAvailableSlots();
  res.render('index', { slots, user: req.session.user });
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', (req, res) => {
  req.session.user = req.body.username;
  res.redirect('/');
});

router.get('/scrape', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  try {
    await fetchAllFreeSlots();
    res.send('Scraper erfolgreich ausgeführt. <a href="/">Zurück</a>');
  } catch (error) {
    res.status(500).send('Scraper-Fehler: ' + error.message);
  }
});

module.exports = router;