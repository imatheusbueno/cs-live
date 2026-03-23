const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Alterado para /upcoming para alinhar com seu script.js
app.get('/upcoming', async (req, res) => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    // User-Agent para evitar ser bloqueado pela HLTV
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');

    await page.goto('https://www.hltv.org/matches', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.upcomingMatch');

    const matches = await page.evaluate(() => {
      const data = [];
      // Seletor específico da HLTV para partidas futuras
      document.querySelectorAll('.upcomingMatch').forEach(match => {
        const team1 = match.querySelector('.team1 .team')?.innerText;
        const team2 = match.querySelector('.team2 .team')?.innerText;
        const time = match.querySelector('.matchTime')?.innerText;
        const event = match.querySelector('.matchEventName')?.innerText;

        if (team1 && team2) {
          data.push({ team1, team2, time, event });
        }
      });
      return data.slice(0, 10); // Pega apenas as 10 primeiras
    });

    await browser.close();
    res.json(matches);
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

app.listen(3000, () => console.log('🔥 Backend rodando em http://localhost:3000'));