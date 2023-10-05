require('dotenv').config();
const axios = require('axios')
const { Client, Location, List, Buttons, LegacySessionAuth, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const SystemController = require('./controllers/SystemController');
const HistoryController = require('./controllers/HistoryController');

// const path = require('path');
// console.log(__dirname); // Akan mencetak direktori saat ini
//env
// return
const openIaKey = process.env.OPENIA;
const respose = process.env.RESPONSE;

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
    // Generate and scan this code with your phone
    client_status = "qr";
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});
client.initialize();
client.on("ready", async () => {
    console.log("Client is ready!");
    client.sendMessage('6281532380661@c.us', 'AI ready');
});
client.on('message', async msg => {
    const chat = await msg.getChat();

    var startsWithBot = msg.body.toLowerCase().startsWith("#bot");
    if (startsWithBot) {
        //penyimpanan data
        const data = msg.body.replace(/^#bot\s+/i, '');

        await SystemController.insertSystem({ content: data });
        msg.reply('data berhasil di simpan');
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




// (async () => {
//     const data = {
//         content: 'BEEBEENET',
//     };
//     const status = SystemController.insertSystem(data);
//     console.log(status.toJSON());
//     // const systems = await SystemController.getSystem();
//     // const historys = await HistoryController.prompt({
//     //     from: 'test',
//     //     content: 'hai',
//     // });
//     // // console.log(historys)
//     // for (const system of historys) {
//     //     console.log(`ID: ${system.id}, Content: ${system.content}`);
//     // }
// })();   