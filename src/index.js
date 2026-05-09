const axios = require('axios');
const parseFreeSlots = require('./parser');
const saveToDatabase = require('./database');

async function fetchFreeSlotsForDate(date) {
    const url = `https://hdrohrbach.sportbuchung.net/reservations.php?action=showReservations&type_id=1&sport_id=2&area_id=20&date=${date}&page=1&week=0`;
    try {
        const response = await axios.get(url);
        const htmlData = response.data;
        const freeSlots = parseFreeSlots(htmlData);
        return { date, url, ...freeSlots };
    } catch (error) {
        console.error(`Error fetching data for ${date}:`, error);
        return { date, url, slots: [], available: false };
    }
}

async function fetchAllFreeSlots() {
    const results = [];
    const queriedAt = new Date().toISOString();
    const today = new Date();
    for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const result = await fetchFreeSlotsForDate(dateStr);
        results.push({ ...result, queriedAt });
    }
    console.log(JSON.stringify(results, null, 2));
    await saveToDatabase(results);
}

fetchAllFreeSlots();