const axios = require('axios');
const parseFreeSlots = require('./parser');

const url = 'https://hdrohrbach.sportbuchung.net/reservations.php?action=showReservations&type_id=1&sport_id=2&area_id=20&date=2026-04-30&page=1&week=0';

async function fetchFreeSlots() {
    try {
        const response = await axios.get(url);
        const htmlData = response.data;
        const freeSlots = parseFreeSlots(htmlData);
        console.log(freeSlots);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchFreeSlots();

console.log('End of script');