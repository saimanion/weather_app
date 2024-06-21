import conditions from "./conditions.js";

const apiKey = 'bbd24fa3c8714e21bbe160000241406';

// Элементы на странице
const form = document.querySelector('#form');
const input = document.querySelector('#inputCity');
const header = document.querySelector('.header');

function removeCard() {
    const prevCard = document.querySelector('.card');
    if (prevCard) prevCard.remove();
}

function showError(errorMessage) {
    // Формируем карточку с ошибкой
    const html = `<div class="card">${errorMessage}</div>`;

    // Отображаем карточку на странице
    header.insertAdjacentHTML('afterend', html);
}

function showCard({ name, country, temp, condition, imgSrc }) {
    // Разметка для карточки
    const html = `<div class="card">
                    <h2 class="card-city">${name} <span>${country}</span></h2>
                    <div class="card-weather">
                        <div class="card-value">${temp}<sup>°C</sup></div>
                        <img class="card-img" src="${imgSrc}" alt="Weather">
                    </div>
                    <div class="card-description">${condition}</div>
                  </div>`;
                  
    // Отображаем карточку на странице
    header.insertAdjacentHTML('afterend', html);
}

function logTimeOfDay(city, data) {
    if (data.current.is_day) {
        console.log(`В городе ${city} день`);
    } else {
        console.log(`В городе ${city} ночь`);
    }
}

async function getWeather(city) {
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    return data;
}

// Слушаем отправку формы
form.onsubmit = async function (e) {
    // Отменяем отправку формы
    e.preventDefault();
    // Берём значение из импута и обрезаем пробелы
    let city = input.value.trim();
    // Получаем данные с сервера
    const data = await getWeather(city);

    if (data.error) {
        removeCard();
        showError(data.error.message);
    } else {
        removeCard();

        console.log(data.current.condition.code);

        const info = conditions.filter(obj => obj.code === data.current.condition.code);

        if (info.length > 0 && info[0].languages) {
            console.log(info[0].languages);

            // Находим объект с русским языком
            const languageInfo = info[0].languages.find(lang => lang.lang_iso === 'ru');
            if (!languageInfo) {
                showError('Информация на русском языке не найдена');
                return;
            }

            logTimeOfDay(city, data);

            const condition = data.current.is_day ? languageInfo.day_text : languageInfo.night_text;

            const filePath = './img/' + (data.current.is_day ? 'day' : 'night') + '/';
            const imgFileName = (data.current.is_day ? info[0].day : info[0].night) + '.png';
            const imgSrc = filePath + imgFileName;


            console.log('condition', condition)
            console.log('imgFileName', imgFileName)
            console.log('filePath', filePath)
            console.log('imgSrc', imgSrc)


            const weatherData = {
                name: data.location.name,
                country: data.location.country,
                temp: data.current.temp_c,
                condition: condition,
                imgSrc: imgSrc,
            };
            showCard(weatherData);
        } else {
            showError('Информация о погодных условиях не найдена');
        }
    }
};
