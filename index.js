const request = require('request');
const Telegraf = require('telegraf');
require('dotenv').config();
const util = require('util');

//const City = require('./db');

const {getCity, updateData} = require('./es.js');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Request to weather API
const requestOWM = (ctx, id) => {
    request.get(`https://api.openweathermap.org/data/2.5/weather?id=${id}&units=${process.env.UNITS}&APPID=${process.env.OWM_API_TOKEN}`, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            body = JSON.parse(body);

            updateData(body, id);

            ctx.reply(body.main.temp + ' градуса по Цельсию');
        }
        else {
            ctx.reply('Ошибка запроса');
            console.log('Error: ' + error);
        }
    });
};

const witTextRequest = (ctx, callback) => {

    const headers = {
        'auth': {
            'bearer': process.env.WIT_AI_TOKEN
        }
    };

    request(`https://api.wit.ai/message?q=${encodeURI(ctx.message.text)}`, headers, (err, res, body) => {
        if (err) {
            return console.log(err);
        } else {

            let city = JSON.parse(body);

            if (city.entities.location[0].value !== undefined) {

                city = city.entities.location[0].value;

                callback(city)
                    .then((cityData) => {

                        if (cityData.code === 404) {
                            requestOWM(ctx, cityData.id);
                        } else if (cityData !== undefined) {
                            ctx.reply(cityData.main.temp + ' градуса по Цельсию');
                        } else {
                            ctx.reply('Город не найден')
                        }

                    })
                    .catch((e) => {
                        console.log(e);
                        ctx.reply('Что-то пошло не так, попробуйте еще раз')
                    });
            } else {
                ctx.reply('Не удалось распознать ваш город')
            }

        }
    });
};

bot.start((ctx) => ctx.reply('Спроси про погоду?'));

bot.on('text', (ctx) => {

    witTextRequest(ctx, getCity);

    // City.findOne({
    //     $text: {
    //         $search: ctx.message.text
    //     }
    // }, function (err, city) {
    //     if (err) {
    //         console.log('error');
    //         ctx.reply('Error');
    //     }
    //     else {
    //         city ?
    //          requestOWM(ctx, city.id) : ctx.reply('City is not found');
    //     }
    // });

});

bot.startPolling();