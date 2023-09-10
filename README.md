# MDB Sheet Tom

MDB Sheet Tom is a web application to help automate uploading data from an Access database (MDB file) to Google Sheets. 

## Features

- Configure campaigns to select queries from the MDB and upload to specified Google Sheet URLs on a schedule
- Group campaigns and run scheduled uploads for the group
- Backup and restore the database and campaigns
- Send updates via WhatsApp when uploads complete

## Tech Stack

- React.js frontend with Ant Design components
- Node.js backend with Express framework
- MongoDB database
- MDB connectivity via ODBC

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository
2. Run `npm install` in both the frontend and backend folders
3. Configure `.env` in the backend with your MongoDB connection string
4. Start the backend with `npm start`
5. Start the frontend with `npm start`
6. Access the application at `http://localhost:3000`

## Usage

- Configure the MDB file path and Google Sheets URL in Settings
- Create campaigns selecting an MDB query and Google Sheet URL target
- Schedule campaigns to run on a cron schedule
- Group campaigns and run them as a batch
- View upload history and statuses
- Backup database and restore

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
