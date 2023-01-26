import express from 'express';
import bodyParser from 'body-parser';
import fetch from "node-fetch";
import fs from 'fs'
import path from 'path';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import https from 'https';
import cors from 'cors';

//import './electricity.js';
import {getElectricityHistoryToday, getElectricityHistory, currentElectricityState} from './electricity.js';

const https_options = {
    key: fs.readFileSync('./cert/ua-alert_info.key'),
    cert: fs.readFileSync('./cert/ua-alert_info.crt'),
    ca: fs.readFileSync('./cert/ua-alert_info.ca-bundle'),
};

const __dirname = path.resolve();

const app = express();
const port = 443;

const server = https.createServer(https_options, app);

async function readFiles() {
    if (!fs.existsSync('./users/')) {
        fs.mkdirSync('./users/');
    }

    fs.readdirSync('./users/').forEach(folder => {
        if (!users[folder]) users[folder] = [];

        fs.readdirSync(`./users/${folder}/`).forEach(file => {
            const data = JSON.parse(fs.readFileSync(`./users/${folder}/${file}`, 'utf8'));

            if (data) {
                users[folder].push(data);
            }
        });
    });
}

async function createFolder() {
    if (!fs.existsSync('./keys/')) fs.mkdirSync('./keys/');
}

async function sendMessage(email, key) {
    const data = JSON.parse(fs.readFileSync(`email.json`, 'utf8'));
    const client = nodemailer.createTransport(JSON.parse(fs.readFileSync(`email.json`, 'utf8')));

    client.sendMail(
        {
            from: "uaalertinfo@gmail.com",
            to: email,
            subject: "ua-alert registration",
            text: `Будь ласка, використовуйте цей ключ для доступу до сайту ua-alert.info: ${key}.`
        }
    );
}

function generateKey(name, email, text) {
    getKeys();

    for (var i = 0; i < keys.length; i++) {
        if (keys[i].email === email) {
            sendMessage(email, keys[i].key);

            return;
        }
    }

    var key = crypto.randomBytes(10).toString('hex');

    var body = {
        "key": key,
        "name": name, 
        "email": email, 
        "text": text,
        "max_trigger_amount": 3
    }

    fs.writeFileSync(`./keys/${key}.json`, JSON.stringify(body, null, 2));

    keys.push(body);

    sendMessage(email, key);
}

async function getKeys() {
    keys = [];
    fs.readdirSync('./keys/').forEach(file => {
        const data = JSON.parse(fs.readFileSync(`./keys/${file}`, 'utf8'));

        if (data) {
            if (!data.max_trigger_amount) data.max_trigger_amount = 10000;
            keys.push(data);
        }
    });
}

async function changeFiles(trigger) {
    fs.writeFile(`./users/${trigger['id']}/${trigger.triggerID}.json`, JSON.stringify(trigger, null, 2), err => {
        if (err) throw err;
    });
}

function getData() {
    var array = Object.values(JSON.parse(fs.readFileSync('data.json', 'utf8')));
    var data1 = array.length;
    var data2 = 0;

    var year = new Date(Date.now()).getFullYear();
    var date = new Date(Date.now()).getDate();
    
    for (var i = 0; i < array.length; i++) {
        if (array[i].date) {
            var year1 = array[i].date.date;
            var date1 = array[i].date.year;

            if (data1[0] === '0') data1 = data1.substring(1);

            if (year === year1 && date === date1) {
                data2++;
            }
        }
    }

    console.log(`Скільки користувачів зайшло на сайт: ${data1}, Скільки користувачів зайшло сьогодні: ${data2}`);
}

var users = {};
var obj = {};
var alerts = [];

var keys = [];

readFiles();
createFolder();
getKeys();
getData();

setInterval(() => {
    getData();
}, 5*60*1000);

app.use(cors({
    origin: '*'
  }));
  
app.use(bodyParser.json());
app.use('/tutorial', express.static('tutorial'));
app.use('/about', express.static('about'));
app.use('/files', express.static('files'));

app.get('/update', (req, res) => {
    checkAlerts(onAlert);
    onAlert();
    trigger_alerts();
    res.send('updated');
});

app.get('/svitlo/now/*', (req, res) => {
    var massiv = req.path.split('/');
    if (massiv.length > 2) {
        var domain = massiv[3];
        res.send(currentElectricityState(domain) ? "1" : "2");
    } else res.send('wrong domain');
});

app.get('/svitlo/today/*', (req, res) => {
    var massiv = req.path.split('/');
    if (massiv.length > 2) {
        var domain = massiv[3];
        res.send(JSON.stringify(getElectricityHistoryToday(domain)));
    } else res.send('wrong domain');
});

