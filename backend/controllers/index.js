const express = require('express');
const router = express.Router();

const settingController = require('./setting.controller');
const campaignController = require('./campaign.controller');
const groupController = require('./group.controller');

router.use('/setting', settingController);
router.use('/campaign', campaignController);
router.use('/group', groupController);

module.exports = router;