const { google } = require("googleapis");
const ODBC = require("odbc");
const axios = require("axios");
const qs = require("qs");
const moment = require('moment-timezone');
const xlsx = require('xlsx');
const fs = require('fs');
moment.tz.setDefault('America/Los_Angeles');

const Campaigns = require('../models/campaign.model');
const Groups = require('../models/group.model');
const Settings = require("../models/setting.model");
const Schedules = require("../models/schedule.model");

const auth = new google.auth.GoogleAuth({
    keyFile: "./credential.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const LEAD_SOURCE = {
    PLEADS: 2,
    NETWORK: 3,
    HA: 4,
    HAP: 4,
    HAO: 5,
    TT: 6,
    Homeadvisor: 4
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

const generateRandomIntegers = function (count, min, max) {
    const randomIntegers = [];

    for (let i = 0; i < count; i++) {
        const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
        randomIntegers.push(randomInteger);
    }

    return randomIntegers.sort();
}

const checkDuplicatedLeadInfo = function(leads, lead, columns) {
    let isDuplicated = false;

    const regex = /\.|\s/g;

    for (const ld of leads) {
        let nComparedColumns = 0;
        let nDuplicatedColumns = 0;

        for (const column of columns) {
            if (column.is_display === false || column.mdb_name === 'Phone' || column.mdb_name === 'Mobile') continue;

            nComparedColumns++;

            if (lead[column.mdb_name] !== undefined && lead[column.mdb_name] !== null && ld[column.mdb_name] !== undefined && ld[column.mdb_name] !== null) {
                if(lead[column.mdb_name].replace(regex, "").toLowerCase() == ld[column.mdb_name].replace(regex, "").toLowerCase()) {
                    nDuplicatedColumns++;                
                }
            }
        }

        if (nComparedColumns == nDuplicatedColumns) {
            isDuplicated = true;
            break;
        }
    }

    return isDuplicated;
}

const uploadSheet = async function (groupId = "", campaignId = "", manually = false, callback = function() {}) {
    const group = await Groups.findOne({_id: groupId});
    const campaign = await Campaigns.findOne({_id: campaignId});
    const setting = await Settings.findOne({});

    const groupCampaign = group.campaigns.filter(c => c.detail == campaignId)[0];

    const today = moment().format("M/D/Y hh:mm:ss");
    Groups.updateOne({_id: groupId, "campaigns.detail": campaignId}, {"campaigns.$.last_upload_start_datetime": today}, (err, doc) => {});

    let last_phone = campaign.last_phone;
    const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=${setting.mdb_path}; Uid=;Pwd=;`;

    ODBC.connect(connectionString, (error, connection) => {
        if (error) {
            callback({status: 'error', description: "mdb open error."});
            return;
        }

        connection.query(`SELECT * FROM [${campaign.query}]`, async (error, result) => {
            await connection.close();

            if (error) {
                callback({status: 'error', description: "mdb query error."});
                return;
            }

            let rows = [];
            let nScheduleCount = 0;

            let mdbRows = [];
            for (let i = 0; i < result.length; i++) {
                const row = result[i];
                if (last_phone === row['Phone']) break;
                mdbRows.push(row);
            }

            switch (groupCampaign.filter.way) {
                case 'ALL':
                    mdbRows.forEach(mdbRow => {
                        let row = {};
                        for (const column of groupCampaign.columns) {
                            if (column.is_display === false) continue;
                            row[column.mdb_name] = mdbRow[column.mdb_name];
                        }

                        if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                            row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                        }

                        if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                        rows.push(row);
                    })
                    break;
                case 'STATIC':
                    for (const mdbRow of mdbRows) {
                        if (rows.length === groupCampaign.filter.static_count) break;

                        let row = {};
                        for (const column of groupCampaign.columns) {
                            if (column.is_display === false) continue;
                            row[column.mdb_name] = mdbRow[column.mdb_name];
                        }

                        if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                            row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                        }

                        if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                        rows.push(row);
                    }
                    break;
                case 'RANDOM':
                    let random_count = getRandomInt(groupCampaign.filter.random_start, groupCampaign.filter.random_end);
                    if (random_count >= mdbRows.length) {
                        for (const mdbRow of mdbRows) {
                            let row = {};
                            for (const column of groupCampaign.columns) {
                                if (column.is_display === false) continue;
                                row[column.mdb_name] = mdbRow[column.mdb_name];
                            }

                            if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                                row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                            }

                            if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                            rows.push(row);
                        }
                    } else {
                        const randomIntegers = generateRandomIntegers(random_count - 1, groupCampaign.filter.random_start, groupCampaign.filter.random_end);
                        const randoms = [0, ...randomIntegers];
                        mdbRows.forEach((mdbRow, i) => {
                            randoms.forEach((random, j) => {
                                if (i === j) {
                                    let row = {};
                                    for (const column of groupCampaign.columns) {
                                        if (column.is_display === false) continue;
                                        row[column.mdb_name] = mdbRow[column.mdb_name];
                                    }

                                    if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                                        row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                                    }

                                    if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                                    rows.push(row);
                                }
                            })
                        })
                    }
                    break;
                case 'RANDOM_FIRST':
                    let random_first_count = getRandomInt(groupCampaign.filter.random_start, groupCampaign.filter.random_end);
                    if (random_first_count >= mdbRows.length) {
                        for (const mdbRow of mdbRows) {
                            let row = {};
                            for (const column of groupCampaign.columns) {
                                if (column.is_display === false) continue;
                                row[column.mdb_name] = mdbRow[column.mdb_name];
                            }

                            if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                                row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                            }

                            if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                            rows.push(row);
                        }
                    } else {
                        let end = groupCampaign.filter.random_start_position;
                        if (mdbRows.length < end) end = mdbRows.length;

                        const randomIntegers = generateRandomIntegers(random_first_count - 1, 1, end - 1);
                        const randoms = [0, ...randomIntegers];
                        mdbRows.forEach((mdbRow, i) => {
                            randoms.forEach((random, j) => {
                                if (i === j) {
                                    let row = {};
                                    for (const column of groupCampaign.columns) {
                                        if (column.is_display === false) continue;
                                        row[column.mdb_name] = mdbRow[column.mdb_name];
                                    }

                                    if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                                        row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                                    }

                                    if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                                    rows.push(row);
                                }
                            })
                        })
                    }
                    break;
                case 'PERIOD':
                    const start_date = moment().subtract(groupCampaign.filter.period_start, 'days').format('M/D/Y');
                    const end_date = moment().subtract(groupCampaign.filter.period_end, 'days').format('M/D/Y');

                    mdbRows.forEach((mdbRow, i) => {
                        const dateValue = new Date(mdbRow['SystemCreateDate']);
                        const date = moment(dateValue).format('M/D/Y');

                        if (new Date(date) >= new Date(end_date) && new Date(date) <= new Date(start_date)) {
                            let row = {};
                            for (const column of groupCampaign.columns) {
                                if (column.is_display === false) continue;
                                row[column.mdb_name] = mdbRow[column.mdb_name];
                            }

                            if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                                row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                            }

                            if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                            rows.push(row);
                        }
                    })
                    break;
                case 'DATE':
                    if (groupCampaign.filter.date_is_time) {
                        const before_date = moment().subtract(groupCampaign.filter.date_old_day, 'days').format('M/D/Y');
                        const before_date_value = new Date(before_date + ' ' + (groupCampaign.filter.date_time ? groupCampaign.filter.date_time : '00') + ':00 ' + groupCampaign.filter.date_meridian);
                        const before_datetime = moment(before_date_value).format('M/D/Y hh:mm A');

                        mdbRows.forEach((mdbRow, i) => {
                            const dateValue = new Date(mdbRow['SystemCreateDate']);
                            const datetime = moment(dateValue).format('M/D/Y hh:mm A');

                            if (new Date(datetime) > new Date(before_datetime)) {
                                let row = {};
                                for (const column of groupCampaign.columns) {
                                    if (column.is_display === false) continue;
                                    row[column.mdb_name] = mdbRow[column.mdb_name];
                                }

                                if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                                    row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                                }

                                if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                                rows.push(row);
                            }
                        })
                    } else {
                        const before_date = moment().subtract(groupCampaign.filter.date_old_day, 'days').format('M/D/Y');

                        mdbRows.forEach((mdbRow, i) => {
                            const dateValue = new Date(mdbRow['SystemCreateDate']);
                            const date = moment(dateValue).format('M/D/Y');

                            if (new Date(date) >= new Date(before_date)) {
                                let row = {};
                                for (const column of groupCampaign.columns) {
                                    if (column.is_display === false) continue;
                                    row[column.mdb_name] = mdbRow[column.mdb_name];
                                }

                                if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
                                    row['source'] = mdbRow['LEAD_SOURCE'] === undefined || mdbRow['LEAD_SOURCE'] === null ? '' : LEAD_SOURCE[mdbRow['LEAD_SOURCE']];
                                }

                                if (!checkDuplicatedLeadInfo(rows, row, groupCampaign.columns)) nScheduleCount++;

                                rows.push(row);
                            }
                        })
                    }
                    break;
            }

            if (manually === true) {
                campaign.last_temp_upload_info.qty_available = mdbRows.length;
                campaign.last_temp_upload_info.qty_uploaded = rows.length;
                campaign.last_temp_upload_info.qty_schedule = nScheduleCount;

                if (rows.length > 0) {
                    campaign.last_temp_upload_info.last_phone = mdbRows[0]['Phone'];
                    campaign.last_temp_upload_info.system_create_datetime = mdbRows[0]['SystemCreateDate'];
                } else {
                    campaign.last_temp_upload_info.last_phone = '';
                    campaign.last_temp_upload_info.system_create_datetime = '';
                }
                campaign.last_temp_upload_info.upload_rows = rows;
                campaign.is_manually_uploaded = true;
            } else {
                campaign.qty_available = mdbRows.length;
                campaign.qty_uploaded = rows.length;
                campaign.qty_schedule = nScheduleCount;

                if (rows.length > 0) {
                    campaign.last_phone = mdbRows[0]['Phone'];
                    campaign.system_create_datetime = mdbRows[0]['SystemCreateDate'];
                }
                campaign.is_get_last_phone = false;
                campaign.last_upload_datetime = moment().format('M/D/Y hh:mm A');
                campaign.last_upload_rows = rows;
            }

            let fileName = "";
            let upload_google_sheet_status = true;
            let upload_schedule_status = true;
            if (manually === false) {
                const weekday = moment().format('dddd');
                const today = moment().format("MM/DD/YYYY");
                const date_name = weekday === 'Thursday' ? weekday + ' ' + group.name : weekday;

                let schedule = {};
                schedule.date = today;
                schedule.weekday = date_name;
                schedule.name = campaign.schedule;
                schedule.count = nScheduleCount;
                schedule.update_status = false;
                Schedules.create(schedule);

                if (rows.length > 0) {
                    if (setting.send_out_type === 'GOOGLE') {
                        upload_google_sheet_status = await upload_google_sheet_leads(rows, group, groupCampaign, campaign, setting, callback);
                    } else {
                        fileName = await download_local_file(rows, group, groupCampaign, campaign, setting, callback);
                    }
                }
                if (process.env.ENVIRONMENT === 'production' && setting.send_out_type === 'GOOGLE' && campaign.qty_schedule !== 0) {
                    upload_schedule_status = await upload_schedule(group, campaign, setting, callback);
                }
            }

            if (upload_google_sheet_status === true) {
                Campaigns.findByIdAndUpdate(campaignId, campaign, function(err, c) {
                    Campaigns.findOne({_id: campaignId}, (err, updatedCampaign) => {
                        const today = moment().format("M/D/Y hh:mm:ss");
                        Groups.updateOne({_id: groupId, "campaigns.detail": campaignId}, {"campaigns.$.last_upload_end_datetime": today}, async (err, doc) => {
                            let send_whatsapp_status = true;
                            if (manually === false && rows.length > 0) {
                                if (setting.send_out_type === 'GOOGLE') {
                                    if (process.env.ENVIRONMENT === 'production' && setting.whatsapp.global_send_status == true) {
                                        send_whatsapp_status = await send_whatsapp_message(group, groupCampaign, campaign, setting, function(description) {
                                            callback({status: 'warning', description: description, campaign: updatedCampaign});
                                        });
                                    }
                                } else {
                                    if (process.env.ENVIRONMENT === 'production' && (setting.is_auto_whatsapp_sending_for_local_way == true && setting.whatsapp.global_send_status == true && groupCampaign.whatsapp.xls_send_status == true)) {
                                        send_whatsapp_status = await send_whatsapp_file(fileName, group, groupCampaign, campaign, setting, function(description) {
                                            callback({status: 'warning', description: description, campaign: updatedCampaign});
                                        });
                                    }
                                }
                            }

                            if (send_whatsapp_status === true) {
                                callback({status: 'success', campaign: updatedCampaign});
                            }
                        });
                    });
                });
            }
        });
    });
}

const upload_google_sheet_leads = async function(rows, group, groupCampaign, campaign, setting, callback) {
    const authClientObject = await auth.getClient();//Google sheets instance
    const googleSheetsInstance = google.sheets({version: "v4", auth: authClientObject});

    for (const sheet_url of campaign.sheet_urls) {
        const regex = /\/d\/([a-zA-Z0-9-_]+)\//; // Regular expression to match the ID
        const match = regex.exec(sheet_url);
        const spreadsheetId = match[1]; // Extract the ID from the matched string

        const spreadsheet = await googleSheetsInstance.spreadsheets.get({
            spreadsheetId
        });

        let sheet = {};
        for (const s of spreadsheet.data.sheets) {
            const sheetId = s.properties.sheetId;
            if (sheet_url.indexOf("gid=" + sheetId) !== -1) {
                sheet = s;
            }
        }

        if (!sheet) {
            callback({status: 'error', description: 'sheet url error'});
            return false;
        }

        const result = await googleSheetsInstance.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: sheet.properties.title,
        });

        const rowsCount = result.data.values ? result.data.values.length : 0;

        let blank_rows = [['']];
        let upload_rows = [['', '', '', '', '', '', '', '', '', '', '', '', '', '']];
        let upload_row = [];
        for (const column of groupCampaign.columns) {
            if (column.is_display === false) continue;

            upload_row.push(column.sheet_name);
        }

        if (groupCampaign.is_add_source_field === true || groupCampaign.is_add_source_field === 'true') {
            upload_row.push('Source');
        }

        upload_rows = [...upload_rows, upload_row];
        blank_rows = [...blank_rows, ['']];

        rows.forEach((row) => {
            let upload_row = [];
            const keys = Object.keys(row);
            keys.forEach(key => {
                upload_row.push(row[key]);
            })
            upload_rows.push(upload_row);
            blank_rows.push(['']);
        })
        upload_rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '']);
        blank_rows.push(['']);

        if (process.env.ENVIRONMENT === 'production') {
            await googleSheetsInstance.spreadsheets.values.append({
                auth, //auth object
                spreadsheetId, //spreadsheet id
                range: sheet.properties.title, //sheet name and range of cells
                valueInputOption: "USER_ENTERED", // The information will be passed according to what the usere passes in as date, number or text
                resource: {
                    values: blank_rows,
                },
            });

            await googleSheetsInstance.spreadsheets.values.update({
                auth, //auth object
                spreadsheetId, //spreadsheet id
                range: sheet.properties.title + '!A' + (rowsCount + 1) + ':N' + (rowsCount + upload_rows.length), //sheet name and range of cells
                valueInputOption: "USER_ENTERED", // The information will be passed according to what the usere passes in as date, number or text
                resource: {
                    values: upload_rows,
                },
            });
        }
    }

    return true;
}

const download_local_file = async function(rows, group, groupCampaign, campaign, setting, callback) {
    let downloadRows = [];

    campaign.sheet_urls.forEach(url => {
        downloadRows = [...downloadRows, [url]];
    })
    downloadRows = [...downloadRows, ['']];

    let downloadRow = [];
    for (const column of groupCampaign.columns) {
        if (column.is_display === false) continue;

        downloadRow.push(column.sheet_name);
    }
    downloadRows = [...downloadRows, downloadRow];

    rows.forEach((row) => {
        let downloadRow = [];
        const keys = Object.keys(row);
        keys.forEach(key => {
            downloadRow.push(row[key]);
        })
        downloadRows.push(downloadRow);
    })

    let ID = '';
    const campaigns = await Campaigns.find({});
    for (let i = 0; i < campaigns.length; i++) {
        let c = campaigns[i];
        if (campaign._id.toString() == c._id.toString()) ID = String(i + 1).padStart(3, '0');
    }

    const currentDateTime = moment().format("M.D.Y_h.m.A");
    let fileName = ID + '_' + campaign.schedule + '_Qty_' + rows.length + '_' + currentDateTime;

    if (!fs.existsSync(setting.local_folder_path)) {
        fs.mkdirSync(setting.local_folder_path);
    }

    if (setting.send_local_file_type === 'XLS') {
        const workbook = xlsx.utils.book_new();

        const sheetData = xlsx.utils.aoa_to_sheet(downloadRows);
        xlsx.utils.book_append_sheet(workbook, sheetData, campaign.schedule);
        
        fileName += '.xls';
        const filePath = setting.local_folder_path + '\\' + fileName;
    
        xlsx.writeFile(workbook, filePath);
    } else {
        fileName += '.csv';
        const filePath = setting.local_folder_path + '\\' + fileName;

        const csvWriter = fs.createWriteStream(filePath);
        downloadRows.forEach((row) => {
            csvWriter.write(row.join(',') + '\n');
        });
        csvWriter.end();
    }

    return fileName;
}

const check_uploaded_sheet = async function(groupCampaign = {}, campaign = {}, isChecked = true, callback = {}) {
    const urls = campaign.sheet_urls;
    const last_phone = campaign.last_phone;

    const authClientObject = await auth.getClient();//Google sheets instance
    const googleSheetsInstance = google.sheets({version: "v4", auth: authClientObject});

    for (const url of urls) {
        const regex = /\/d\/([a-zA-Z0-9-_]+)\//; // Regular expression to match the ID
        const match = regex.exec(url);
        const spreadsheetId = match[1]; // Extract the ID from the matched string

        const spreadsheet = await googleSheetsInstance.spreadsheets.get({
            spreadsheetId
        });

        let sheet = {};
        for (const s of spreadsheet.data.sheets) {
            const sheetId = s.properties.sheetId;
            if (url.indexOf("gid=" + sheetId) !== -1) {
                sheet = s;
            }
        }

        if (!sheet) {
            callback({status: 'error', description: 'sheet url error'});
            return;
        }

        if (isChecked) {
            const response = await googleSheetsInstance.spreadsheets.values.get({
                auth, //auth object
                spreadsheetId, //spreadsheet id
                range: sheet.properties.title + '!A:B', //sheet name and range of cells
            });

            let uploaded_status = false;

            if (response.data.values !== undefined) {
                for (let i = response.data.values.length - 1; i > 0; i--) {
                    const row = response.data.values[i];

                    if (row[1] == last_phone) {
                        uploaded_status = true;
                        break;
                    }
                }
            }

            if (uploaded_status) continue;
        }

        let upload_rows = [['', '', '', '', '', '', '', '', '', '', '', '', '', '']];
        let upload_row = [];
        for (const column of groupCampaign.columns) {
            if (column.is_display === false) continue;

            upload_row.push(column.sheet_name);
        }
        upload_rows = [...upload_rows, upload_row];

        campaign.last_upload_rows.forEach((row) => {
            let upload_row = [];
            const keys = Object.keys(row);
            keys.forEach(key => {
                upload_row.push(row[key]);
            })
            upload_rows.push(upload_row);
        })
        upload_rows.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '']);

        await googleSheetsInstance.spreadsheets.values.append({
            auth, //auth object
            spreadsheetId, //spreadsheet id
            range: sheet.properties.title, //sheet name and range of cells
            valueInputOption: "USER_ENTERED", // The information will be passed according to what the usere passes in as date, number or text
            resource: {
                values: upload_rows,
            },
        });
    }

    return true;
}

const uploadLeads = async function (groupId = "", campaignId = "", callback = function() {}) {
    const group = await Groups.findOne({_id: groupId});
    const campaign = await Campaigns.findOne({_id: campaignId});

    const groupCampaign = group.campaigns.filter(c => c.detail == campaignId)[0];

    await check_uploaded_sheet(groupCampaign, campaign, false, callback);

    campaign.last_upload_datetime = moment().format('M/D/Y hh:mm A');

    Campaigns.findByIdAndUpdate(campaignId, campaign, function(err, c) {
        callback({status: 'success'});
    });
}

const send_whatsapp_file = async function (fileName = "", group = {}, groupCampaign = {}, campaign = {}, setting = {}, callback) {
    const fileData = fs.readFileSync(setting.local_folder_path + '\\' + fileName);
    const base64Data = fileData.toString('base64');
    const result = await get_whatsapp_groups(setting);
    const groups = result.data;

    let config = {
        method: 'post',
        url: `https://api.ultramsg.com/${setting.whatsapp.ultramsg_instance_id}/messages/document`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : {}
    };

    if (groupCampaign.whatsapp.xls_send_status == true && groupCampaign.whatsapp.users.length > 0 && groupCampaign.whatsapp.message) {
        for (const user of groupCampaign.whatsapp.users) {
            config['data'] = qs.stringify({
                "token": `${setting.whatsapp.ultramsg_token}`,
                "to": user,
                "document": base64Data,
                "filename": fileName,
                "caption": setting.whatsapp.xls_message_template
            });
            await axios(config)
        }
    }
    if (groupCampaign.whatsapp.xls_send_status == true && groupCampaign.whatsapp.groups.length > 0 && groupCampaign.whatsapp.message) {
        if (!groups || typeof groups === 'string') {
            callback({status: 'error', description: 'whatsapp sync error'});
            return false;
        }

        for (const group of groupCampaign.whatsapp.groups) {
            if (groups.filter(g => g.name === group).length === 0) {
                callback({status: 'error', description: 'whatsapp group error'});
                return false;
            }

            const g = groups.filter(g => g.name === group)[0];

            config['data'] = qs.stringify({
                "token": `${setting.whatsapp.ultramsg_token}`,
                "to": g.id,
                "document": base64Data,
                "filename": fileName,
                "caption": setting.whatsapp.xls_message_template
            });
            await axios(config)
        }
    }

    return true;
}

const send_whatsapp_message = async function (group = {}, groupCampaign = {}, campaign = {}, setting = {}, callback) {
    const result = await get_whatsapp_groups(setting);
    const groups = result.data;

    let config = {
        method: 'post',
        url: `https://api.ultramsg.com/${setting.whatsapp.ultramsg_instance_id}/messages/chat`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : {}
    };

    if (groupCampaign.whatsapp.send_status == true && groupCampaign.whatsapp.users.length > 0 && groupCampaign.whatsapp.message) {
        for (const user of groupCampaign.whatsapp.users) {
            config['data'] = qs.stringify({
                "token": `${setting.whatsapp.ultramsg_token}`,
                "to": user,
                "body": groupCampaign.whatsapp.message
            });
            await axios(config)
        }
    }
    if (groupCampaign.whatsapp.send_status == true && groupCampaign.whatsapp.groups.length > 0 && groupCampaign.whatsapp.message) {
        if (!groups || typeof groups === 'string') {
            callback('whatsapp sync error');
            return false;
        }

        for (const group of groupCampaign.whatsapp.groups) {
            if (groups.filter(g => g.name === group).length === 0) {
                callback('whatsapp group error');
                return false;
            }

            const g = groups.filter(g => g.name === group)[0];

            config['data'] = qs.stringify({
                "token": `${setting.whatsapp.ultramsg_token}`,
                "to": g.id,
                "body": groupCampaign.whatsapp.message
            });
            await axios(config)
        }
    }

    return true;
}

const get_whatsapp_groups = async (setting) => {
    const params = {
        "token": `${setting.whatsapp.ultramsg_token}`
    };

    const config = {
        method: 'get',
        url: `https://api.ultramsg.com/${setting.whatsapp.ultramsg_instance_id}/groups`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: params
    };

    return await axios(config);
}

const getColumnName = function(num) {
    let name = '';

    while (num > 0) {
        const remainder = (num - 1) % 26;
        name = String.fromCharCode(65 + remainder) + name;
        num = Math.floor((num - 1) / 26);
    }

    return name;
}

const upload_schedule = async function (group = {}, campaign = {}, setting = {}, callback) {
    const authClientObject = await auth.getClient();//Google sheets instance
    const googleSheetsInstance = google.sheets({version: "v4", auth: authClientObject});

    const regex = /\/d\/([a-zA-Z0-9-_]+)\//; // Regular expression to match the ID
    const match = regex.exec(setting.schedule_path);
    const spreadsheetId = match[1]; // Extract the ID from the matched string

    const spreadsheet = await googleSheetsInstance.spreadsheets.get({
        spreadsheetId
    });

    let sheet = {};
    for (const s of spreadsheet.data.sheets) {
        const sheetId = s.properties.sheetId;
        if (setting.schedule_path.indexOf("gid=" + sheetId) !== -1) {
            sheet = s;
        }
    }

    if (!sheet) {
        callback({status: 'error', description: 'sheet url path error'});
        return false;
    }

    let currentColInd = -1;
    const readData = await googleSheetsInstance.spreadsheets.values.get({
        auth, //auth object
        spreadsheetId, // spreadsheet id
        range: sheet.properties.title, //range of cells to read from.
    });
    readData.data.values[2].forEach((value, index) => {
        if (value === campaign.schedule) currentColInd = index;
    });

    const weekday = moment().format('dddd');
    const today = moment().format("MM/DD/YYYY");
    let currentRowInd = -1;
    const date_name = weekday === 'Thursday' ? weekday + ' ' + group.name : weekday;

    let updatedValue = '';

    readData.data.values.forEach((row, rInd) => {
        let index = 0;
        row.forEach((cell, colInd) => {
            if (weekday === 'Thursday') {
                if (cell == today) index++;
                if (cell == date_name && index > 0) currentRowInd = rInd;
            } else {
                if (cell == today) currentRowInd = rInd;
            }
        });
        
        if (!updatedValue) {
            if (currentRowInd !== -1 && currentColInd !== -1) {
                let cell = row[currentColInd];
                if (cell) {
                    updatedValue = cell + '+' + campaign.qty_schedule;
                } else {
                    updatedValue = campaign.qty_schedule;
                }
            }
        }
    });

    if (currentRowInd === -1) {
        await googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: sheet.properties.title + '!B' + (readData.data.values.length + 1),
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[today]],
            },
        });
        await googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: sheet.properties.title + '!C' + (readData.data.values.length + 1),
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[date_name]],
            },
        });
    }

    if (currentColInd !== -1) {
        await googleSheetsInstance.spreadsheets.values.update({
            auth,
            spreadsheetId,
            range: currentRowInd === -1 ?
                sheet.properties.title + '!' + getColumnName(currentColInd + 1) + (readData.data.values.length + 1) :
                sheet.properties.title + '!' + getColumnName(currentColInd + 1) + (currentRowInd + 1),
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[updatedValue]],
            },
        });
    }

    return true;
}

