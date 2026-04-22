# Padel Scraper

This project is a simple web scraper that fetches available time slots from a padel booking website and outputs the free slots in JSON format.

## Project Structure

```
padel-scraper
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

## Dependencies

This project uses the following npm packages:
- `axios`: For making HTTP requests.
- `cheerio`: For parsing and manipulating HTML data.

## License

This project is licensed under the MIT License.