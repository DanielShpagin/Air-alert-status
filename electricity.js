import fetch from 'node-fetch';
import crypto from 'crypto';
import fs from 'fs';

const APP_ID = 'YzfeftUVcZ6twZw1OoVKPRFYTrGEg01Q';
const APP_SECRET = '4G91qSoboqYO4Y0XJ0LPPKIsq8reHdfa';
var verboseLogin=true;

 class ElectroUserInfo{
    constructor(){
        this.email="";
        this.password="";
        this.id=0;
        this.token=0;
        this.name='';
        this.region='eu';
        this.data=[];
        this.online=false;
    }
    async checkElectricity(){
        var res = await this.ewGetDevice(this.id,this.token,this.region);
        if(res && 'online' in res)return res.online;
        return false;
    }
    baseUrl() {
        return `https://${this.region}-api.coolkit.cc:8080/api/user`;
    }

    oldAuth(object) {
        return object && 'error' in object && object.error === 406;
    }

    async tryfn(fn) {
        let object = null;
        try {
            object = await fn();
        } catch (error) {
            console.log(error);
        }
        return this.oldAuth(object) ? null : object; 
    }

    async tryEw(fn) {
        let obj = await this.tryfn(fn);
        if (!obj) {
            if (verboseLogin)console.log('Pass1. Failed with token', this.token);            
            this.token = null;
            if (await this.ewLogin()) {
                if (verboseLogin)console.log('Pass2. Logged, got token', this.token);
                return await this.tryfn(fn);
            }
        }
        return obj;
    }

    async ewLogin() {
        if (!this.token) {
            if (this.email.length && this.password.length && this.region.length) {
                const data = JSON.stringify({ appid: APP_ID, email : this.email, password : this.password, ts: Math.floor(Date.now() / 1000), version: 8 });

                var body = {
                    appid: APP_ID,
                    email : this.email,
                    nonce: '21fpoiq',
                    password: this.password,
                    phoneNumber: null,
                    ts: Math.floor(Date.now() / 1000),
                    version: 8,
                  };

                const makeAuthorizationSign = (APP_SECRET, body) => crypto
                    .createHmac('sha256', APP_SECRET)
                    .update(JSON.stringify(body))
                    .digest('base64');
                const loginData = {
                    method: 'post',
                    headers: {
                    Authorization: `Sign ${makeAuthorizationSign(APP_SECRET, body)}`,
                    },
                    body: JSON.stringify(body),
                };

                const uri = this.baseUrl() + '/login';

                const request = await fetch(uri, loginData);
                const result = await request.json();
                if ('at' in result) {
                    console.log('Login to eWeLink successful.');
                    this.token = result.at;
                }
                return true;
            } else {
                console.error('Login to eWeLink failed.');
            }
        }else return true;
        return false;
    }

    async ewGetDevice(device) {
        if (await this.ewLogin()) {
            const uri = `${this.baseUrl()}/device/${device}?deviceid=${device}&version=8`;
            console.log(this.token);
            const object = await this.tryEw(
                async () => {
                    const request = await (await fetch(uri, { headers: { Authorization: `Bearer ${this.token}` } }));
                    const result = await request.json();
                    return result;
                }
                );
            if (object) {
                console.log('online', object.online);
                return object;
            }else console.log('Failed to get object');
        }else{
            console.log('Failed to login');
        }
        return null;
    }
    read(filename){
        try{
            var res=fs.readFileSync(filename);
            if(res){
                var obj=JSON.parse(res);
                this.email=obj.email;
                this.password=obj.password;
                this.name=obj.name;
                this.id=obj.id;
                if(obj.data)this.data=obj.data;
                if(obj.state)this.state=obj.state;
                else{
                    if(obj.data && obj.data.length){
                        var last=obj.data[obj.data.length-1];
                        if(last.data.length){
                            var char=last.data[last.data.length-1];
                            this.state = char=='1';
                        }
                    }
                }
                for(var i=0;i<this.data.length;i++){
                    var day=this.data[i];
                    for(var j=2;j<day.data.length - 2;j++){
                        if(day.data[j] == '2' && day.data[j - 2] == '1' && day.data[j + 2] == '1')day.data[j] = '1';
                    }
                }
            }
        }catch(error){
            console.log(error);
        }
    }
    async write(){
        var obj={
            email:this.email,
            password:this.password,
            id:this.id,
            name:this.name,
            state:this.state,
            data:this.data
        };
        fs.writeFile('electricity_users/'+this.name+'.json',JSON.stringify(obj,null, ' '),()=>{});
    }
    calcTime(offset_hours) {
        var d = new Date();
        var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
        var nd = new Date(utc + (3600000*offset_hours));
        return nd;
    }
    async update(){
        var cur =  this.calcTime(3);
        cur.setL
        var day = cur.getDate();
        var month = cur.getMonth()+1;
        var year = cur.getFullYear();
        var offs=cur.getHours()*6+Math.floor(cur.getMinutes()/10);
        var str = `${day} ${month} ${year}`;
        var cday=null;
        this.data.forEach(e=>{
            if(e.day==str){
                cday=e;
            }
        });
        if(!cday){
            cday={day:str,data:''};
            this.data.push(cday);
        }
        var char='1';
        if(cday.data.length)char=cday.data[cday.data.length-1];
        if(offs>cday.data.length)cday.data+=char.repeat(offs-cday.data.length);
        else cday.data=cday.data.substring(0,offs);
        this.state=await this.checkElectricity();
        for(var i=0;i<3;i++) {
            if(!this.state)this.state=await this.checkElectricity();
        }
        cday.data += this.state ? '1':'2';
        console.log(str, offs, cday.data);
        this.write();
    }
 }

var users = [];

var filenames = fs.readdirSync('electricity_users/');
  
filenames.forEach(file => {
    var e=new ElectroUserInfo();
    e.read('electricity_users/' + file);
    users.push(e);
});

setInterval(()=>{
    users.forEach(el=>{
        el.update();
    });
},60*5*1000);

function findDomain(domain){
    return users.find(el => el.name == domain);
}

export function currentElectricityState(domain){
    var dom=findDomain(domain);
    if(dom){
        return dom.state;
    }
    return false;
}

export function getElectricityHistory(domain){
    var dom=findDomain(domain);
    if(dom){
        return dom.data;
    }
    return null;
}

export function getElectricityHistoryToday(domain){
    var dom=findDomain(domain);
    if(dom && dom.data.length){
        return dom.data[dom.data.length-1];
    }
    return null;
}
//module.exports={currentElectricityState,getElectricityHistory,getElectricityHistoryToday};