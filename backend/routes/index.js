const express = require('express');
const router = express.Router();

const settingRouter = require('./setting');

router.use('/setting', settingRouter);

module.exports = router;