async function updateUI() {
    const container = document.getElementById('matches-list');
    
    if (!container) {
        console.error("Não achei o elemento matches-list no seu HTML!");
        return;
    }

    try {
        const res = await fetch('http://localhost:3001/live');
        const matches = await res.json();
        
        container.innerHTML = ""; 

        // Adicionei essa linha de segurança para garantir que sempre seja uma lista
        const listaPartidas = Array.isArray(matches) ? matches : [];

        if (listaPartidas.length === 0) {
            container.innerHTML = "<p class='loading'>Nenhuma partida de brasileiros agora.</p>";
            return;
        }

        listaPartidas.forEach(m => {
            container.innerHTML += `
                <div class="match-card">
                    <div class="event-name">${m.evento}</div>
                    
                    <div class="score-row">
                        <div class="team-column">
                            <img src="${m.logo1}" class="team-logo" onerror="this.src='https://www.hltv.org/img/static/team/placeholder.svg'" alt="${m.equipe1}">
                            <span class="team-name">${m.equipe1}</span>
                        </div>

                        <span class="score-numbers">${m.placar1} : ${m.placar2}</span> 

                        <div class="team-column">
                            <img src="${m.logo2}" class="team-logo" onerror="this.src='https://www.hltv.org/img/static/team/placeholder.svg'" alt="${m.equipe2}">
                            <span class="team-name">${m.equipe2}</span>
                        </div>
                    </div>

                    <div class="live-tag">🔴 AO VIVO</div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Erro ao conectar no Go:", err);
        container.innerHTML = "<p style='color:red; text-align:center;'>Servidor Go desligado. Ligue o terminal!</p>";
    }
}

updateUI();
setInterval(updateUI, 5000);