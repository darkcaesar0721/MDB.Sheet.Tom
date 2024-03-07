const fs = require('fs');

fs.writeFile('./setting.json', JSON.stringify({browserOpened: false}), function(err) {
    if (err) throw err;
});