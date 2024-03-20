const express = require('express');
const router = express.Router();

const GoogleAccounts = require('../models/google.account.model');

router.get('/', (req, res) => {
    GoogleAccounts.find({}, (err, googleAccounts) => {
        res.json(googleAccounts);
    })
});

router.post('/', (req, res) => {
    GoogleAccounts.create(req.body, (err, newGoogleAccount) => {
        res.json(newGoogleAccount);
    })
});

router.put('/:id', (req, res) => {
    GoogleAccounts.findByIdAndUpdate(req.params.id, req.body, (err, updatedGoogleAccount) => {
        GoogleAccounts.findOne({_id: req.params.id}, (err, googleAccount) => {
            res.json(googleAccount);
        });
    });
});

router.delete('/:id', (req, res) => {
    GoogleAccounts.findByIdAndRemove(req.params.id, (err, removedGoogleAccount) => {
        res.json(removedGoogleAccount);
    });
});

module.exports = router;