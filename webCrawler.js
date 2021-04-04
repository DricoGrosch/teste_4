require('dotenv').config()
const puppeteer = require('puppeteer');
const {decipher} = require("../utils/cipher");
const {getUserByToken} = require("../models/User");

async function login(page,token) {
    const user = await getUserByToken(token);
    await page.type('#input-1', user.email,{delay:300})
    await page.type('#input-2', decipher(user.password),{delay:300})
    await page.click('.form-control-login')
}

async function isNewNegotiationAvailable(page) {
    const negotiationValue = await page.evaluate(() => parseFloat(document.getElementById('operando').innerHTML))
    return negotiationValue == 0
}

async function startNewNegotiation(page) {
    await page.click('.btn-operar')
    await page.select('#select', 'Optimus Trader')
    await page.evaluate(() => document.getElementById('stepper-step-1').querySelector('a').click());
    await page.waitForTimeout(2000)
    await page.evaluate(() => document.getElementById('stepper-step-2').querySelector('a').click());
    await page.waitForTimeout(2000)
    await page.evaluate(() => document.getElementById('stepper-step-2').querySelector('.next-step').click());
    await page.waitForTimeout(2000)
    await page.evaluate(() => document.getElementById('stepDias').value = 1);
    await page.waitForTimeout(2000)
    await page.evaluate(() => document.getElementById('stepper-step-3').querySelector('.next-step').click());
    await page.waitForTimeout(2000)
    await page.evaluate(() => document.getElementById('modalInvestir').submit());
}

async function startBot(token) {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto('https://botmoney.trade/', {waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']});
    await login(page,token);
    await page.waitForSelector(".btn-operar");
    if (await isNewNegotiationAvailable(page)) {
        await startNewNegotiation(page)
    }
    // await browser.close()
}

module.exports = {
    startBot
}