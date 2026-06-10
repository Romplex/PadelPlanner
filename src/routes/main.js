const express = require('express');
const Slot = require('../models/Slot');
const { fetchAllFreeSlots } = require('../scraper');
const router = express.Router();

router.get('/', async (req, res) => {
  console.log("HOME COOKIE HEADER:", req.headers.cookie);
  console.log("HOME SESSION:", req.session);
  
  if (!req.session.user) return res.redirect('/login');
  const slots = await Slot.getAvailableSlots(req.session.user);
  const today = new Date().toISOString().split('T')[0];
  const futureSlots = slots.filter(slot => slot.date >= today);
  res.render('index', { slots: futureSlots, user: req.session.user });
});

router.get('/login', (req, res) => res.render('login'));
router.post('/login', (req, res) => {
  req.session.user = req.body.username;

  console.log("COOKIE HEADER:", req.headers.cookie);
  console.log("SESSION:", req.session);

  req.session.save(() => {
    res.redirect('/');
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout fehlgeschlagen');
    }
    
    res.redirect('/login');
  });
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