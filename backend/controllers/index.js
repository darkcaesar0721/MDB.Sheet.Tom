const express = require('express');
const router = express.Router();

const settingController = require('./setting.controller');
const companyController = require('./company.controller');
const campaignController = require('./campaign.controller');
const issueController = require('./issue.controller');
const groupController = require('./group.controller');
const uploadController = require('./upload.controller');
const scheduleController = require('./schedule.controller');
const googleAccountController = require('./google.account.controller');

router.use('/setting', settingController);
router.use('/company', companyController);
router.use('/campaign', campaignController);
router.use('/issue', issueController);
router.use('/group', groupController);
router.use('/upload', uploadController);
router.use('/schedule', scheduleController);
router.use('/google.account', googleAccountController);

module.exports = router;