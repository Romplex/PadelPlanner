require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const mainRoutes = require('./routes/main');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', mainRoutes);
app.use('/bookings', bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});