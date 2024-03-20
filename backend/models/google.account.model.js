const mongoose = require("mongoose");

const googleAccountSchema = new mongoose.Schema({
    mail_address: String,
    credential_path: String,
    online_status: {
        type: Boolean,
        default: false
    } 
});

const GoogleAccounts = mongoose.model("GoogleAccount", googleAccountSchema);

module.exports = GoogleAccounts;