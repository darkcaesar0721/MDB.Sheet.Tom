const express = require('express');
const router = express.Router();

const Settings = require('../models/setting.model');

router.get('/', (req, res) => {
    Settings.findOne({}, (err, setting) => {
        if (!setting) {
            Settings.create({}, (err, createdSetting) => {
                res.json(createdSetting);
            })
        } else {
            res.json(setting);
        }
    })
});

router.put('/:id', (req, res) => {
    Settings.findByIdAndUpdate(req.params.id, req.body, (err, updatedSetting) => {
        Settings.findOne({_id: req.params.id}, (err, setting) => {
            res.json(setting); //.json() will send proper headers in response so client knows it's json coming back
        });
    });
});

router.post('/backup', (req, res) => {
    res.json('success');
});

module.exports = router;