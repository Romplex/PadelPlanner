const cheerio = require('cheerio');

function parseFreeSlots(html) {
    const $ = cheerio.load(html);
    const slots = [];
    const provider = 'TSG Heidelberg-Rohrbach e. V.';

    const titleText = $('title').text();
    const dateMatch = titleText.match(/(\d{1,2}\.\s\w+\s\d{4})/);
    const germanMonths = {
        'Januar': '01', 'Februar': '02', 'März': '03', 'April': '04',
        'Mai': '05', 'Juni': '06', 'Juli': '07', 'August': '08',
        'September': '09', 'Oktober': '10', 'November': '11', 'Dezember': '12'
    };

    let date = null;
    if (dateMatch) {
        const parts = dateMatch[1].split(/\s+/);
        const day = parts[0].replace('.', '').padStart(2, '0');
        const month = germanMonths[parts[1]];
        const year = parts[2];
        date = `${year}-${month}-${day}`;
    }

    $('td.available').each((index, element) => {
        const timeText = $(element).find('.period-time-text').text().trim();
        if (!timeText) return;

        const [startRaw, endRaw] = timeText.split('-').map(part => part.trim());
        const start_time = startRaw || '';
        const end_time = endRaw || startRaw || '';

        slots.push({ start_time, end_time });
    });

    return {
        provider,
        date,
        slots,
        available: slots.length > 0
    };
}

module.exports = parseFreeSlots;