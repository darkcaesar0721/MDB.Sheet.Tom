const express = require('express');
const router = express.Router();
const ODBC = require("odbc");

const Groups = require('../models/group.model');
const Campaigns = require('../models/campaign.model');

router.get('/get_last_phone', (req, res) => {
    const mdb_path = req.query.mdb_path;
    const id = req.query.campaign_id;
    const query = req.query.campaign_query;

    const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=${mdb_path}; Uid=;Pwd=;`;

    ODBC.connect(connectionString, (error, connection) => {
        if (error) {
            res.json({status: 'error', description: "Please can't connect to this MDB file.", campaign:{}});
            return;
        }

        connection.query(`SELECT TOP 1 * FROM [${query}]`, (error, result) => {
            if (error) {
                res.json({status: 'error', description: "Please can't run this mdb query.", campaign: {}});
            } else {
                const obj = {};
                obj.last_phone = result[0].Phone;
                obj.system_create_datetime = result[0].SystemCreateDate;
                obj.is_get_last_phone = true;

                Campaigns.findByIdAndUpdate(id, obj, (err, updatedCampaign) => {
                    Campaigns.findOne({_id: id}, (err, campaign) => {
                        res.json({status: 'success', campaign: campaign});
                    });
                });
            }
        });
    });
});

module.exports = router;