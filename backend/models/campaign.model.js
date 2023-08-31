const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    query: String,
    schedule: String,
    sheet_urls: [],
    columns: [{
        db_name: String,
        sheet_name: String,
        is_display: {
            type: Boolean,
            default: true
        }
    }],
    qty_avaiable: Number,
    qty_uploaded: Number,
    last_upload_date: Date,
    last_phone: String,
    system_create_date: Date
});

const Campaigns = mongoose.model("Campaign", campaignSchema);

module.exports = Campaigns;