const uploadPreviewSheet = async function (groupId = "", campaignId = "", callback = function () {}) {
    const group = await Groups.findOne({_id: groupId});
    const campaign = await Campaigns.findOne({_id: campaignId});
    const setting = await Settings.findOne({});

    const groupCampaign = group.campaigns.filter(c => c.detail == campaignId)[0];

    const rows = campaign.last_temp_upload_info.upload_rows;

    const weekday = moment().format('dddd');
    const today = moment().format("MM/DD/YYYY");
    const date_name = weekday === 'Thursday' ? weekday + ' ' + group.name : weekday;

    let schedule = {};
    schedule.date = today;
    schedule.weekday = date_name;
    schedule.name = campaign.schedule;
    schedule.count = rows.length;
    schedule.update_status = false;
    Schedules.create(schedule);

    let fileName = '';

    let upload_google_sheet_status = true;
    if (rows.length > 0) {
        if (setting.send_out_type === 'GOOGLE') {
            upload_google_sheet_status = await upload_google_sheet_leads(rows, group, groupCampaign, campaign, setting, callback);
        } else {
            fileName = await download_local_file(rows, group, groupCampaign, campaign, setting, callback);
        }
    }

    campaign.qty_available = campaign.last_temp_upload_info.qty_available;
    campaign.qty_uploaded = campaign.last_temp_upload_info.qty_uploaded;
    campaign.qty_schedule = campaign.last_temp_upload_info.qty_schedule;
    campaign.last_phone = campaign.last_temp_upload_info.last_phone;
    campaign.system_create_datetime = campaign.last_temp_upload_info.system_create_datetime;
    campaign.last_upload_rows = campaign.last_temp_upload_info.upload_rows;

    campaign.last_temp_upload_info = {};
    campaign.is_manually_uploaded = false;
    campaign.is_get_last_phone = false;
    campaign.last_upload_datetime = moment().format('M/D/Y hh:mm A');

    let upload_schedule_status = true;
    if (process.env.ENVIRONMENT === 'production' && setting.send_out_type === 'GOOGLE' && campaign.qty_schedule !== 0) {
        upload_schedule_status = await upload_schedule(group, campaign, setting, callback);
    }

    if (upload_google_sheet_status === true) {
        Campaigns.findByIdAndUpdate(campaignId, campaign, function(err, c) {
            Campaigns.findOne({_id: campaignId}, async (err, updatedCampaign) => {
                let send_whatsapp_status = true;
                if (rows.length > 0) {
                    if (setting.send_out_type === 'GOOGLE') {
                        if (process.env.ENVIRONMENT === 'production' && setting.whatsapp.global_send_status == true) {
                            send_whatsapp_status = await send_whatsapp_message(group, groupCampaign, campaign, setting, function(description) {
                                callback({status: 'warning', campaign: updatedCampaign, description: description});
                            });
                        }
                    } else {
                        if (process.env.ENVIRONMENT === 'production' && (setting.is_auto_whatsapp_sending_for_local_way == true && setting.whatsapp.global_send_status == true && groupCampaign.whatsapp.xls_send_status == true)) {
                            send_whatsapp_status = await send_whatsapp_file(fileName, group, groupCampaign, campaign, setting, function(description) {
                                callback({status: 'warning', campaign: updatedCampaign, description: description});
                            });;
                        }
                    }
                }
                
                if (send_whatsapp_status === true) {
                    callback({status: 'success', campaign: updatedCampaign});
                }
            });
        });
    }
}

