const History = require('../models/History');

async function prompt(data) {
    try {
        const historyData = {
            from: data.from,
            role: 'user',
            content: data.content,
        };

        await History.create(historyData);
        const history = await History.findAll({
            where: { from: data.from },
            limit: 50
        });

        return history;
    } catch (error) {
        throw error;
    }
}

async function assistant(from, content) {
    try {
        const data = {
            from: from,
            role: 'assistant',
            content: content,
        };

        const res = await History.create(data);
        return res;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    prompt,
    assistant,
};
