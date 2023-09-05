const express = require('express');
const router = express.Router();
const ODBC = require("odbc");

const Groups = require('../models/group.model');
const Campaigns = require('../models/campaign.model');

const whatsappLibrary = require('../libraries/whatsapp');
const uploadLibrary = require('../libraries/upload');
const Settings = require("../models/setting.model");

router.post('/', async (req, res) => {
    const {group, campaign, setting, index, manually} = req.body;
    await uploadLibrary.upload_sheet(group, campaign, setting, manually, function(result){res.json(result);});
})

router.get('/get_last_phone', (req, res) => {
    const mdb_path = req.query.mdb_path;
    const id = req.query.campaignId;

    Campaigns.findOne({_id: id}, (err, campaign) => {
        Settings.findOne({}, (err, setting) => {
            const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=${setting.mdb_path}; Uid=;Pwd=;`;

            ODBC.connect(connectionString, (error, connection) => {
                if (error) {
                    res.json({status: 'error', description: "Please can't connect to this MDB file.", campaign:{}});
                    return;
                }

                connection.query(`SELECT TOP 1 * FROM [${campaign.query}]`, (error, result) => {
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
        })
    })
});

module.exports = router;