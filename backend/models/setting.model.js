const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    backup_path: String,
    mdb_path: String,
    local_folder_path: String,
    schedule_path: String,
    last_system_create_date_time_for_company_qty: String,
    is_auto_whatsapp_sending_for_company_qty: {
        type: Boolean,
        default: true
    },
    send_out_type: {
        type: String,
        enum: ['GOOGLE', 'LOCAL'],
        default: 'GOOGLE'
    },
    send_local_file_type: {
        type: String,
        enum: ['CSV', 'XLS'],
        default: 'CSV'
    },
    is_auto_whatsapp_sending_for_local_way: {
        type: Boolean,
        default: false
    },
    whatsapp: {
        global_send_status: {
            type: Boolean,
            default: true,
        },
        default_message_template: String,
        ultramsg_instance_id: String,
        ultramsg_token: String
    },
    whatsapp_receivers_for_database_backup: {
        message: String,
        users: [],
        groups: []
    },
    pdfcrowd: {
        username: String,
        apikey: String
    },
    current_upload: {
        group: {
            type: mongoose.Schema.ObjectId,
            ref: 'Group'
        },
        way: {
            type: String,
            enum: ['ALL', 'ONE'],
            default: 'ALL'
        },
        cancel_status: {
            type: Boolean,
            default: false
        }
    },
});

const Settings = mongoose.model("Setting", settingSchema);

module.exports = Settings;