const request = require('request');
const Telegraf = require('telegraf');
require('dotenv').config();

const City = require('./db');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Request to weather API
const requestOWM = (ctx, id) => {
    request.get(`https://api.openweathermap.org/data/2.5/weather?id=${id}&units=${process.env.UNITS}&APPID=${process.env.OWM_API_TOKEN}`, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            body = JSON.parse(body);
            ctx.reply(body.main.temp + ' градуса по Цельсию');
        }
        else {
            ctx.reply('Ошибка запроса');
            console.log('Error: ' + error);
        }
    });
};

bot.start((ctx) => ctx.reply('Спроси про погоду?'));

bot.on('text', (ctx) => {

    City.findOne({
        $text: {
            $search: ctx.message.text
        }
    }, function (err, city) {
        if (err) {
            console.log('error');
            ctx.reply('Error');
        }
        else {
            city ?
             requestOWM(ctx, city.id) : ctx.reply('City is not found');
        }
    });

});

bot.startPolling();