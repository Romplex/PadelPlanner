# Padel Scraper & Booking App

This project consists of a web scraper that fetches available padel time slots from a booking website and stores them in a MySQL database. Additionally, it includes a web app where users can log in and book slots among friends. When a slot reaches 4 bookings, it's considered full, and users can proceed to book on the official site.

## Project Structure

```
padel-scraper
├── db
│   └── schema.sql          # Database schema (slots and bookings tables)
├── src
│   ├── app.js              # Express server for the web app
│   ├── scraper.js          # Scraper entry point
│   ├── parser.js           # Parses HTML and extracts free slots
│   ├── database.js         # Handles database operations
│   ├── models
│   │   └── Slot.js         # Model for slot queries
│   └── routes
│       ├── main.js         # Main routes (login, slots, scrape)
│       └── bookings.js     # Booking routes
├── views
│   ├── index.ejs           # Main booking page
│   └── login.ejs           # Login page
├── public
│   ├── css
│   │   └── style.css       # Styles for the web app
│   └── js
│       └── app.js          # Frontend JavaScript for bookings
├── .env.example            # Example environment variables
├── package.json            # NPM configuration
├── .gitignore              # Files to ignore in Git
└── README.md               # This file
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd padel-scraper
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update `.env` with your MySQL credentials and a secret scrape key:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=padel_scraper
   SCRAPE_KEY=your_secret_scrape_key_here
   PORT=3000  # Optional, defaults to 3000
   ```

## Database Setup

1. Create the database and tables using `db/schema.sql`:

```sql
CREATE DATABASE padel_scraper;
USE padel_scraper;

CREATE TABLE slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_slot (provider, date, start_time, end_time)
);

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking (slot_id, user_name)
);
```

2. The database connection uses environment variables from `.env`.

## Usage

### Running the Scraper
To scrape slots manually:
```
npm run scrape
```

Or via the web app endpoint (for cronjobs):
```
GET http://localhost:3000/scrape?key=your_secret_scrape_key_here
```

### Running the Web App
Start the server:
```
npm start
```

Open `http://localhost:3000` in your browser. Log in with a username, view available slots, and book them. Full slots (4 bookings) are marked in red.

### Cronjob Setup
Use a service like cron-job.org to call the scrape endpoint daily:
- URL: `https://your-domain.com/scrape?key=your_secret_scrape_key_here`
- Method: GET
- Schedule: Daily at a set time

## Dependencies

- `axios`: HTTP requests for scraping
- `cheerio`: HTML parsing
- `mysql2`: Database operations
- `dotenv`: Environment variables
- `express`: Web server
- `express-session`: Session management
- `ejs`: Templating

## Hosting

For production (e.g., Hostinger):
1. Upload the code to your server.
2. Set environment variables.
3. Ensure MySQL is set up.
4. Use PM2 or similar to run `npm start`.
5. Configure HTTPS and secure the scrape key.

## License

MIT License.