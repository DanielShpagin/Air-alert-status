var url_name = window.location.href.split('/')[4];

function beginning() {
    fetch(`https://ua-alert.info/svitlo/now/${url_name}`).then(result => {
        result.text().then(txt => {
            console.log(txt, url_name);

            if (txt === '1') {
                console.log(txt);
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
                    console.log(JSON.parse(txt));

                    var days = JSON.parse(txt);

                    days.reverse();

                    var hours = 24;
                    var num = 0;

                    for (var i = 0; i < hours; i++) {
                        var time_hour = document.createElement('td');
                        if (num === 6) {
                            num = 0;
                            time_hour.className = 'time_hour_plus';
                        } else {
                            time_hour.className = 'time_hour';
                        }
                        time_hour.innerHTML = `${i}:00`;

                        document.querySelector('table .top').appendChild(time_hour);
                        num++;
                    }

                    for (var i = 0; i < days.length; i++) {
                        var tr1 = document.createElement('tr');

                        var date = days[i].day.split(' ');
                        var date_number = date[0];
                        var date_month = date[1];
                        var date_year = date[2];

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

                        if (i === 0) {
                            var date_item = document.createElement('td');
                            date_item.className = 'your_date_item';
                            date_item.innerHTML = `${date_number} ${months[date_month]}`;
                            tr1.appendChild(date_item);
                        } else {
                            var date_item = document.createElement('td');
                            date_item.className = 'date_item';
                            date_item.innerHTML = `${date_number} ${months[date_month]}`;
                            tr1.appendChild(date_item);
                        }

                        var num = 0;

                        for (var a = 0; a < 6 * 24; a++) {
                            if (!num) {
                                var td1 = document.createElement('td');
                                var inner_table = document.createElement('table');
                                inner_table.className = 'inner_table';

                                var tr2 = document.createElement('tr');
                            }

                            var td2 = document.createElement('td');

                            if (days[i].data[a]) {
                                if (days[i].data[a] === '1') {
                                    var number1 = 0;
                                    var number2 = 0;

                                    for (var b = 0; b < days[i].data.length; b++) {
                                        if (b === a) {
                                            for (var c = 0; c < days[i].data.length; c++) {
                                                if (days[i].data[c] === '1') {
                                                    number1++;
                                                    if (c === b) {
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    number1*=10;
                                    number1/=60;

                                    for (var b = 0; b < days[i].data.length; b++) {
                                        if (days[i].data[b] === '1') {
                                            number2++;
                                        }
                                    }

                                    number2*=10;
                                    number2/=60;

                                    var number3 = number1-Math.floor(number1);
                                    console.log(number3);
                                    number3*=60;
                                    number3=Math.floor(number3+0.5);

                                    var number4 = number2-Math.floor(number2);
                                    number4*=60;
                                    number4=Math.floor(number4+0.5);

                                    td2.text1 = `&#128161; на протязі: ${number1.toFixed(0)} год. ${number3} хв.`;
                                    td2.text2 = `&#128161; за день: ${number2.toFixed(0)} год. ${number4} хв.`;
                                    td2.className = 'td_plus';
                                    td2.addEventListener('click', (event) => {
                                        for (var b = 0; b < document.querySelectorAll('.alert_plus').length; b++) {
                                            document.querySelectorAll('.alert_plus')[b].remove();
                                        }

                                        for (var b = 0; b < document.querySelectorAll('.alert_negative').length; b++) {
                                            document.querySelectorAll('.alert_negative')[b].remove();
                                        }

                                        let elem = event.target;
                                        let rect = elem.getBoundingClientRect();

                                        var x = rect.x;
                                        var y = rect.y;

                                        var alert = document.createElement('div');
                                        alert.className = 'alert_plus';
                                        alert.style.top = y-100;
                                        alert.style.left = x;

                                        var p1 = document.createElement('p');
                                        p1.innerHTML = event.target.text1;

                                        var p2 = document.createElement('p');
                                        p2.innerHTML = event.target.text2;

                                        alert.appendChild(p1);
                                        alert.appendChild(p2);

                                        document.querySelector('body').appendChild(alert);
                                    });
                                }
                                if (days[i].data[a] === '2') {
                                    var number1 = 0;
                                    var number2 = 0;

                                    for (var b = 0; b < days[i].data.length; b++) {
                                        if (b === a) {
                                            for (var c = 0; c < days[i].data.length; c++) {
                                                if (days[i].data[c] === '2') {
                                                    number1++;
                                                    if (c === b) {
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    number1*=10;
                                    number1/=60;

                                    for (var b = 0; b < days[i].data.length; b++) {
                                        if (days[i].data[b] === '2') {
                                            number2++;
                                        }
                                    }

                                    number2*=10;
                                    number2/=60;

                                    td2.text1 = `&#x26A0; на протязі: ${number1.toFixed(1)} год.`;
                                    td2.text2 = `&#x26A0; за день: ${number2.toFixed(1)} год.`;
                                    td2.className = 'td_negative';
                                    td2.addEventListener('click', (event) => {
                                        for (var b = 0; b < document.querySelectorAll('.alert_plus').length; b++) {
                                            document.querySelectorAll('.alert_plus')[b].remove();
                                        }

                                        for (var b = 0; b < document.querySelectorAll('.alert_negative').length; b++) {
                                            document.querySelectorAll('.alert_negative')[b].remove();
                                        }

                                        let elem = event.target;
                                        let rect = elem.getBoundingClientRect();

                                        var x = rect.x;
                                        var y = rect.y;

                                        var alert = document.createElement('div');
                                        alert.className = 'alert_negative';
                                        alert.style.top = y-100;
                                        alert.style.left = x;

                                        var p1 = document.createElement('p');
                                        p1.innerHTML = event.target.text1;

                                        var p2 = document.createElement('p');
                                        p2.innerHTML = event.target.text2;

                                        alert.appendChild(p1);
                                        alert.appendChild(p2);

                                        document.querySelector('body').appendChild(alert);
                                    });
                                }
                            } else {
                                td2.className = 'td_margin';
                            }

                            tr2.appendChild(td2);

                            num++;

                            if (num === 6) {
                                num = 0;
                                inner_table.appendChild(tr2);
                                td1.appendChild(inner_table);
                                tr1.appendChild(td1);
                            }
                        }

                        document.querySelector('.table table tbody').appendChild(tr1);
                    }
                });
            });
        });
    });
}

beginning();

setInterval(() => {
    document.querySelector('.table table tdoy').innerHTML = '';
    var top = document.createElement('tr');
    top.className = 'top';
    document.querySelector('.table table tbody').appendChild(top);

    beginning();
}, 25*60*1000);

document.querySelector('.container').addEventListener('click', (event) => {
    if (event.srcElement.className !== 'td_plus' && event.srcElement.className !== 'td_negative') {
        for (var b = 0; b < document.querySelectorAll('.alert_plus').length; b++) {
            document.querySelectorAll('.alert_plus')[b].remove();
        }
    
        for (var b = 0; b < document.querySelectorAll('.alert_negative').length; b++) {
            document.querySelectorAll('.alert_negative')[b].remove();
        }
    }
    console.log(event.currentTarget, event.srcElement);
});