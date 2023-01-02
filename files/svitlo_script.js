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
                                    /*var number1 = 0;
                                    var number2 = 0;

                                    var num1 = 0;
                                    var b1 = a;

                                    while (true) {
                                        if (days[i].data[b1-1] === '2' || b1 === 0) {
                                            num1=b1;
                                            break;
                                        }

                                        b1--;
                                    }

                                    var num2 = 0;

                                    for (var b = num1; b < days[i].data.length; b++) {
                                        if (days[i].data[b+1] === '2' || !days[i].data[b+1]) {
                                            num2=b;
                                            break;
                                        }
                                    }*/

                                    //console.log(num1, num2);

                                    //var num3 = num2-num1;

                                    /*for (var b = 0; b < days[i].data.length; b++) {
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
                                    }*/

                                    /*console.log(num3, num1, num2);

                                    number1 = num3;
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
                                    number3*=60;
                                    number3=Math.floor(number3+0.5);

                                    var number4 = number2-Math.floor(number2);
                                    number4*=60;
                                    number4=Math.floor(number4+0.5);

                                    td2.text1 = `&#128161; на протязі: ${number1.toFixed(0)} год. ${number3} хв.`;
                                    td2.text2 = `&#128161; за день: ${number2.toFixed(0)} год. ${number4} хв.`;*/
                                    td2.column = i;
                                    td2.row = a;
                                    td2.className = 'td_plus';
                                    td2.addEventListener('click', (event) => {
                                        for (var i = 0; i < document.querySelectorAll('.alert_plus').length; i++) {
                                            document.querySelectorAll('.alert_plus')[i].remove();
                                        }

                                        for (var i = 0; i < document.querySelectorAll('.alert_negative').length; i++) {
                                            document.querySelectorAll('.alert_negative')[i].remove();
                                        }

                                        let elem = event.target;
                                        let rect = elem.getBoundingClientRect();

                                        var x = rect.x;
                                        var y = rect.y;

                                        var alert = document.createElement('div');
                                        alert.className = 'alert_plus';
                                        alert.style.top = y-100;
                                        alert.style.left = x;

                                        var number1 = 0;
                                        var number2 = 0;

                                        var column = event.target.column;
                                        var row = event.target.row;

                                        var column1 = column;
                                        var column2 = column;

                                        function forward(column) {
                                            for (var i = 0; i < days[column].data.length; i++) {
                                                if (days[column].data[i] === '1') {
                                                    number1++;
                                                }

                                                if (days[column].data[i] !== '1') {
                                                    if (i === days[column].data.length) {
                                                        column1++;
                                                        i = 0;
                                                        continue;
                                                    }
                                                    break;
                                                }
                                            }
                                        }

                                        function back(column) {
                                            console.log(days, column);
                                            for (var i = days[column].data.length-1; true; i--) {
                                                if (days[column].data[i] === '1') {
                                                    number2++;
                                                }

                                                if (days[column].data[i] !== '1') {
                                                    if (days[column-1]) {
                                                        if (i === 0) {
                                                            column2--;
                                                            i=24*6;
                                                            continue;
                                                            //back(column2);
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }

                                        for (var i = row; true; i++) {
                                            if (days[column].data[i] === '1') {
                                                number1++;
                                            }

                                            console.log(days[column].data[i]);

                                            if (days[column].data[i] !== '1') {
                                                if (days[column+1]) {
                                                    if (i === days[column].data.length) {
                                                        column1++;
                                                        forward(column1);
                                                    }
                                                }
                                                break;
                                            }
                                        }

                                        for (var i = row; true; i--) {  
                                            if (days[column].data[i] === '1') {
                                                number2++;
                                            }

                                            if (days[column].data[i] !== '1') {
                                                if (days[column-1]) {
                                                    if (days[column].data[i] !== '2') {
                                                        column2--;
                                                        back(column2);
                                                    }
                                                }
                                                break;
                                            }
                                        }

                                        var number3 = number1+number2-1;

                                        number3*=10;
                                        number3/=60;

                                        var number4 = number3-Math.floor(number3);
                                        number4*=60;
                                        number4=Math.floor(number4+0.5);

                                        var number5 = 0;

                                        for (var i = 0; i < days[column].data.length; i++) {
                                            if (days[column].data[i] === '1') {
                                                number5++;
                                            }
                                        }
    
                                        number5*=10;
                                        number5/=60;

                                        var number6 = number5-Math.floor(number5);
                                        number6*=60;
                                        number6=Math.floor(number6+0.5);

                                        var p1 = document.createElement('p');
                                        p1.innerHTML = `&#128161; протягом: ${Math.floor(number3)} год. ${number4} хв.`;

                                        var p2 = document.createElement('p');
                                        p2.innerHTML = `&#128161; протягом дня: ${Math.floor(number5)} год. ${number6} хв.`;

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

                                    var number3 = number1-Math.floor(number1);
                                    number3*=60;
                                    number3=Math.floor(number3+0.5);

                                    var number4 = number2-Math.floor(number2);
                                    number4*=60;
                                    number4=Math.floor(number4+0.5);

                                    td2.column = i;
                                    td2.row = a;
                                    td2.className = 'td_negative';
                                    td2.addEventListener('click', (event) => {
                                        for (var i = 0; i < document.querySelectorAll('.alert_plus').length; i++) {
                                            document.querySelectorAll('.alert_plus')[i].remove();
                                        }

                                        for (var i = 0; i < document.querySelectorAll('.alert_negative').length; i++) {
                                            document.querySelectorAll('.alert_negative')[i].remove();
                                        }

                                        let elem = event.target;
                                        let rect = elem.getBoundingClientRect();

                                        var x = rect.x;
                                        var y = rect.y;

                                        var alert = document.createElement('div');
                                        alert.className = 'alert_negative';
                                        alert.style.top = y-100;
                                        alert.style.left = x;

                                        var number1 = 0;
                                        var number2 = 0;

                                        var column = event.target.column;
                                        var row = event.target.row;

                                        var num1 = 0;
                                        var num2 = 0;

                                        for (var i = row; i < days[column].data.length; i++) {
                                            if (days[column].data[i] === '2') {
                                                number1++;
                                            }

                                            if (days[column].data[i] !== '2') {
                                                break;
                                            }
                                        }

                                        for (var i = row; i < days[column].data.length; i--) {
                                            if (days[column].data[i] === '2') {
                                                number2++;
                                            }

                                            if (days[column].data[i] !== '2') {
                                                break;
                                            }
                                        }

                                        var number3 = number1+number2-1;

                                        number3*=10;
                                        number3/=60;

                                        var number4 = number3-Math.floor(number3);
                                        number4*=60;
                                        number4=Math.floor(number4+0.5);

                                        var number5 = 0;

                                        for (var i = 0; i < days[column].data.length; i++) {
                                            if (days[column].data[i] === '2') {
                                                number5++;
                                            }
                                        }
    
                                        number5*=10;
                                        number5/=60;

                                        var number6 = number5-Math.floor(number5);
                                        number6*=60;
                                        number6=Math.floor(number6+0.5);

                                        var p1 = document.createElement('p');
                                        p1.innerHTML = `&#x26A0; протягом: ${Math.floor(number3)} год. ${number4} хв.`;

                                        var p2 = document.createElement('p');
                                        p2.innerHTML = `&#x26A0; протягом дня: ${Math.floor(number5)} год. ${number6} хв.`;

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
    document.querySelector('.table table tbody').innerHTML = '';
    var top = document.createElement('tr');
    top.className = 'top';
    document.querySelector('.table table tbody').appendChild(top);

    beginning();
}, 5*60*1000);

document.querySelector('.container').addEventListener('click', (event) => {
    if (event.srcElement.className !== 'td_plus' && event.srcElement.className !== 'td_negative') {
        for (var b = 0; b < document.querySelectorAll('.alert_plus').length; b++) {
            document.querySelectorAll('.alert_plus')[b].remove();
        }
    
        for (var b = 0; b < document.querySelectorAll('.alert_negative').length; b++) {
            document.querySelectorAll('.alert_negative')[b].remove();
        }
    }
});