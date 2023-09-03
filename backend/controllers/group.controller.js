const express = require('express');
const router = express.Router();

const Groups = require('../models/group.model');

router.get('/', (req, res) => {
    Groups.find({}).populate('campaigns.campaign').exec((err, groups) => {
        res.json(groups.map(g => Object.assign(g, {campaigns: g.campaigns.map(c => {
                let campaign = {...c};
                const campaignKeys = Object.keys(g.campaigns);
                campaignKeys.forEach((key, value) => {
                    campaign[key] = value;
                });
                return campaign;
            })})));
    })
});

router.post('/', (req, res) => {
    Groups.create(req.body, (err, newGroup) => {
        newGroup.populate('campaigns.campaign', (err, populatedGroup) => {
            res.json(populatedGroup);
        });
    });
});

router.put('/:id', (req, res) => {
    Groups.findByIdAndUpdate(req.params.id, req.body, (err, updatedGroup) => {
        Groups.findOne({_id: req.params.id}).populate('campaigns.campaign').exec((err, group) => {
            res.json(group);
        });
    });
});

router.delete('/:id', (req, res) => {
    Groups.findByIdAndRemove(req.params.id, (err, removedGroup) => {
        res.json(removedGroup);
    });
});

module.exports = router;