app.get('/svitlo/history/*', (req, res) => {
    var massiv = req.path.split('/');
    if (massiv.length > 2) {
        var domain = massiv[3];
        res.send(JSON.stringify(getElectricityHistory(domain)));
    } else res.send('wrong domain');
});

app.get('/delete/*', (req, res) => {
    var massiv = req.path.split('/');

    var key = massiv[2];
    var id = massiv[3];

    if (fs.existsSync(`./users/${key}/${id}.json`)) fs.unlinkSync(`./users/${key}/${id}.json`);

    for (var i = 0; i < users[key].length; i++) {
        if (users[key][i].triggerID === id) {
            users[key].splice(i, 1);
        }
    }
    res.send('updated');
});

app.get('/triggers/*', (req, res) => {
    var id = req.path.substring(10);
    var r = {};

    if (users[id]) r = users[id];

    res.send(JSON.stringify(r, null, 2));
});

app.post('/generateKey', (req, res) => {
    var body = req.body;
    var email = body.key_email;
    var name = body.key_name;
    var textarea = body.textarea;

    generateKey(name, email, textarea);

    res.send('sucess');
});

app.get('/svitlo/*', (req, res) => {
    res.sendFile(__dirname + '/files/svitlo.html');
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/files/index.html');
});

app.post('/webhook', async (req, res) => {
    var body = req.body;

    var result = await exec_hook(body.webhook);
    res.send(result.result ? "success" : "failure");
});

app.post('/data', (req, res) => {
    var body = req.body;
    var key = body.id;
    var triggerID = body.triggerID;

    var num = 0;

    var send = null;

    if (body.id) {
        for (var a = 0; a < keys.length; a++) {
            if (keys[a].key === key) {
                if (!users[key]) users[key] = [];

                for (var b = 0; b < users[key].length; b++) {
                    var el = users[key][b];

                    if (el.triggerID === body.triggerID) {
                        if (el.need_alert) body.need_alert = el.need_alert;
                        if (el.started) body.started = el.started;
                        users[key][b] = body;
                        num++;
                    }
                }

                
                if (users[key].length !== keys[a].max_trigger_amount) {
                    send = 'sucess';

                    if (num === 0) {
                        var a = users[key];
                        a.push(body);

                        try {
                            if (!fs.existsSync(`./users/${key}`)) {
                                fs.mkdirSync(`./users/${key}`);
                            }
                        } catch (err) {
                            console.error(err);
                        }
        
                        fs.writeFileSync(`./users/${key}/${triggerID}.json`, JSON.stringify(body, null, 2));
                    }
                } else send = 'key is filled';

                if (num > 0) {
                    try {
                        if (!fs.existsSync(`./users/${key}`)) {
                            fs.mkdirSync(`./users/${key}`);
                        }
                    } catch (err) {
                        console.error(err);
                    }
    
                    fs.writeFileSync(`./users/${key}/${triggerID}.json`, JSON.stringify(body, null, 2));
                }

                if (send) res.send(send);
            }
        }
    } else {
        send = 'acess denied';

        res.send(send);
        return;
    }
});

app.post('/check_data', (req, res) => {
    var id = req.body.id;

    if (id) {
        var data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

        if (!data) {
            data = {};
        }

        data[id] = {
            id: id, 
            date: {
                date: new Date(Date.now()).getDate(), 
                year: new Date(Date.now()).getFullYear()
            }
        }

        fs.writeFileSync('data.json', JSON.stringify(data, null, 2))
    }

    res.send('');
});

app.post('/get_data', (req, res) => {
    var array = Object.values(JSON.parse(fs.readFileSync('data.json', 'utf8')));
    res.send(JSON.stringify(array));
})

app.use(express.static('files'));

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

var apikey = '';
apikey = fs.readFileSync('key.txt').toString('utf8').substring(0, 41);

if (apikey.length == 0) {
    console.error('You need to get the correct access key from the https://api.ukrainealarm.com and put into the key.txt');
}

async function alert_request(cmd) {
    try {
        var res = await fetch('https://api.ukrainealarm.com/api/v3/alerts/' + cmd, {
            headers: {
                'accept': 'application/json',
                'Authorization': apikey
            }
        });

        var text = await res.text();

        if (text.length) {
            try {
                return JSON.parse(text);
            } catch (err) {
                return {};
            }
        }

        return {};
    } catch (err) {
        return {};
    }
}

