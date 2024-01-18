const express = require('express');
const router = express.Router();

const Companies = require('../models/company.model');

router.get('/', (req, res) => {
    Companies.find({}, (err, companies) => {
        res.json(companies);
    })
});

router.post('/', (req, res) => {
    Companies.create(req.body, (err, newCompany) => {
        res.json(newCompany);
    })
});

router.put('/:id', (req, res) => {
    Companies.findByIdAndUpdate(req.params.id, req.body, (err, updatedCompany) => {
        Companies.findOne({_id: req.params.id}, (err, company) => {
            res.json(company);
        });
    });
});

router.delete('/:id', (req, res) => {
    Companies.findByIdAndRemove(req.params.id, (err, removedCompany) => {
        res.json(removedCompany);
    });
});

module.exports = router;