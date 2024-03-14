const XLSX = require('xlsx');
const moment = require('moment');

const Settings = require("../models/setting.model");
const Schedules = require("../models/schedule.model");

const update = async function(callback = function () {}) {
    const setting = await Settings.findOne({});
    const schedules = await Schedules.find({update_status: false});

    const xlsPath = setting.xls_path;
    
    for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];

        const workbook = XLSX.readFile(xlsPath);
        const sheetNames = workbook.SheetNames;
        const sheet = workbook.Sheets[sheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, {raw: false});

        const sheetHeaders = data[0];
        let columnIndex = -1;

        for (let j = 0; j < 500; j++) {
            if (sheetHeaders['__EMPTY_' + j] == schedule.name) {
                columnIndex = j;
                break;
            }
        }
        
        let rowIndex = -1;
        data.forEach((row, index) => {
            if (row['__EMPTY']) {
                const spDate = row['__EMPTY'].split('/');
                const date = spDate[0] + '/' + spDate[1] + '/' + (spDate[2].length === 4? spDate[2] : '20' + spDate[2]);

                if (moment(new Date(date)).format('M/D/Y') == moment(new Date(schedule.date)).format('M/D/Y') && row['__EMPTY_1'] == schedule.weekday) {
                    rowIndex = index;
                }
            }
        })

        if (columnIndex !== -1) {
            let value = '';
            if (rowIndex === -1) {
                value = schedule.count;
            } else {
                value = data[rowIndex]['__EMPTY_' + columnIndex] === undefined ? schedule.count : data[rowIndex]['__EMPTY_' + columnIndex] + '+' + schedule.count;
            }

            const cell = getColumnName(columnIndex + 2) + (rowIndex === -1 ? (data.length + 3) : (rowIndex + 3));
            sheet[cell] = {t: data[rowIndex]['__EMPTY_' + columnIndex] === undefined ? 'n' : 's', v: value};
            
            data.forEach((row, index) => {
                const cell = sheet["B" + (index + 3)];
                if (cell) {
                    const spDate = row['__EMPTY'].split('/');
                    const date = spDate[0] + '/' + spDate[1] + '/' + (spDate[2].length === 4? spDate[2] : '20' + spDate[2]);
                    sheet["B" + (index + 3)] = {t: 's', v: date};
                }
            })

            XLSX.writeFile(workbook, xlsPath);
        }
    }

    await Schedules.updateMany({update_status: false}, {update_status: true}).exec();

    callback();
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

module.exports = {
    update
}