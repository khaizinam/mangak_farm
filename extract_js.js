const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const js = lines.slice(167, 999).join('\n');
fs.writeFileSync('ui.js', js, 'utf8');
const newHtml = [...lines.slice(0, 167), '<script src="ui.js?v=1.0.0"></script>', ...lines.slice(999)].join('\n');
fs.writeFileSync('index.html', newHtml, 'utf8');
