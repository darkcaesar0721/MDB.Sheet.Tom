const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    campaign: {
        type: mongoose.Schema.ObjectId,
        ref: 'Campaign'
    },
    port: Number,
    description: String,
    date: Date,
    report_status: {
        type: Boolean,
        default: false
    }
});

const Issues = mongoose.model("Issue", issueSchema);

module.exports = Issues;