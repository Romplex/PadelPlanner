# Padel Scraper

This project is a simple web scraper that fetches available time slots from a padel booking website and outputs the free slots in JSON format.

## Project Structure

```
padel-scraper
├── db
│   └── schema.sql     # Database schema
├── src
│   ├── index.js        # Entry point of the scraper
│   └── parser.js       # Parses HTML and extracts free slots
├── package.json        # NPM configuration file
├── .gitignore          # Specifies files to ignore in Git
└── README.md           # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd padel-scraper
   ```

2. Install the dependencies:
   ```
   npm install
   ```

## Usage

To run the scraper, execute the following command in your terminal:
```
node src/index.js
```

This will fetch the HTML data from the specified padel booking URL, parse it, and log the available time slots in JSON format to the console.

## Database setup

This project stores scraped slot data in a MySQL database. You can keep the schema definition in `db/schema.sql`.

1. Create the database and table:

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
```

2. Install the MySQL client dependency:

```bash
npm install mysql2
```

3. Configure the database connection in `src/database.js`.

4. Run the scraper:

```bash
node src/index.js
```

## Dependencies

This project uses the following npm packages:
- `axios`: For making HTTP requests.
- `cheerio`: For parsing and manipulating HTML data.
- `mysql2`: For saving scraped data into MySQL.

## License

This project is licensed under the MIT License.