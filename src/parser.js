const cheerio = require('cheerio');

function parseFreeSlots(html) {
    const $ = cheerio.load(html);
    const slots = [];

    // Extrahiere das Datum aus dem Title
    const titleText = $('title').text();
    const dateMatch = titleText.match(/(\d{1,2}\.\s\w+\s\d{4})/);
    const dateStr = dateMatch ? dateMatch[1] : null;
    
    // Konvertiere deutsches Datumsformat zu ISO-Format (z.B. "30. April 2026" -> "2026-04-30")
    const germanMonths = {
        'Januar': '01', 'Februar': '02', 'März': '03', 'April': '04',
        'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08',
        'September': '09', 'Oktober': '10', 'November': '11', 'Dezember': '12'
    };
    
    let date = null;
    if (dateStr) {
        const parts = dateStr.split(/\s+/);
        const day = parts[0].replace('.', '').padStart(2, '0');
        const month = germanMonths[parts[1]];
        const year = parts[2];
        date = `${year}-${month}-${day}`;
    }

    // Finde alle verfügbaren Slots (class="available")
    $('td.available').each((index, element) => {
        const timeText = $(element).find('.period-time-text').text().trim();
        // Extrahiere nur die Startzeit (z.B. "07:00" aus "07:00 - 07:30")
        const startTime = timeText.split('-')[0].trim();
        slots.push(startTime);
    });

    return {
        date: date,
        slots: slots,
        available: slots.length > 0
    };
}

module.exports = parseFreeSlots;