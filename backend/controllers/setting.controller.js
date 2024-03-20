const express = require('express');
const router = express.Router();
const formidable = require('formidable');
const fs = require("fs");
const moment = require('moment-timezone');
moment.tz.setDefault('America/Los_Angeles');

const Settings = require('../models/setting.model');
const Campaigns = require("../models/campaign.model");
const Companies = require("../models/company.model");
const Issues = require("../models/issue.model");
const Schedules = require("../models/schedule.model");
const GoogleAccounts = require("../models/google.account.model");
const Groups = require("../models/group.model");

router.get('/', (req, res) => {
    Settings.findOne({}, (err, setting) => {
        if (!setting) {
            Settings.create({}, (err, createdSetting) => {
                res.json(createdSetting);
            })
        } else {
            res.json(setting);
        }
    })
});

router.put('/:id', (req, res) => {
    Settings.findByIdAndUpdate(req.params.id, req.body, (err, updatedSetting) => {
        Settings.findOne({_id: req.params.id}, (err, setting) => {
            res.json(setting); //.json() will send proper headers in response so client knows it's json coming back
        });
    });
});

router.post('/backup', async (req, res) => {
    const settings = await Settings.find();
    const campaigns = await Campaigns.find();
    const companies = await Companies.find();
    const schedules = await Schedules.find();
    const issues = await Issues.find();
    const googleAccounts = await GoogleAccounts.find();
    const groups = await Groups.find();

    const data = {
        settings: settings,
        campaigns: campaigns,
        companies: companies,
        schedules: schedules,
        issues: issues,
        googleAccounts: googleAccounts,
        groups: groups
    }

    const file_name = moment().format('Y_M_D_hh_mm_ss_A');

    fs.writeFile(settings[0].backup_path + '\\' + file_name + '.json', JSON.stringify(data), function(err) {
        if (err) throw err;
        res.json('success');
    });
});

router.post('/restore', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fs.readFile(files.file[0].filepath, 'utf8', async (err, db) => {
            if (err) {
                console.error(err);
                return;
            }

            let data = db.replaceAll('"County.County":', '"County":');
            const settings = JSON.parse(data).settings;
            await Settings.find({'__v': 0}).remove().exec();
            await Settings.insertMany(settings);

            const campaigns = JSON.parse(data).campaigns;
            await Campaigns.find({'__v': 0}).remove().exec();
            await Campaigns.insertMany(campaigns);

            const companies = JSON.parse(data).companies;
            await Companies.find({'__v': 0}).remove().exec();
            await Companies.insertMany(companies);

            const issues = JSON.parse(data).issues;
            await Issues.find({'__v': 0}).remove().exec();
            await Issues.insertMany(issues);

            const schedules = JSON.parse(data).schedules;
            await Schedules.find({'__v': 0}).remove().exec();
            await Schedules.insertMany(schedules);

            const googleAccounts = JSON.parse(data).googleAccounts;
            await GoogleAccounts.find({'__v': 0}).remove().exec();
            await GoogleAccounts.insertMany(googleAccounts);

            const groups = JSON.parse(data).groups;
            await Groups.find({'__v': 0}).remove().exec();
            await Groups.insertMany(groups);
            res.end();
        });

    });
});

router.get('/download_google_sheet_credential', (req, res) => {
    const file = fs.readFileSync('credential.json');

    res.header('Content-Type', 'application/json');
    res.send(file);
});

router.post('/upload_google_sheet_credential', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        fs.readFile(files.file[0].filepath, 'utf8', async (err, data) => {
            if (err) {
                console.error(err);
                return;
            }

            fs.writeFile('credential.json', data, function(err) {
                if (err) throw err;
                res.json('success');
            });
        });

    });
});

module.exports = router;