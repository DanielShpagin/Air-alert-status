import express from 'express';
import bodyParser from 'body-parser';
import fetch from "node-fetch";
import fs from 'fs'
import path from 'path';
import crypto from 'crypto';

const __dirname = path.resolve();

const app = express();
const port = 4000;

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

async function generateKeys() {
    if (!fs.existsSync('./keys/')) {
        fs.mkdirSync('./keys/');

        var number = 10;
        var key = null;
        var body = null;

        for (var i = 0; i < number; i++) {
            key = crypto.randomBytes(10).toString('hex');
            body = {
                "key": key, 
                "name": ""
            }

            fs.writeFileSync(`./keys/${key}.json`, JSON.stringify(body, null, 2));
        }
    }
}

async function getKeys() {
    fs.readdirSync('./keys/').forEach(file => {
        const data = JSON.parse(fs.readFileSync(`./keys/${file}`, 'utf8'));

        if (data) keys.push(data);
    });
}

async function changeFiles(trigger) {
    fs.writeFile(`./users/${trigger['id']}/${trigger.triggerID}.json`, JSON.stringify(trigger, null, 2), err => {
        if (err) throw err;
    });
}

var users = {};
var obj = {};
var alerts = [];

var keys = [];

readFiles();
generateKeys();
getKeys();

app.use(bodyParser.json());

app.get('/delete/*', (req, res) => {
    var massiv = req.path.split('/');

    var key = massiv[2];
    var id = massiv[3];

    if(fs.existsSync(`./users/${key}/${id}.json`)) fs.unlinkSync(`./users/${key}/${id}.json`);

    console.log('delete');

    for (var i = 0; i < users[key].length; i++) {
        if (users[key][i].triggerID === id) {
            users[key].splice(i, 1);
        }
    }

    console.log(users, 'delete');
});

app.get('/triggers/*', (req, res) => {
    var id = req.path.substring(10);
    var r = {};
    if (users[id]) r = users[id];
    res.send(JSON.stringify(r, null, 2));
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/files/index.html');
});

app.post('/data', (req, res) => {
    var body = req.body;
    var key = body.id;
    var triggerID = body.triggerID;

    var num = 0;

    if (body.id) {
        for (var a = 0; a < keys.length; a++) {
            if (keys[a].key === key) {
                if (!users[key]) users[key] = [];

                for (var b = 0; b < users[key].length; b++) {
                    if (users[key][b].triggerID === body.triggerID) {
                        users[key][b] = body;

                        num++;
                    }
                }

                if (num === 0) {
                    var a = users[key];
                    a.push(body);
                }

                try {
                    if (!fs.existsSync(`./users/${key}`)) {
                        fs.mkdirSync(`./users/${key}`);
                    }
                } catch (err) {
                    console.error(err);
                }

                fs.writeFileSync(`./users/${key}/${triggerID}.json`, JSON.stringify(body, null, 2));

                break;
            }
        }
    } else {
        res.send('reject');
    }

    res.send('sucess');
});


app.use(express.static('files'));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

var apikey = '';
apikey = fs.readFileSync('key.txt').toString('utf8').substring(0,41);

if (apikey.length == 0) {
    console.error('You need to get the correct access key from the https://api.ukrainealarm.com and put into the key.txt');
    //abort();
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
        console.log('Error:', err);
        return {};
    }
}

// execure the webhook, returns true if succesful
async function exec_hook(uri) {
    try {
        var res = await fetch(uri);
        var txt = await res.text();
        if (txt.length) {
            var obj = JSON.parse(txt);
            if (obj.error) return obj.error === 0;
            return true;
        }
    } catch (err) {
        console.log(err);
    }

    return false;
}

// returns true if both webhooks are correct
async function test_hooks(uri_start, uri_end) {
    if (uri_start.length === 0) return false;
    var res1 = await exec_hook(uri_start);
    if (!res1) return false;

    await new Promise(r => setTimeout(r, 2000));

    if (uri_end.length) {
        var res2 = await exec_hook(uri_end);
        if (!res2) return false;
    }
    return true;
}

// this function called each time when alert state changes

async function onAlert(alertState) {
    var obj = alertState;

    var users_massiv = Object.values(users);

    var user = null;
    var trigger = null;

    var state_id= null;
    var district_id = null;
    var community_id = null;

    var activeAlerts = null;
    var type = null;

    var id = 0;

    for (var a = 0; a < users_massiv.length; a++) {
        user = users_massiv[a];

        for (var b = 0; b < user.length; b++) {
            trigger = user[b];

            trigger.need_alert = false;

            changeFiles(trigger);

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

                            changeFiles(trigger);
                        }
                    }
                }
            }
        }
    }
}

function trigger_alerts() {
    var users_massiv = Object.values(users);

    for (var a = 0; a < users_massiv.length; a++) {
        var user = users_massiv[a];

        for (var b = 0; b < user.length; b++) {
            var trigger = user[b];

            if (trigger.need_alert && !trigger.started) {
                console.log('attempt to open');
                exec_hook(trigger.webhock_open).then(res => {
                    if (res) {
                        trigger.started = true;
                        changeFiles(trigger);
                    }
                });
            }
            
            if (!trigger.need_alert && trigger.started) {
                console.log('attempt to close');
                exec_hook(trigger.webhock_close).then(res => {
                    if (res) {
                        trigger.started = false;
                        changeFiles(trigger);
                    }
                });
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
                console.log(obj);
                alertState = obj;
                if (callback) callback(alertState);
            }
        }
    }
}

checkAlerts(onAlert);
trigger_alerts();

setInterval(async () => {
    checkAlerts(onAlert);
    trigger_alerts();
}, 30000);