package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"
)

type Match struct {
	Equipe1 string `json:"equipe1"`
	Equipe2 string `json:"equipe2"`
	Logo1   string `json:"logo1"`
	Logo2   string `json:"logo2"`
	Evento  string `json:"evento"`
	Placar1 int    `json:"placar1"`
	Placar2 int    `json:"placar2"`
	Status  string `json:"status"`
	Formato string `json:"formato"`
}

type Dashboard struct {
	Past     []Match `json:"past"`
	Live     []Match `json:"live"`
	Upcoming []Match `json:"upcoming"`
}

type PandaScoreMatch struct {
	Status        string `json:"status"`
	NumberOfGames int    `json:"number_of_games"`
	League        struct {
		Name string `json:"name"`
	} `json:"league"`
	Opponents []struct {
		Opponent struct {
			Name     string `json:"name"`
			ImageURL string `json:"image_url"`
		} `json:"opponent"`
	} `json:"opponents"`
	Results []struct {
		Score int `json:"score"`
	} `json:"results"`
}

var (
	cachedDashboard Dashboard
	cacheMutex      sync.RWMutex
)

const apiKey = "Wtgh5cG2KGH_ZDUyfc08HCmsPRxe9NIaPbSIBTMAaJVURlINrjw"

func fetchPandaScore(statusFilter string, sort string) []Match {
	url := fmt.Sprintf("https://api.pandascore.co/csgo/matches?filter[status]=%s&sort=%s&per_page=12", statusFilter, sort)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)

	result := make([]Match, 0)
	if err != nil || resp.StatusCode != 200 {
		return result
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var apiData []PandaScoreMatch
	json.Unmarshal(body, &apiData)

	for _, m := range apiData {
		if len(m.Opponents) == 2 {
			logo1 := m.Opponents[0].Opponent.ImageURL
			if logo1 == "" {
				logo1 = "https://www.hltv.org/img/static/team/placeholder.svg"
			}
			logo2 := m.Opponents[1].Opponent.ImageURL
			if logo2 == "" {
				logo2 = "https://www.hltv.org/img/static/team/placeholder.svg"
			}

			placar1, placar2 := 0, 0
			if len(m.Results) == 2 {
				placar1, placar2 = m.Results[0].Score, m.Results[1].Score
			}

			statusBR := "EM BREVE"
			if m.Status == "running" {
				statusBR = "AO VIVO"
			}
			if m.Status == "finished" {
				statusBR = "ENCERRADO"
			}

			result = append(result, Match{
				Equipe1: m.Opponents[0].Opponent.Name,
				Equipe2: m.Opponents[1].Opponent.Name,
				Logo1:   logo1,
				Logo2:   logo2,
				Evento:  m.League.Name,
				Status:  statusBR,
				Formato: fmt.Sprintf("MD%d", m.NumberOfGames),
				Placar1: placar1,
				Placar2: placar2,
			})
		}
	}
	return result
}

func updateDashboardData() {
	live := fetchPandaScore("running", "begin_at")
	upcoming := fetchPandaScore("not_started", "begin_at")
	past := fetchPandaScore("finished", "-begin_at")

	cacheMutex.Lock()
	cachedDashboard = Dashboard{Past: past, Live: live, Upcoming: upcoming}
	cacheMutex.Unlock()
}

func startBackgroundWorker() {
	updateDashboardData()
	go func() {
		ticker := time.NewTicker(60 * time.Second)
		for {
			<-ticker.C
			updateDashboardData()
		}
	}()
}

func apiHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")

	cacheMutex.RLock()
	json.NewEncoder(w).Encode(cachedDashboard)
	cacheMutex.RUnlock()
}

func main() {
	cachedDashboard = Dashboard{Past: make([]Match, 0), Live: make([]Match, 0), Upcoming: make([]Match, 0)}
	startBackgroundWorker()

	http.HandleFunc("/live", apiHandler)
	fmt.Println("🚀 Servidor Premium Online - Porta 3001")
	log.Fatal(http.ListenAndServe(":3001", nil))
}
