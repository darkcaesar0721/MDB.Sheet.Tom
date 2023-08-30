require('dotenv').config();
const express = require('express');
const app = express();

// process port
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