const getLastInputDate = async function (callback) {
    const setting = await Settings.findOne({});

    const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=${setting.mdb_path}; Uid=;Pwd=;`;
    ODBC.connect(connectionString, (error, connection) => {
        if (error) {
            callback({status: 'error', description: "Please can't connect to this MDB file."});
        }

        const input_query = "002_DateInput";
        connection.query(`SELECT TOP 1 * FROM [${input_query}]`, async (input_error, input_result) => {
            if (input_error) {
                await connection.close();
                callback({status: 'error', description: "Please can't run the 002_DateInput."});
                return;
            }

            const input_date = moment(new Date(input_result[0]['Date'])).format('M/D/YYYY');

            const service_query = "003c_002 Service Data County Date  <<";
            connection.query(`SELECT TOP 1 * FROM [${service_query}]`, async (service_error, service_result) => {
                await connection.close();

                if (service_error) {
                    callback({status: 'error', description: "Please can't run the 003c_002 Service Data County Date  <<."});
                    return;
                }

                const service_date = moment(new Date(service_result[0]['Date'])).format('M/D/YYYY');

                callback({status: 'success', inputDate: input_date, serviceDate: service_date});
            });
        });
    });
}

module.exports = {
    uploadSheet: uploadSheet,
    uploadLeads: uploadLeads,
    uploadPreviewSheet: uploadPreviewSheet,
    getLastInputDate: getLastInputDate
}