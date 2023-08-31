const express = require('express');
const router = express.Router();

const settingController = require('./setting.controller');

router.use('/setting', settingController);

module.exports = router;