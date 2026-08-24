// Team scoring: add/remove teams, award points, persist across reloads.
(function () {
    'use strict';

    var STORAGE_KEY = 'bardawg_teams';

    function loadTeams() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.filter(function (t) {
                return t && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.score === 'number';
            });
        } catch (err) {
            return [];
        }
    }

    function saveTeams(teams) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
        } catch (err) {
            // storage unavailable (private browsing, quota) — game still works, just won't persist
        }
    }

    var teams = loadTeams();

    function makeId() {
        return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function render() {
        var list = document.getElementById('team-list');
        var empty = document.getElementById('team-list-empty');
        if (!list || !empty) return;

        var sorted = teams.slice().sort(function (a, b) { return b.score - a.score; });

        list.innerHTML = '';
        empty.classList.toggle('hidden', sorted.length > 0);

        sorted.forEach(function (team) {
            var li = document.createElement('li');
            li.className = 'team-row';

            var name = document.createElement('span');
            name.className = 'team-name';
            name.textContent = team.name;

            var score = document.createElement('span');
            score.className = 'team-score';
            score.textContent = String(team.score);

            var minus = document.createElement('button');
            minus.type = 'button';
            minus.className = 'team-adjust';
            minus.textContent = '-1';
            minus.addEventListener('click', function () { adjustScore(team.id, -1); });

            var plus = document.createElement('button');
            plus.type = 'button';
            plus.className = 'team-adjust';
            plus.textContent = '+1';
            plus.addEventListener('click', function () { adjustScore(team.id, 1); });

            var remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'team-remove';
            remove.textContent = 'Remove';
            remove.addEventListener('click', function () { removeTeam(team.id); });

            li.appendChild(name);
            li.appendChild(score);
            li.appendChild(minus);
            li.appendChild(plus);
            li.appendChild(remove);
            list.appendChild(li);
        });
    }

    function addTeam(name) {
        var trimmed = name.trim();
        if (!trimmed) return;
        teams.push({ id: makeId(), name: trimmed, score: 0 });
        saveTeams(teams);
        render();
    }

    function removeTeam(id) {
        teams = teams.filter(function (t) { return t.id !== id; });
        saveTeams(teams);
        render();
    }

    function adjustScore(id, delta) {
        var team = teams.find(function (t) { return t.id === id; });
        if (!team) return;
        team.score += delta;
        saveTeams(teams);
        render();
    }

    function resetGame() {
        if (!window.confirm('Start a new game? This clears every team\'s score.')) return;
        teams.forEach(function (t) { t.score = 0; });
        saveTeams(teams);
        render();
    }

    function initializeScorePanel() {
        var scoreButton = document.getElementById('scoreButton');
        var scoringPanel = document.getElementById('scoringPanel');
        if (scoreButton && scoringPanel) {
            scoreButton.addEventListener('click', function () {
                scoringPanel.classList.toggle('hidden');
            });
        }

        var addTeamForm = document.getElementById('add-team-form');
        var teamNameInput = document.getElementById('team-name-input');
        if (addTeamForm && teamNameInput) {
            addTeamForm.addEventListener('submit', function (event) {
                event.preventDefault();
                addTeam(teamNameInput.value);
                teamNameInput.value = '';
                teamNameInput.focus();
            });
        }

        var newGameButton = document.getElementById('new-game-button');
        if (newGameButton) {
            newGameButton.addEventListener('click', resetGame);
        }

        render();
    }

    document.addEventListener('DOMContentLoaded', initializeScorePanel);
})();
