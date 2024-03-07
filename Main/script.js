function togglePanel() {
    var panel = document.getElementById('scoringPanel');
    var content = panel.getElementsByClassName('scoring-content')[0];
    if (content.style.display === 'block') {
        content.style.display = 'none';
        panel.style.bottom = '0';
    } else {
        content.style.display = 'block';
        panel.style.bottom = '0'; // Adjust if the panel hides content
    }
}

function addTeam() {
    var table = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
    var newRow = table.insertRow();
    for (var i = 0; i < 11; i++) { // 1 for team name + 10 for questions
        var newCell = newRow.insertCell();
        newCell.contentEditable = 'true';
        if (i === 0) { newCell.innerHTML = 'New Team'; } // Default name for new teams
    }
}
