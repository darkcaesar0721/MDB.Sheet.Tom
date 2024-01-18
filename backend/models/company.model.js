const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    mdb_id: String,
    mdb_name: String,
    nick_name: String
});

const Companies = mongoose.model("Company", companySchema);

module.exports = Companies;