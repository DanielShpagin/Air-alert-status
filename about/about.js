var about_elements = [
    {
        element_type: 'h2',
        element_style: '',
        element_id: '',
        element_text: `Про автора`
    },
    {
        element_type: 'p',
        element_style: '',
        element_id: '',
        element_text: `Автор цього проекту - Данило Шпагін (<a href = "mailto:danielshpagin@gmail.com">danielshpagin@gmail.com</a>). Я вчуся в сьомому класі, мені
        дванадцять років, у мене діабет 1 типу. Мені подобається програмування та
        математика, я вчу мову програмування JavaScript. Це не перший мій проект, у
        мене є декілька цікавих проектів на моїй сторінці в GitHub:
        <span class="c6">
            <a href="https://www.google.com/url?q=https://github.com/DanielShpagin&amp;sa=D&amp;source=editors&amp;ust=1660234188114983&amp;usg=AOvVaw1rOg4FkXKCHf1wjxW9VGjI">https://github.com/DanielShpagin</a>
        </span>.`
    },
    {
        element_type: 'p',
        element_style: '',
        element_id: '',
        element_text: `Цей проект, зроблений для підтримки України, тому приєднуйтесь до допомоги нашій армії: `
    },
    {
        element_type: 'a',
        element_style: '',
        element_id: 'img',
        element_text: `<span
    style="overflow: hidden; display: inline-block; margin: 0.00px 0.00px; border: 0.00px solid #000000; width: 100%; height: 100%;">
    <img alt="" src="/files/images/1280X720_Army.png" width="100%" height="100%" title=""></span>`
    },
    {
        element_type: 'p',
        element_style: 'align-self: start;',
        element_id: '',
        element_text: `Якщо хочете підтримати мене особисто - ось моя картка monobank:`
    },
    {
        element_type: 'p',
        element_style: 'align-self: start; transform: translate(0px, -15px);',
        element_id: '',
        element_text: `5375 4115 9079 7879`
    }
];

var element = null;

document.querySelector('.about_elements').innerHTML = '';

for (var i = 0; i < about_elements.length; i++) {
    element = about_elements[i];

    var item = document.createElement(element.element_type);

    item.id = element.element_id;
    item.style = element.element_style;
    item.innerHTML = element.element_text;

    if (item.id === 'img') {
        item.href = 'https://bank.gov.ua/ua/news/all/natsionalniy-bank-vidkriv-spetsrahunok-dlya-zboru-koshtiv-na-potrebi-armiyi';
    }

    document.querySelector('.about_elements').appendChild(item);
}

document.querySelector('.back_button').addEventListener('click', (event) => {
    history.back();
});