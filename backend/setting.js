const fs = require('fs');
const kill = require('kill-port');

fs.writeFile('./setting.json', JSON.stringify({browserOpened: false}), function(err) {
    if (err) throw err;
});

for (let p = 5000; p < 5005; p++) {
    kill(p, 'tcp')
        .then(() => {
            console.log('Killed process on port ' + p);
        })
        .catch(err => {
            console.error(err); 
        });
}