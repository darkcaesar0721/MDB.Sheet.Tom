const express = require('express');
const router = express.Router();

const Issues = require('../models/issue.model');

router.get('/', (req, res) => {
    Issues.find({}, (err, issues) => {
        res.json(issues);
    })
});

router.post('/', (req, res) => {
    Issues.create(req.body, (err, newIssue) => {
        res.json(newIssue);
    })
});

router.put('/:id', (req, res) => {
    Issues.findByIdAndUpdate(req.params.id, req.body, (err, updatedIssue) => {
        Issues.findOne({_id: req.params.id}, (err, issue) => {
            res.json(issue); //.json() will send proper headers in response so client knows it's json coming back
        });
    });
});

router.delete('/:id', (req, res) => {
    Issues.findByIdAndRemove(req.params.id, (err, removedIssue) => {
        res.json(removedIssue);
    });
});

module.exports = router;