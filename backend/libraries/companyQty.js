const pdfcrowd = require("pdfcrowd");
const fs = require('fs');
const ODBC = require("odbc");
const axios = require("axios");
const qs = require("qs");
const moment = require('moment-timezone');
moment.tz.setDefault('America/Los_Angeles');

const Companies = require('../models/company.model');
const Settings = require("../models/setting.model");

const queryCompanyDailyCountDate = "zzzzz Company ID Daily Count 001 - Date";
const queryCompanyDailyCount = "zzzzz Company ID Daily Count 003";

const htmlFileName = 'company_qty.html';
const imageFileName = 'company_qty.png';

const PDFCROWD_AUTH_USER_NAME = 'LimWenKai1';
const PDFCROWD_AUTH_USER_TOKEN = 'ed3ec2e15235808c3bfa436c941f909d';

const send = async function(callback) {
    const setting = await Settings.findOne({});
    const companies = await Companies.find({});

    await getBaseData(companies, setting, callback, function(lastSystemCreateDate, rows) {
        downloadHtmlFile(lastSystemCreateDate, rows, callback, function() {
            convertFromHtmlToImage(callback, function() {
                sendWhatsAppImage(setting, callback, async function() {
                    const upgradedSetting = await Settings.findOne({});
                    callback({status: 'success', setting: upgradedSetting});
                });
            });
        });
    });
}

const getBaseData = async function(companies, setting, callback, returnCallback) {
    const connectionString = `Driver={Microsoft Access Driver (*.mdb, *.accdb)}; DBQ=${setting.mdb_path}; Uid=;Pwd=;`;
    ODBC.connect(connectionString, (error, connection) => {
        if (error) {
            callback({status: 'error', description: "mdb open error."});
            return;
        }

        connection.query(`SELECT * FROM [${queryCompanyDailyCountDate}]`, async (error, dateResult) => {
            await connection.close();

            if (error) {
                callback({status: 'error', description: "mdb query error."});
                return;
            }

            let dateRows = [];
            for (let i = 0; i < dateResult.length; i++) {
                const dateRow = dateResult[i];
                
                if (!setting.last_system_create_date_time_for_company_qty || new Date(moment(new Date(dateRow.SystemCreateDate)).format('M/D/Y hh:mm:ss A')) > new Date(moment(new Date(setting.last_system_create_date_time_for_company_qty)).format('M/D/Y hh:mm:ss A'))) {
                    dateRows.push(dateRow);
                }
            }

            if (dateRows.length === 0) {
                callback({status: 'error', description: "nothing new data"});
                return;
            }

            const lastSystemCreateDate = moment(dateResult[dateResult.length - 1].SystemCreateDate).format('M/D/Y hh:mm:ss A');

            Settings.updateOne({_id: setting._id}, {last_system_create_date_time_for_company_qty: lastSystemCreateDate}, function (err, docs) {
                if (err) {
                    callback({status: 'error', description: "setting save error."});
                    return;
                } 
            });

            let rows = [];
            companies.forEach(c => {
                let row = {};
                row['qty'] = 0;
                row['id'] = c.mdb_id.slice(2);
                row['name'] = c.nick_name;

                dateRows.forEach(d => {
                    if (d.companyId == c.mdb_id) {
                        row['qty'] += 1;
                    }
                })

                rows.push(row);
            })

            returnCallback(lastSystemCreateDate, rows);
        });
    });
}

const downloadHtmlFile = function(lastSystemCreateDate, rows, callback, returnCallback) {
    let html = `<html>
                    <body>
                        <span style="font-size: 18px;">Last SystemCreateDate:</span>
                        <span style="font-size: 18px; font-family: bold; color: red;">` + lastSystemCreateDate + `</span>`;

    html += `<table border='0' cellpadding='3' cellspacing='0' style='border-collapse:collapse;margin-top: 5px;'>
                <thead style="background-color: #dfdbdb;">
                    <tr>
                        <th style="width: 100px; border: 1px solid #d3cccc;">Qty Of Leads</th>
                        <th style="width: 110px; border: 1px solid #d3cccc;">CompanyID</th>
                        <th style="width: 200px; border: 1px solid #d3cccc;">Company Name</th>
                    </tr>
                </thead>`;

    html += `<tbody style="font-size: 12px;">`;
    
    rows.forEach(row => {
        html += `<tr>`;
        html += `<td style="text-align: right; border: 1px solid #d3cccc;">` + row.qty + `</td>`;
        html += `<td style="border: 1px solid #d3cccc;">` + row.id + `</td>`;
        html += `<td style="border: 1px solid #d3cccc;">` + row.name + `</td>`;
        html += `</tr>`;
    })

    html += `</tbody>`;

    html += `</table>`;
    html += `</body>`;
    html += `</html>`;

    fs.writeFile(htmlFileName, html, (err) => {
        if (err) {
            callback({status: 'error', description: "html generate error."});
            return;
        }

        returnCallback();
    });
}

const convertFromHtmlToImage = function(callback, returnCallback) {
    const client = new pdfcrowd.HtmlToImageClient(PDFCROWD_AUTH_USER_NAME, PDFCROWD_AUTH_USER_TOKEN);

    client.setOutputFormat("png");
    client.convertFileToFile(htmlFileName, imageFileName, function(err, filePath) {
        if (err) {
            callback({status: 'error', description: "image convert error."});
            return;
        }

        returnCallback();
    });
}

const sendWhatsAppImage = async function(setting, callback, returnCallback) {
    // Read image file
    const imageBuffer = fs.readFileSync(imageFileName);
    
    // Encode image file to base64
    const imageBase64 = imageBuffer.toString('base64');

    const config = {
        method: 'post',
        url: `https://api.ultramsg.com/${setting.whatsapp.ultramsg_instance_id}/messages/image`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : qs.stringify({
            "token": `${setting.whatsapp.ultramsg_token}`,
            "to": '+14692140362',
            "image": imageBase64
        })
    };

    axios(config)
        .then(function (response) {
            returnCallback();
        })
        .catch(function (error) {
            callback({status: 'error', description: error});
        });
}

module.exports = {
    send: send,
}