const express = require('express');
const router = express.Router();
const ODBC = require("odbc");

const Groups = require('../models/group.model');
const Campaigns = require('../models/campaign.model');

router.post('/get_last_phone', (req, res) => {
    const mdb_path = req.body.mdb;
    const group = req.body.group;
    const campaign = req.body.campaign;

    const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=${mdb_path}; Uid=;Pwd=;`;

    ODBC.connect(connectionString, (error, connection) => {
        if (error) {
            res.json({status: 'error', description: "Please can't connect to this MDB file."});
            return;
        }

        connection.query(`SELECT TOP 1 * FROM [${campaign.query}]`, (error, result) => {
            const obj = {};
            obj.last_phone = result[0].Phone;
            obj.system_create_datetime = result[0].SystemCreateDate;
            obj.is_get_last_phone = true;

            Campaigns.findByIdAndUpdate(campaign.campaign._id, obj, (err, updatedCampaign) => {
                Campaigns.findOne({_id: campaign.campaign._id}, (err, campaign) => {
                    res.json(campaign);
                });
            })
        });
    });
});

module.exports = router;