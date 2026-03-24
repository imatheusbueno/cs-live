const express = require('express');
const cors = require('cors');
const { HLTV } = require('hltv');

const app = express();
app.use(cors());

app.get('/live', async (req, res) => {
    try {
        console.log("Buscando dados profundos da HLTV...");
        
        // Pega as listas gerais de partidas
        const [liveMatches, upcomingMatches, pastResults] = await Promise.all([
            HLTV.getMatches({ filter: 'live' }),
            HLTV.getMatches({ filter: 'upcoming' }),
            HLTV.getResults({ pages: 1 })
        ]);

        let dashboard = { live: [], upcoming: [], past: [] };

        // 1. Processar AO VIVO (Entrando na partida para pegar os rounds e mapas)
        for (let m of liveMatches.slice(0, 3)) { // Limitado a 3 para não tomar block de velocidade
            if (!m.team1 || !m.team2) continue;
            let mapStats = "";
            
            try {
                const detail = await HLTV.getMatch({ id: m.id });
                if (detail.maps) {
                    detail.maps.forEach(mapa => {
                        // Aqui ele pega o placar fiel com a divisão de CT/TR! Ex: 13:8 (8:4; 5:4)
                        if (mapa.result) mapStats += `[${mapa.name}: ${mapa.result}] `;
                    });
                }
            } catch (e) {}

            dashboard.live.push({
                equipe1: m.team1.name, 
                equipe2: m.team2.name,
                logo1: m.team1.logo || 'https://www.hltv.org/img/static/team/placeholder.svg',
                logo2: m.team2.logo || 'https://www.hltv.org/img/static/team/placeholder.svg',
                evento: m.event.name,
                placar1: m.format === 'bo3' ? 0 : 0, 
                placar2: 0,
                status: "AO VIVO",
                formato: `${m.format} ${mapStats ? ' | ' + mapStats : ''}`
            });
        }

        // 2. Processar PASSADOS (Pegando o resultado exato dos mapas)
        for (let m of pastResults.slice(0, 5)) {
            if (!m.team1 || !m.team2) continue;
            let mapStats = "";
            
            try {
                const detail = await HLTV.getMatch({ id: m.id });
                if (detail.maps) {
                    detail.maps.forEach(mapa => {
                        if (mapa.result) mapStats += `[${mapa.name}: ${mapa.result}] `;
                    });
                }
            } catch (e) {}

            dashboard.past.push({
                equipe1: m.team1.name, 
                equipe2: m.team2.name,
                logo1: m.team1.logo || 'https://www.hltv.org/img/static/team/placeholder.svg',
                logo2: m.team2.logo || 'https://www.hltv.org/img/static/team/placeholder.svg',
                evento: m.event.name,
                placar1: m.result.team1, 
                placar2: m.result.team2,
                status: "ENCERRADO",
                formato: `${m.format} ${mapStats ? ' | ' + mapStats : ''}`
            });
        }

        res.json(dashboard);
    } catch (error) {
        console.error("Erro no servidor Node:", error);
        res.status(500).json({ error: "Erro ao buscar dados reais na HLTV" });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor Profissional Node.js rodando na porta ${PORT}!`);
    console.log("Conectado na HLTV: Extraindo dados de mapas e rounds de CT/TR...");
});