const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
    date: String,
    weekday: String,
    name: String,
    count: Number,
    update_status: {
        type: Boolean,
        default: false
    } 
});

const Schedules = mongoose.model("Schedule", scheduleSchema);

module.exports = Schedules;