// execure the webhook, returns true if succesful
async function exec_hook(uri, trigger) {
    if (uri && uri.includes('https://')) {
        try {
            var res = await fetch(uri);
            var txt = await res.text();
            if (txt.length) {
                var obj = JSON.parse(txt);
                if (obj.error) return {result: obj.error === 0, object: trigger};
                return {result: true, object: trigger};
            }
        } catch (err) {
            console.log(err);
        }
    } else return {result: true, object: trigger};
    return {result: false, object: trigger};
}

// this function called each time when alert state changes

async function onAlert() {
    var obj = alertState;

    var users_massiv = Object.values(users);

    var user = null;
    var trigger = null;

    var state_id = null;
    var district_id = null;
    var community_id = null;

    var activeAlerts = null;
    var type = null;

    var id = 0;

    for (var a = 0; a < users_massiv.length; a++) {
        user = users_massiv[a];

        for (var b = 0; b < user.length; b++) {
            trigger = user[b];

            var need_alert_old = trigger.need_alert;
            trigger.need_alert = false;

            state_id = trigger.state_id;
            district_id = trigger.district_id;
            community_id = trigger.community_id;

            for (var c = 0; c < obj.length; c++) {
                activeAlerts = obj[c].activeAlerts;
                for (var d = 0; d < activeAlerts.length; d++) {
                    id = activeAlerts[d].regionId;

                    if (id === state_id || id === district_id || id === community_id) {
                        type = activeAlerts[d].type;

                        if (trigger[type]) {
                            trigger.need_alert = true;
                        }
                    }
                }
            }
            if (need_alert_old !== trigger.need_alert) {
                changeFiles(trigger);
            }
        }
    }
}

function trigger_alerts() {
    var users_massiv = Object.values(users);

    var date = new Date(Date.now());
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var diff = date.getTimezoneOffset() + 180;
    var time = (hours * 60 + minutes + diff + 60 * 24) % (60 * 24);

    var time_start = 0;
    var time_end = 0;

    var massiv1 = [];
    var massiv2 = [];

    for (var a = 0; a < users_massiv.length; a++) {
        var user = users_massiv[a];

        for (var b = 0; b < user.length; b++) {
            var trigger = user[b];

            massiv1 = trigger.time_start.split(':');
            massiv2 = trigger.time_end.split(':');
            time_start = parseInt(massiv1[0]) * 60 + parseInt(massiv1[1]);
            time_end = parseInt(massiv2[0]) * 60 + parseInt(massiv2[1]);

            if (trigger.need_alert && !trigger.started) {
                if (time >= time_start && time <= time_end) {
                    if(!trigger.start_attempts)trigger.start_attempts=0;
                    trigger.start_attempts++;
                    if(trigger.start_attempts < 4){
                        exec_hook(trigger.webhook_open, trigger).then(res => {
                            if (res.result) {
                                res.object.started = true;
                                res.object.start_attempts=0;
                                res.object.end_attempts=0;
                                changeFiles(res.object);
                            }
                        });
                    } else {
                        trigger.started = true;
                        changeFiles(trigger);
                    }
                } else {
                    trigger.started = true;
                    changeFiles(trigger);
                }
            }

            if (trigger.started && !trigger.need_alert) {
                if (time >= time_start && time <= time_end) {
                    if(!trigger.end_attempts)trigger.end_attempts=0;
                    trigger.end_attempts++;
                    if(trigger.end_attempts < 4){
                        exec_hook(trigger.webhook_close, trigger).then(res => {
                            if (res.result) {
                                res.object.started = false;
                                res.object.start_attempts=0;
                                res.object.end_attempts=0;
                                changeFiles(res.object);
                            }
                        });
                    } else {
                        trigger.started = false;
                        changeFiles(trigger);
                    }
                } else {
                    trigger.started = false;
                    changeFiles(trigger);
                }
            }
        }
    }
}

var lastActionIndex = 0;
var alertState = [];

async function checkAlerts(callback) {
    var id = await alert_request('status');
    if (id.lastActionIndex) {
        if (id.lastActionIndex !== lastActionIndex) {
            lastActionIndex = id.lastActionIndex;
            obj = await alert_request('');
            if (obj !== {}) {
                var areas='Alert state changed: ';                
                for(const a of obj){
                    areas += a.regionName + '; ';
                }
                alertState = obj;
                if (callback) callback();
            }
        }
    }
}

checkAlerts(onAlert);
trigger_alerts();

setInterval(async () => {
    checkAlerts(onAlert);
    onAlert();
    trigger_alerts();
}, 30000);

'sussy-374211'