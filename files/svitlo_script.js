var url_name = window.location.href.split('/')[4];

document.querySelector('.share_button').addEventListener('click', event => {
    if (navigator.share) {
        navigator.share({
            title: 'Electricity info', 
            url: window.location.href
        }).then(() => {
            console.log('Thanks for sharing!');
        })
            .catch(console.error);
    } else {
        // fallback
    }
});

function data(d1, d2, row, column, x, y, days) {
    for (var i = 0; i < document.querySelectorAll('.alert_plus').length; i++) {
        document.querySelectorAll('.alert_plus')[i].remove();
        i--;
    }

    for (var i = 0; i < document.querySelectorAll('.alert_negative').length; i++) {
        document.querySelectorAll('.alert_negative')[i].remove();
        i++;
    }

    var alert = document.createElement('div');

    if (d1 === '1') {
        alert.className = 'alert_plus';
    } else if (d1 === '2') alert.className = 'alert_negative';

    alert.style.top = y-100;
    alert.style.left = x;

    var number1 = 0;
    var number2 = 0;

    var row1 = row;
    var row2 = row;

    function forward() {
        for (var i = 0; i < days[row1].data.length; i++) {
            if (days[row1].data[i] === d1) {
                number1++;
            }

            if (days[row1].data[i] !== d1) {
                if (days[row1].data[i] !== d1 && days[row1].data[i] !== d2) {
                    row1++;
                    i=0;
                    continue;
                }

                break;
            }
        }
    }

    function back() {
        console.log(days, row2);
        for (var i = days[row2].data.length-1; true; i--) {
            if (days[row2].data[i] === d1) {
                number2++;
            }

            if (days[row2].data[i] !== d1) {
                if (days[row2-1]) {
                    if (i === 0) {
                        row2--;
                        i=days[row2].data.length-1;
                        continue;
                    }
                }
                break;
            }
        }
    }

    for (var i = column; true; i++) {
        if (days[row1].data[i] === d1) {
            number1++;
        }

        console.log(days[row1].data[i]);

        if (days[row1].data[i] !== d1) {
            if (days[row1].data[i] !== '1' && days[row1].data[i] !== '2') {
                if (row1 !== 0) {
                    row1--;
                    i=0;
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
                i=days[row2].data.length-1;
                continue;
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

    for (var i = 0; i < days[row].data.length; i++) {
        if (days[row].data[i] === d1) {
            number5++;
        }
    }

    number5*=10;
    number5/=60;

    var number6 = number5-Math.floor(number5);
    number6*=60;
    number6=Math.floor(number6+0.5);

    if (d1 === '1') {
        var p1 = document.createElement('p');
        p1.innerHTML = `&#128161;: ${Math.floor(number3)} год. ${number4} хв.`;

        var p2 = document.createElement('p');
        p2.innerHTML = `&#128161;: впродовж дня: ${Math.floor(number5)} год. ${number6} хв.`;

        alert.appendChild(p1);
        alert.appendChild(p2);
    }

    if (d1 === '2') {
        var p1 = document.createElement('p');
        p1.innerHTML = `<g>&#x26A0;</g>: ${Math.floor(number3)} год. ${number4} хв.`;

        var p2 = document.createElement('p');
        p2.innerHTML = `<g>&#x26A0;</g>: впродовж дня: ${Math.floor(number5)} год. ${number6} хв.`;

        alert.appendChild(p1);
        alert.appendChild(p2);
    }

    document.querySelector('body').appendChild(alert);
}

function beginning() {
    fetch(`https://ua-alert.info/svitlo/now/${url_name}`).then(result => {
        result.text().then(txt => {
            console.log(txt, url_name);

            /*if (txt === '1') {
                console.log(txt);
                var lamp_icon = document.createElement('td');
                lamp_icon.innerHTML = '&#128161;';
                lamp_icon.className = 'lamp_icon';
                document.querySelector('.container .top').appendChild(lamp_icon);
            }*/

            if (txt === '1') {
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
                                    td2.row = i;
                                    td2.column = a;
                                    td2.className = 'td_plus';
                                    td2.addEventListener('click', (event) => {
                                        let elem = event.target;
                                        let rect = elem.getBoundingClientRect();

                                        var x = rect.x;
                                        var y = rect.y;

                                        data('1', '2', elem.row, elem.column, x, y, days);
                                    });
                                }

                                if (days[i].data[a] === '2') {
                                    td2.row = i;
                                    td2.column = a;
                                    td2.className = 'td_negative';
                                    td2.addEventListener('click', (event) => {
                                        let elem = event.target;
                                        let rect = elem.getBoundingClientRect();

                                        var x = rect.x;
                                        var y = rect.y;

                                        data('2', '1', elem.row, elem.column, x, y, days);
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