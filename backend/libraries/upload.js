const { google } = require("googleapis");
const ODBC = require("odbc");
const moment = require('moment-timezone');
moment.tz.setDefault('America/Los_Angeles');
const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const Campaigns = require('../models/campaign.model');
const axios = require("axios");
const qs = require("qs");

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function generateRandomIntegers(count, min, max) {
    const randomIntegers = [];

    for (let i = 0; i < count; i++) {
        const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;
        randomIntegers.push(randomInteger);
    }

    return randomIntegers.sort();
}

const upload_sheet = async function (group = {}, campaign = {}, setting = {}, manually = false, callback = function() {}) {
    const authClientObject = await auth.getClient();//Google sheets instance
    const googleSheetsInstance = google.sheets({version: "v4", auth: authClientObject});

    let last_phone = campaign.last_phone;
    const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=${setting.mdb_path}; Uid=;Pwd=;`;

    ODBC.connect(connectionString, (error, connection) => {
        if (error) {
            callback({status: 'error', description: "Please can't connect to this MDB file."});
        }

        connection.query(`SELECT * FROM [${campaign.query}]`, async (error, result) => {
            if (error) {
                callback({status: 'error', description: "Please can't run the this query."});
            }

            let rows = [];

            let mdbRows = [];
            for (let i = 0; i < result.length; i++) {
                const row = result[i];
                if (last_phone === row['Phone']) break;
                mdbRows.push(row);
            }

            switch (campaign.filter.way) {
                case 'ALL':
                    mdbRows.forEach(mdbRow => {
                        let row = {};
                        for (const column of campaign.columns) {
                            if (column.is_display === false) continue;
                            row[column.mdb_name] = mdbRow[column.mdb_name];
                        }
                        rows.push(row);
                    })
                    break;
                case 'STATIC':
                    for (const mdbRow of mdbRows) {
                        if (rows.length === campaign.filter.static_count) break;

                        let row = {};
                        for (const column of campaign.columns) {
                            if (column.is_display === false) continue;
                            row[column.mdb_name] = mdbRow[column.mdb_name];
                        }
                        rows.push(row);
                    }
                    break;
                case 'RANDOM':
                    let random_count = getRandomInt(campaign.filter.random_start, campaign.filter.random_end);
                    if (random_count >= mdbRows.length) {
                        for (const mdbRow of mdbRows) {
                            let row = {};
                            for (const column of campaign.columns) {
                                if (column.is_display === false) continue;
                                row[column.mdb_name] = mdbRow[column.mdb_name];
                            }
                            rows.push(row);
                        }
                    } else {
                        const randomIntegers = generateRandomIntegers(random_count - 1, campaign.filter.random_start, campaign.filter.random_end);
                        const randoms = [0, ...randomIntegers];
                        mdbRows.forEach((mdbRow, i) => {
                            randoms.forEach((random, j) => {
                                if (i === j) {
                                    let row = {};
                                    for (const column of campaign.columns) {
                                        if (column.is_display === false) continue;
                                        row[column.mdb_name] = mdbRow[column.mdb_name];
                                    }
                                    rows.push(row);
                                }
                            })
                        })
                    }
                    break;
                case 'RANDOM_FIRST':
                    let random_first_count = getRandomInt(campaign.filter.random_start, campaign.filter.random_end);
                    if (random_first_count >= mdbRows.length) {
                        for (const mdbRow of mdbRows) {
                            let row = {};
                            for (const column of campaign.columns) {
                                if (column.is_display === false) continue;
                                row[column.mdb_name] = mdbRow[column.mdb_name];
                            }
                            rows.push(row);
                        }
                    } else {
                        let end = campaign.filter.random_start_position;
                        if (mdbRows.length < end) end = mdbRows.length;

                        const randomIntegers = generateRandomIntegers(random_first_count - 1, 1, end - 1);
                        const randoms = [0, ...randomIntegers];
                        mdbRows.forEach((mdbRow, i) => {
                            randoms.forEach((random, j) => {
                                if (i === j) {
                                    let row = {};
                                    for (const column of campaign.columns) {
                                        if (column.is_display === false) continue;
                                        row[column.mdb_name] = mdbRow[column.mdb_name];
                                    }
                                    rows.push(row);
                                }
                            })
                        })
                    }
                    break;
                case 'PERIOD':
                    const today = moment().format('M/D/Y');
                    const start_date = moment().subtract(campaign.filter.period_start, 'days').format('M/D/Y');
                    const end_date = moment().subtract(campaign.filter.period_end, 'days').format('M/D/Y');

                    mdbRows.forEach((mdbRow, i) => {
                        const dateValue = new Date(mdbRow['SystemCreateDate']);
                        const date = moment(dateValue).format('M/D/Y');

                        if (date >= end_date && date <= start_date) {
                            let row = {};
                            for (const column of campaign.columns) {
                                if (column.is_display === false) continue;
                                row[column.mdb_name] = mdbRow[column.mdb_name];
                            }
                            rows.push(row);
                        }
                    })
                    break;
                case 'DATE':
                    if (campaign.filter.date_is_time) {
                        const before_date = moment().subtract(campaign.filter.date_old_day, 'days').format('M/D/Y');
                        const before_date_value = new Date(before_date + ' ' + campaign.filter.date_time + ':00 ' + campaign.filter.date_meridian);
                        const before_datetime = moment(before_date_value).format('M/D/Y hh:mm A');

                        mdbRows.forEach((mdbRow, i) => {
                            const dateValue = new Date(mdbRow['SystemCreateDate']);
                            const datetime = moment(dateValue).format('M/D/Y hh:mm A');

                            if (datetime > before_datetime) {
                                let row = {};
                                for (const column of campaign.columns) {
                                    if (column.is_display === false) continue;
                                    row[column.mdb_name] = mdbRow[column.mdb_name];
                                }
                                rows.push(row);
                            }
                        })
                    } else {
                        const before_date = moment().subtract(campaign.filter.date_old_day, 'days').format('M/D/Y');

                        mdbRows.forEach((mdbRow, i) => {
                            const dateValue = new Date(mdbRow['SystemCreateDate']);
                            const date = moment(dateValue).format('M/D/Y');

                            if (date >= before_date) {
                                let row = {};
                                for (const column of campaign.columns) {
                                    if (column.is_display === false) continue;
                                    row[column.mdb_name] = mdbRow[column.mdb_name];
                                }
                                rows.push(row);
                            }
                        })
                    }
                    break;
            }

            if (manually === true) {
                campaign.last_temp_upload_info.qty_available = mdbRows.length;
                campaign.last_temp_upload_info.qty_uploaded = rows.length;

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

                if (rows.length > 0) {
                    campaign.last_phone = mdbRows[0]['Phone'];
                    campaign.system_create_datetime = mdbRows[0]['SystemCreateDate'];
                }
                campaign.is_get_last_phone = false;
                campaign.last_upload_datetime = moment().format('M/D/Y hh:mm A');
                campaign.last_upload_rows = rows;
            }


            if (manually === false) {
                if (rows.length > 0) {
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

                        if (!sheet) return {status: 'error', description: 'Google sheet path error'};

                        let upload_rows = [['', '', '', '', '', '', '', '', '', '', '', '', '', '']];
                        let upload_row = [];
                        for (const column of campaign.columns) {
                            if (column.is_display === false) continue;

                            upload_row.push(column.sheet_name);
                        }
                        upload_rows = [...upload_rows, upload_row];

                        rows.forEach((row) => {
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
                    await send_whatsapp_message(group, campaign, setting);
                }
                await upload_schedule(group, campaign, setting);

                Campaigns.findByIdAndUpdate(campaign.campaign._id, campaign, function(err, c) {
                    Campaigns.findOne({_id: campaign.campaign._id}, (err, updatedCampaign) => {
                        callback({status: 'success', campaign: updatedCampaign});
                    });
                });
            }
        });
    });


}

const send_whatsapp_message = async function (group = {}, campaign = {}, setting = {}) {
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

    if (campaign.whatsapp.send_status && campaign.whatsapp.users.length > 0 && campaign.whatsapp.message) {
        for (const user of campaign.whatsapp.users) {
            config['data'] = qs.stringify({
                "token": `${setting.whatsapp.ultramsg_token}`,
                "to": user,
                "body": setting.whatsapp.message
            });
            await axios(config)
        }
    }
    if (campaign.whatsapp.send_status && campaign.whatsapp.groups.length > 0 && campaign.whatsapp.message) {
        for (const group of campaign.whatsapp.groups) {
            const g = groups.filter(g => g.name === group)[0];

            config['data'] = qs.stringify({
                "token": `${setting.whatsapp.ultramsg_token}`,
                "to": g.id,
                "body": setting.whatsapp.message
            });
            await axios(config)
        }
    }
}

const get_whatsapp_groups = async (setting, callback = function () {
}) => {
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

module.exports = {
    get_whatsapp_groups: get_whatsapp_groups,
}

const upload_schedule = async function (group = {}, campaign = {}, setting = {}) {
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

    if (!sheet) return {status: 'error', description: 'Schedule google sheet path error'};

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
    let sheetRow = [];
    const date_name = weekday === 'Thursday' ? weekday + ' ' + group.name : weekday;

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
        if (currentRowInd !== -1) {
            sheetRow = [];
            for (let i = 0; i < 200; i++) {
                let cell = '';
                if (i < row.length) cell = row[i];

                if (i === currentColInd) {
                    const splitCells = cell.split(' ');
                    if (splitCells.length > 1) {
                        sheetRow.push(cell + ' ' + campaign.qty_uploaded);
                    } else {
                        if (parseInt(cell) < 13) sheetRow.push(cell + '+' + campaign.qty_uploaded);
                        else sheetRow.push(cell + ' ' + campaign.qty_uploaded);
                    }
                } else {
                    sheetRow.push(cell);
                }
            }
        } else {
            sheetRow = ['', today, date_name];
            for (let i = 3; i <= currentColInd; i++) {
                if (i === currentColInd) sheetRow.push(campaign.qty_uploaded);
                else sheetRow.push(' ');
            }
        }
    });

    await googleSheetsInstance.spreadsheets.values.update({
        auth,
        spreadsheetId,
        range: currentRowInd === -1 ?
            sheet.properties.title + '!A' + (readData.data.values.length + 1) + ':ZZ' + (readData.data.values.length + 1) :
            sheet.properties.title + '!A' + (currentRowInd + 1) + ':ZZ' + (currentRowInd + 1),
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [sheetRow],
        },
    });
}

module.exports = {
    upload_sheet: upload_sheet,
    upload_schedule: upload_schedule,
    send_whatsapp_message: send_whatsapp_message
}