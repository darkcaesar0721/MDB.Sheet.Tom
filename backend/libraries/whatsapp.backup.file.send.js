const axios = require("axios");
const fs = require("fs");
const qs = require("qs");
const path = require("path");

const Settings = require("../models/setting.model");
const Campaigns = require("../models/campaign.model");
const Issues = require("../models/issue.model");

const send = async function(callback) {
    const setting = await Settings.findOne({});
    const latestFileName = getMostRecentFileName(setting.backup_path);
    const latestFilePath = path.join(setting.backup_path, latestFileName);

    getBase64Data(latestFilePath, async function(data) {
        const result = await get_whatsapp_groups(setting);
        await sendWhatsAppBackupJson(setting, result.data, latestFileName, data, callback);
        callback({status: 'success'});
    });
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

const sendWhatsAppBackupJson = async function(setting, groups, fileName, base64Data, callback) {
    const config = {
        method: 'post',
        url: `https://api.ultramsg.com/${setting.whatsapp.ultramsg_instance_id}/messages/document`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : {}
    };

    const issueText = await getCurrentIssueText();

    if (setting.whatsapp_receivers_for_database_backup.users && setting.whatsapp_receivers_for_database_backup.users.length > 0) {
        for (const user of setting.whatsapp_receivers_for_database_backup.users) {
        	if (user != '') {
        		config['data'] = qs.stringify({
	                "token": `${setting.whatsapp.ultramsg_token}`,
	                "to": user,
	                "document": base64Data,
	                "filename": fileName,
	                "caption": setting.whatsapp_receivers_for_database_backup.message
	            });
	            await axios(config);

                if (issueText) {
                    await axios({
                        method: 'post',
                        url: `https://api.ultramsg.com/${setting.whatsapp.ultramsg_instance_id}/messages/chat`,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: qs.stringify({
                            "token": `${setting.whatsapp.ultramsg_token}`,
                            "to": user,
                            "body": issueText
                        })
                    })
                }
        	}
        }
    }
    if (setting.whatsapp_receivers_for_database_backup.groups && setting.whatsapp_receivers_for_database_backup.groups.length > 0) {
        for (const group of setting.whatsapp_receivers_for_database_backup.groups) {
            if (group != '') {
                if (groups.filter(g => g.name === group).length === 0) {
                    callback({status: 'error', description: 'whatsapp group error'});
                    return;
                }
    
                const g = groups.filter(g => g.name === group)[0];
    
                config['data'] = qs.stringify({
                    "token": `${setting.whatsapp.ultramsg_token}`,
                    "to": g.id,
                    "document": base64Data,
                    "filename": fileName,
                    "caption": setting.whatsapp_receivers_for_database_backup.message
                });
                await axios(config)

                if (issueText) {
                    await axios({
                        method: 'post',
                        url: `https://api.ultramsg.com/${setting.whatsapp.ultramsg_instance_id}/messages/chat`,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: qs.stringify({
                            "token": `${setting.whatsapp.ultramsg_token}`,
                            "to": g.id,
                            "body": issueText
                        })
                    })
                }
            }
        }
    }
}

const getCurrentIssueText = async function() {
    let issueText = '';
    
    const issues = await Issues.find({report_status: false}).populate('campaign').exec();

    issues.forEach((issue, index) => {
        issueText += (index + 1) + '. Campaign: *' + issue.campaign.schedule + '*, Port: *_' + issue.port + '_*, Issue: *~' + issue.description + '~*, Date: ```' + issue.date + '```\n';   
    })

    await Issues.updateMany({report_status: false}, {report_status: true}).exec();

    return issueText;
}

const getMostRecentFileName = function(folderPath) {
    const files = fs.readdirSync(folderPath);
    let mostRecentFile;
    let mostRecentTime = 0;

    files.forEach((file) => {
        const filePath = path.join(folderPath, file);
        const fileStats = fs.statSync(filePath);
        const fileModifiedTime = fileStats.ctimeMs;

        if (fileModifiedTime > mostRecentTime) {
            mostRecentFile = file;
            mostRecentTime = fileModifiedTime;
        }
    });

    return mostRecentFile;
}

const getBase64Data = function(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            callback({status: 'error', description: 'Error reading JSON file:'});
            return;
        }
      
        const base64Content = Buffer.from(data).toString('base64');
        
        callback(base64Content);
      });
}

module.exports = {
    send: send,
}