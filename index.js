require('dotenv').config();
const axios = require('axios')
const express = require('express');
const qrcode = require('qrcode-terminal');
const qrcode2 = require('qrcode');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const { Client, Location, List, Buttons, LegacySessionAuth, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const SystemController = require('./controllers/SystemController');
const HistoryController = require('./controllers/HistoryController');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const openIaKey = process.env.OPENIA;
const respose = process.env.RESPONSE;
const serverport = process.env.PORT;
const ADMIN = JSON.parse(process.env.ADMIN);
const BOT_RESPONSE_TIMEOUT = 10000;
let START = false;

async function openIa(prompt, from, reply_data = null) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openIaKey}`,
    };
    const data_AI = [];
    const systems = await SystemController.getSystem();
    const historys = await HistoryController.prompt({
        from: from,
        content: prompt
    });

    for (const system of systems) {
        data_AI.push({ role: 'system', content: system.content });
    }
    for (const history of historys) {
        data_AI.push({ role: history.role, content: history.content });
    }

    //kirim ai
    const data = {
        model: 'gpt-3.5-turbo-16k',
        messages: data_AI,
        temperature: 0.7,
    };
    const response = await axios.post(apiUrl, data, { headers });
    const response_content = response.data.choices[0].message.content;
    await HistoryController.assistant(from, response_content);
    return response_content;

}
const client = new Client({
    puppeteer: {
        headless: true, args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-suid-sanbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--single-process',//this one does't work ini windows
            '--disable-gpu',
        ]
    },
    authStrategy: new LocalAuth(),
});
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    io.emit('updateQR', qr);
    qrcode.generate(qr, { small: true });
    qrcode2.toDataURL(qr, (err, url) => {
        io.emit('qr', url);
    })

});
client.initialize();
client.on("ready", async () => {
    console.log("Client is ready!");
    setTimeout(() => {
        START = true;
        console.log('AI ready');
        for (const admint of ADMIN) {
            // client.sendMessage(admint, 'AI ready');
        }
    }, BOT_RESPONSE_TIMEOUT);

    io.emit('msg', "Bot Ready");

});


client.on('message', async msg => {
    if (!START) {
        return
    }


    const chat = await msg.getChat();

    var startsWithBot = msg.body.toLowerCase().startsWith("#bot");
    if (startsWithBot && ADMIN.includes(msg.from)) {
        const data = msg.body.replace(/^#bot\s+/i, '');
        await SystemController.insertSystem({ content: data });
        msg.reply('data berhasil di simpan');
        return
    }

    if (respose == 'chat') {
        if (!chat.isGroup) {
            chat.sendStateTyping();
            const AI = await openIa(msg.body, msg.from);
            msg.reply(AI);
        }
    }
    if (respose == 'group') {
        if (chat.isGroup) {
            chat.sendStateTyping();
            const AI = await openIa(msg.body, msg.from);
            msg.reply(AI);
        }
    }
    if (respose == 'all') {
        chat.sendStateTyping();
        const AI = await openIa(msg.body, msg.from);
        msg.reply(AI);
    }


});


app.get('/', (req, res) => {
    // Mengirim file HTML sebagai respons
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname)));

// Socket.io
io.on('connection', (socket) => {
    console.log('connect')

});

server.listen(serverport, () => {
    console.log('Server berjalan di port ' + serverport);
});
