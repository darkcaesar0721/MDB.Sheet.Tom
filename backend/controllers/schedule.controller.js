const express = require('express');
const router = express.Router();

const scheduleLibrary = require('../libraries/schedule');

router.post('/update_xls', async (req, res) => {
    await scheduleLibrary.update(function() {
        res.json('success');
    })
});

module.exports = router;