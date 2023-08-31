const express = require('express');
const router = express.Router();

const settingController = require('./setting.controller');
const campaignController = require('./campaign.controller');

router.use('/setting', settingController);
router.use('/campaign', campaignController);

module.exports = router;