const express = require('express');
const router = express.Router();

const Campaigns = require('../models/campaign.model');

router.get('/', (req, res) => {
    Campaigns.find({}, (err, campaigns) => {
        res.json(campaigns);
    })
});

router.post('/', (req, res) => {
    Campaigns.create(req.body, (err, newCampaign) => {
        res.json(newCampaign);
    })
});

router.put('/:id', (req, res) => {
    Campaigns.findByIdAndRemove(req.params.id, req.body, (err, updatedCampaign) => {
        res.json(updatedCampaign);
    });
});

router.delete('/:id', (req, res) => {
    Campaigns.findByIdAndRemove(req.params.id, (err, removedCampaign) => {
        res.json(removedCampaign);
    })
})

module.exports = router;