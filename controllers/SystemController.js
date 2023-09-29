const System = require('../models/System');

async function insertSystem(userData) {
    try {
        const system = await System.create(userData); // Menggunakan metode create untuk menyisipkan data ke dalam database
        return system;
    } catch (error) {
        throw error;
    }
}

async function getSystem() {
    try {
        const system = await System.findAll(); // Menggunakan metode findById untuk mengambil data sistem berdasarkan ID
        return system.map(system => system.toJSON());;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    insertSystem,
    getSystem,
};
