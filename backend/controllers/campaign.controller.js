const express = require('express');
const router = express.Router();
const ODBC = require('odbc');

const Campaigns = require('../models/campaign.model');
const Settings = require('../models/setting.model');

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
    Campaigns.findByIdAndUpdate(req.params.id, req.body, (err, updatedCampaign) => {
        Campaigns.findOne({_id: req.params.id}, (err, campaign) => {
            res.json(campaign); //.json() will send proper headers in response so client knows it's json coming back
        });
    });
});

router.delete('/:id', (req, res) => {
    Campaigns.findByIdAndRemove(req.params.id, (err, removedCampaign) => {
        res.json(removedCampaign);
    });
});

router.post('/get_query_column', (req, res) => {
    Settings.findOne({}, (err, setting) => {
        if (!setting || !setting.mdb_path) {
            res.json({status: 'error', description: 'Please input the MDB file path.'});
            return;
        }

        const mdb_path = setting.mdb_path;
        const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=${mdb_path}; Uid=;Pwd=;`;

        ODBC.connect(connectionString, (error, connection) => {
            if (error) {
                res.json({status: 'error', description: "Please can't connect to this MDB file."});
                return;
            }

            connection.query(`SELECT TOP 1 * FROM [${req.body.query}]`, (error, result) => {
                if (error) {
                    res.json({status: 'error', description: "Please can't run the this query."});
                    return;
                }
                const columns = result.columns.map(c => {
                    const column = c;
                    column.key = c._id;
                    return column;
                })
                res.json(columns);
            });
        });
    });
});

module.exports = router;