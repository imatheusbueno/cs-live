🎯 Bueno Tracker - CS2 Live Hub
O Bueno Tracker é uma plataforma de monitoramento de partidas de Counter-Strike 2 em tempo real. O projeto utiliza uma arquitetura de alta performance com Go no Back-end e uma interface moderna com Glassmorphism no Front-end, consumindo dados oficiais via PandaScore API.

🚀 Funcionalidades
Live Dashboard: Acompanhe partidas que estão acontecendo agora, jogos futuros e resultados passados.

Performance Instantânea: Graças ao sistema de Warm-up Cache, a API responde em milissegundos.

Busca Dinâmica: Filtre times e campeonatos em tempo real sem recarregar a página.

Design Responsivo: Interface otimizada para Desktop e dispositivos Mobile.

Match Details: Modal exclusivo com placares parciais, logos das equipes e informações do mapa.

Ads Ready: Espaços laterais prontos para monetização e parcerias.

🛠️ Tecnologias Utilizadas
Back-end (The Engine)
Go (Golang): Linguagem principal escolhida pela sua concorrência e velocidade.

CronJob System: Um trabalhador em segundo plano (Goroutine) que atualiza os dados da API a cada 60 segundos.

In-Memory Caching: Utilização de sync.RWMutex para garantir que o cache seja lido e escrito de forma segura e atômica.

PandaScore API: Fonte oficial de dados de e-sports.

Front-end (The Visuals)
HTML5 & CSS3: Design customizado com variáveis CSS para fácil manutenção.

Vanilla JavaScript: Lógica de filtro e manipulação de DOM sem dependências pesadas.

Glassmorphism UI: Efeitos de desfoque, neon e profundidade inspirados na estética de CS2.

🏗️ Arquitetura do Sistema
O diferencial técnico deste projeto é a sua resiliência:

Warm-up: Ao iniciar o servidor Go, ele realiza a primeira carga de dados antes de abrir a porta HTTP.

Concurrency: Enquanto os usuários consomem os dados, uma thread separada (CronJob) busca atualizações, evitando que o usuário espere a resposta da API externa.

UI/UX: O CSS utiliza overflow: visible para permitir elementos flutuantes (tags de status) e white-space: nowrap para evitar quebras de layout em resoluções menores.

🔧 Como rodar o projeto
Pré-requisitos
Go instalado (v1.18 ou superior).

Uma chave de API da PandaScore.

Instalação
Clone o repositório:

Bash
git clone https://github.com/seu-usuario/bueno-tracker.git
Navegue até a pasta do back-end e rode o servidor:

Bash
go run main.go
Abra o arquivo index.html no seu navegador favorito.

📸 Screenshots
Dica: Aqui você pode colocar os prints que você tirou do site funcionando para mostrar o design antes mesmo da pessoa rodar o código!

👤 Autor
Matheus Bueno - Desenvolvedor Full Stack - Seu LinkedIn

📝 Próximos Passos
[ ] Implementar WebSockets para Kill Feed real.

[ ] Criar sistema de notificações para times favoritos.

[ ] Integração com Firebase para perfis de usuário personalizados
