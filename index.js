const TelegramBot = require('node-telegram-bot-api')
const TOKEN = ''

const port = process.env.PORT || 443
const host = '0.0.0.0' // probably this change is not required
const externalUrl = process.env.CUSTOM_ENV_VARIABLE || 'https://devs-sc-bot.herokuapp.com'

const bot = new TelegramBot(TOKEN, { webHook: { port: port, host: host } })
bot.setWebHook(externalUrl + ':443/bot' + TOKEN)

const axios = require('axios')
const cheerio = require('cheerio')
const normalizer = require('./helpers/normalize')

bot.on('new_chat_members', (msg) => {
  bot.sendMessage(msg.chat.id, `Olá ${msg.from.first_name}, bem vindo ao Devs SC!! Conte-nos um pouco sobre você, com o que trabalha e onde, se possivel é claro`)
})

bot.onText(/\/eventos (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const resp = normalizer(match[1].trim())
  const urlTec = `https://www.sympla.com.br/eventos/${resp}?s=tecnologia`

  axios.get(urlTec).then((response) => {
    const $ = cheerio.load(response.data)
    const data = []
    $('.event-box-link').each((i, elm) => {
      data.push({
        name: $(elm).children().eq(1).children().first().text(),
        date: $(elm).children().eq(2).children().eq(1).first().text().trim(),
        month: $(elm).children().eq(2).children().eq(0).first().text().trim(),
        place: $(elm).children().eq(3).children().eq(0).first().text().trim(),
        city: $(elm).children().eq(3).children().eq(1).text().trim()
      })
    })
    const finalData = data.map((el) => `Evento: ${el.name} \nData: ${el.date} - ${el.month} \nLocal: ${el.place} \nHorário e Cidade: ${el.city}`)
    return finalData
  }).then((data) => {
    bot.sendMessage(chatId, data.join('\n\n'))
  }).catch((error) => {
    console.log(error)
  })
})
