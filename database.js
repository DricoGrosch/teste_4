require('dotenv').config()
const fs = require('fs')
const sqlite3 = require("sqlite3").verbose();

let database = null;

function handleDatabaseFile() {
    const DEFAULT_DATABASE_PATH = './data/database.db'
    const databasePath = process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH

    const dividedDatabasePath = databasePath.split('/')

    const databaseFileName = dividedDatabasePath[dividedDatabasePath.length - 1]
    const databaseRootDir = databasePath.split(databaseFileName)[0]

    let created = false;

    if (!fs.existsSync(databasePath)) {
        try {
            fs.mkdirSync(databaseRootDir, { recursive: true })
            fs.writeFileSync(databasePath, '');
            created = true
        } catch (err) {
            console.error(err)            
        }
    }
    return { databasePath, created }
}

async function initialMigration() {
    const migrationQuery = `
        CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL,
            token VARCHAR(255)
        );
    `
    await run(migrationQuery)
}

async function getDatabase() {
    const { databasePath, created } = handleDatabaseFile()
    
    if(!database) {
        database = new sqlite3.Database(databasePath, err => {
            if (err) return console.error(err.message);
            console.log(`Established connection to ${databasePath}`);
        });
    }

    if(created) {
        await initialMigration()
    }

    return database
}


function run(query) {
    return new Promise(async (resolve, reject) => {
        const db = await getDatabase()
        
        db.run(query, err => {
            if (err) return reject(err)
            resolve()
        });
    })
}

function select(query) {
    return new Promise(async (resolve, reject) => {
        const db = await getDatabase()

        db.all(query, (err, rows) => {
            if(err) return reject(err)
            return resolve(rows)
        });
        
    })
}

module.exports = { run, select, initialMigration }