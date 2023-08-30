require('dotenv').config();

/* BEGIN: Create a mongodb server and mongodb client */
require('./database/server');
require('./database/client');
/* END: Create a mongodb server and mongodb client */

const express = require('express');
const app = express();

// process port
const port = process.env.PORT;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
