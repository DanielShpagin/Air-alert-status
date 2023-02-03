document.querySelector('.share_button').addEventListener('click', event => {
    if (navigator.share) {
        navigator.share({
            title: 'Electricity info',
            url: window.location.href
        })
    }
});

function setCookie(name, data) {
    document.cookie = name + "=" + data;
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

function generateRandomKey() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;

    for ( var i = 0; i < 10; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

function checkData() {
    let id = getCookie('id');

    if (!id) {
        setCookie('id', generateRandomKey());
        id = getCookie('id');
    }

    fetch('/check_data', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    }).then(res => {
        res.text().then(txt => {
            getData();
        });
    });
}

function getData() {
    var id = getCookie('id');

    fetch('/get_data', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        })
    }).then(res => {
        res.text().then(txt => {
            var array = JSON.parse(txt);
            var data1 = array.length;
            var data2 = 0;
            
            var year = new Date(Date.now()).getFullYear();
            var date = new Date(Date.now()).getDate();
            
            for (var i = 0; i < array.length; i++) {
                if (array[i].date) {
                    var year1 = array[i].date.year;
                    var date1 = array[i].date.date;

                    if (data1[0] === '0') data1 = data1.substring(1);

                    if (year === year1 && date === date1) {
                        data2++;
                    }
                }
            }

            console.log(`Скільки користувачів зайшло на сайт: ${data1}, Скільки користувачів зайшло сьогодні: ${data2}`);
        });
    });
}

function createAlert(d1, d2, row, column, x, y, days) {
    for (var i = 0; i < document.querySelectorAll('.alert_plus').length; i++) {
        document.querySelectorAll('.alert_plus')[i].remove();
        i--;
    }

    for (var i = 0; i < document.querySelectorAll('.alert_negative').length; i++) {
        document.querySelectorAll('.alert_negative')[i].remove();
        i--;
    }

    var alert = document.createElement('div');

    if (d1 === '1') {
        alert.className = 'alert_plus';
    } else if (d1 === '2') alert.className = 'alert_negative';

    alert.style.top = y - 100;
    alert.style.left = x;

    var number1 = 0;
    var number2 = 0;

    var row1 = row;
    var row2 = row;

    for (var i = column; true; i++) {
        if (days[row1].data[i] === d1) {
            number1++;
        }

        if (days[row1].data[i] !== d1) {
            if (days[row1].data[i] !== '1' && days[row1].data[i] !== '2') {
                if (row1 !== 0) {
                    row1--;
                    i = -1;
                    continue;
                }
            }

            break;
        }
    }

    for (var i = column; true; i--) {
        if (days[row2].data[i] === d1) {
            number2++;
        }

        if (days[row2].data[i] !== d1) {
            if (days[row2].data[i] !== '1' && days[row2].data[i] !== '2') {
                row2++;
                i = days[row2].data.length;
                continue;
            }

            break;
        }
    }

    var number3 = number1 + number2 - 1;

    number3 *= 10;
    number3 /= 60;

    var number4 = number3 - Math.floor(number3);
    number4 *= 60;
    number4 = Math.floor(number4 + 0.5);

    var number5 = 0;

    for (var i = 0; i < days[row].data.length; i++) {
        if (days[row].data[i] === d1) {
            number5++;
        }
    }

    number5 *= 10;
    number5 /= 60;

    var number6 = number5 - Math.floor(number5);
    number6 *= 60;
    number6 = Math.floor(number6 + 0.5);

    if (d1 === '1') {
        var p1 = document.createElement('p');
        p1.innerHTML = `&#128161; ${Math.floor(number3)}:${number4}`;

        var p2 = document.createElement('p');
        p2.innerHTML = `&#128161; впродовж дня ${Math.floor(number5)}:${number6}`;

        alert.appendChild(p1);
        alert.appendChild(p2);
    }

    if (d1 === '2') {
        var p1 = document.createElement('p');
        p1.innerHTML = `<g>&#x26A0;</g> ${Math.floor(number3)}:${number4}`;

        var p2 = document.createElement('p');
        p2.innerHTML = `<g>&#x26A0;</g> впродовж дня ${Math.floor(number5)}:${number6}`;

        alert.appendChild(p1);
        alert.appendChild(p2);
    }

    document.querySelector('body').appendChild(alert);
}

