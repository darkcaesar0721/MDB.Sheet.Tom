const express = require('express');
const router = express.Router();

const Groups = require('../models/group.model');

router.get('/', (req, res) => {
    Groups.find({}).populate('campaign_id').exec((err, groups) => {
        res.json(Groups);
    })
});

router.post('/', (req, res) => {
    Groups.create(req.body, (err, newGroup) => {
        newGroup.populate('campaign_id', (err, populatedGroup) => {
            res.json(populatedGroup);
        });
    });
});

router.put('/:id', (req, res) => {
    Groups.findByIdAndUpdate(req.params.id, req.body, (err, updatedGroup) => {
        Groups.findOne({_id: req.params.id}).populate('campaign_id').exec((err, group) => {
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