function beginning() {
    var url_name = window.location.href.split('/')[4];

    fetch(`https://ua-alert.info/svitlo/now/${url_name}`).then(result => {
        result.text().then(txt => {
            if (txt === '1') {
                var lamp_icon = document.createElement('td');
                lamp_icon.innerHTML = '&#128161;';
                lamp_icon.className = 'lamp_icon';
                document.querySelector('.container .top').appendChild(lamp_icon);
            }

            if (txt === '2') {
                var alert_icon = document.createElement('td');
                alert_icon.innerHTML = '&#x26A0;';
                alert_icon.className = 'alert_icon';
                document.querySelector('.container .top').appendChild(alert_icon);
            }

            fetch(`https://ua-alert.info/svitlo/history/${url_name}`).then(result => {
                result.text().then(txt => {
                    var days = JSON.parse(txt);
                    days.reverse();

                    var data = [
                        '111100221111002211110022', 
                        '110022111100221111002211', 
                        '002211110022111100221111', 
                        '221111002211110022111100', 
                        '111100221111002211110022', 
                        '111100221111002211110022', 
                        '111100221111002211110022'
                    ];

                    var shift=4;
                    
                    const today = new Date(Date.now());
                    var cday = (today.getDay()+6)%7;

                    var hours = 24;
                    var num = 0;
                    var chour=today.getHours();

                    for (var i = 0; i < hours; i++) {
                        var time_hour = document.createElement('td');

                        if (num === 6) {
                            num = 0;
                            time_hour.className = 'time_hour_plus';
                        } else {
                            time_hour.className = 'time_hour';
                        }

                        time_hour.innerHTML = `${i}-${(i+1)%24}`;
                        if(i==chour){
                            time_hour.style.fontWeight="bold";
                            time_hour.style.border="2px solid black";
                            time_hour.style.backgroundColor='rgba(255,255,0,0.5)';
                        }

                        document.querySelector('table .top').appendChild(time_hour);
                        num++;
                    }
                    var months = {
                        1: 'січ.',
                        2: 'лют.',
                        3: 'бер.',
                        4: 'кві.',
                        5: 'тра.',
                        6: 'чер.',
                        7: 'лип.',
                        8: 'сер.',
                        9: 'вер.',
                        10: 'жов.',
                        11: 'лис.',
                        12: 'гру.'
                    }
                    var week=[
                        "понеділок",
                        "вівторок",
                        "середа",
                        "четвер",
                        "п'ятниця",
                        "субота",
                        "неділя"
                    ];

                    for (var i = -6; i < days.length; i++) {
                        var tr1 = document.createElement('tr');
                        var wday=(cday-i+days.length*7)%7;
                        var string = data[wday];
                        if(shift>0){
                            var s0=string;
                            string='';
                            for(var q=0;q<24;q++)string+=s0[(q+shift)%24];
                        }

                        var date = i >= 0 ? days[i].day.split(' ') : ['','',''];
                        var date_number = date[0];
                        var date_month = date[1];
                        var date_year = date[2];


                        var date_item = document.createElement('td');
                        date_item.className = 'date_item';
                        date_item.innerHTML = i>=0 ? `${date_number} ${months[date_month]}<br>${week[wday]}` : '';
                        if(i===0){
                            date_item.style.fontSize="120%";
                            date_item.style.fontWeight="bold";
                            date_item.style.backgroundColor='rgba(255,255,0,0.5)';
                            date_item.style.border = "2px solid black";
                        }
                        if(i<0){
                            var dt = new Date(Date.now()-i*24*60*60*1000);
                            date_item.innerHTML = `${dt.getDate()} ${months[dt.getMonth()+1]}<br>${week[wday]}`; 
                            date_item.style.opacity="50%";
                            date_item.style.backgroundColor="lightgrey";    

                        }
                        if(wday==0){
                            date_item.style.borderBottom = "4px solid black";
                            date_item.style.borderBottomStyle="double";
                        }

                        tr1.appendChild(date_item);

                        var num = 0;
                        var num1 = 0;
                        var num2 = 0;

                        for (var j = 0; j < 24; j++) {
                            var cell = document.createElement("td");
                            cell.className = 'td_plus';
                            cell.style.border = "1px solid black";
                            if(i==0){
                                cell.style.borderTop = cell.style.borderBottom = "2px solid black";
                            }
                            if(wday==0){
                                cell.style.borderBottom = "4px solid black";
                                cell.style.borderBottomStyle="double";
                            }
                            cell.style.padding ="0pt";
                            cell.style.margin ="0pt";
                            cell.style.position = "relative";
                            cell.style.height="30pt";
                            
                            for (var k = 0; k < 6; k++) {
                                var a=j*6+k;
                                var subCell = document.createElement("div");
                                subCell.style.display = "inline-block";
                                subCell.style.width = "calc(100% / 6)";
                                subCell.style.height = "100%";
                                subCell.style.margin="0pt";
                                subCell.innerHTML='&nbsp';
                                if(i>=-2 && a<days[i].data.length){
                                    var v = days[i].data[a];
                                    if(j&1){
                                        if(v === '2') {
                                            subCell.style.backgroundColor = "rgba(0,0,0,0.56)";
                                            subCell.className = 'td_plus_0';
                                        } else {
                                            subCell.style.backgroundColor = "rgba(255,240,0,0.56)";
                                            subCell.className = 'td_plus_1';
                                        }
                                    }else{
                                        if (v === '2') {
                                            subCell.style.backgroundColor = "rgba(0,0,0,0.48)";
                                            subCell.className = 'td_negative_0';
                                        } else {
                                            subCell.style.backgroundColor = "rgba(255,255,0,0.48)";
                                            subCell.className = 'td_negative_1';
                                        }
                                    }
                                    subCell.row = i;
                                    subCell.column = a;
                                    subCell.v = v;
                                    subCell.addEventListener('click', (event) => {
                                        let elem = event.target;
                                        let rect = elem.getBoundingClientRect();
    
                                        var x = rect.x;
                                        var y = rect.y;
                                        var v = elem.v;
                                        var v1 = v==='1' ? '2' : '1'; 
                                        createAlert(v, v1, elem.row, elem.column, x, y, days);
                                    });  
                                }                                
                                cell.appendChild(subCell);
                            }
                            var charX = document.createElement("div");
                            charX.innerHTML = "&nbsp";
                            charX.style.display = "inline-block";
                            charX.style.position = "absolute";
                            charX.style.top = "50%";
                            charX.style.left = "50%";
                            charX.style.transform = "translate(-50%, -55%)";
                            charX.style.fontSize = "16px";
                            charX.style.opacity="1%";
                            charX.style.color = "white";
                            charX.style["pointer-events"] = "none";
                            charX.innerHTML = '❓'
                            if(i<=0){
                                if(j==chour){
                                    cell.style.borderLeft = cell.style.borderRight = "2px solid black";
                                }
                            }
                            if(i<0){
                                if (string[j] === '2') {
                                    cell.className = "crossedfw";
                                }
                                if (string[j] === '1') charX.style.opacity="40%";                                
                            }else
                            if (i < 1 && string && string.length) {                                
                                if (string[j] === '2') {
                                    cell.className = "crossed";
                                }
                                if (string[j] === '1') charX.style.opacity="80%";
                            }       
                                                
                            cell.appendChild(charX);
                            tr1.appendChild(cell);
                        }


                        document.querySelector('.table table tbody').appendChild(tr1);
                    }

                    document.querySelector('html').style.width = document.querySelector('.table').offsetWidth;
                    document.querySelector('html').style.height = document.querySelector('.table').offsetHeight + document.querySelector('.top_container').offsetHeight;
                });
            });
        });
    });
}

beginning();

setInterval(() => {
    document.querySelector('.table table tbody').innerHTML = '';
    var top = document.createElement('tr');
    top.className = 'top';
    document.querySelector('.table table tbody').appendChild(top);

    beginning();
}, 5 * 60 * 1000);

setInterval(() => {
    checkData();
}, 5*60*1000);

document.querySelector('.container').addEventListener('click', (event) => {
    if (event.srcElement.className !== 'td_plus_0' && event.srcElement.className !== 'td_plus_1' && event.srcElement.className !== 'td_negative_0' && event.srcElement.className !== 'td_negative_1') {
        for (var b = 0; b < document.querySelectorAll('.alert_plus').length; b++) {
            document.querySelectorAll('.alert_plus')[b].remove();
        }

        for (var b = 0; b < document.querySelectorAll('.alert_negative').length; b++) {
            document.querySelectorAll('.alert_negative')[b].remove();
        }
    }
});

checkData();