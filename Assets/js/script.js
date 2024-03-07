// Initialize the score panel functionality
function initializeScorePanel() {
    const scoreButton = document.getElementById('scoreButton'); // Adjust if using a different ID
    const scoringPanel = document.getElementById('scoringPanel'); // Adjust if using a different ID

    // Toggle score panel display
    if (scoreButton && scoringPanel) {
        scoreButton.addEventListener('click', () => {
            scoringPanel.classList.toggle('visible');
        });
    }

    // Functionality to add new team rows - ensure this matches your table structure
    const addTeamButton = document.getElementById('addTeamButton'); // Adjust if using a different ID
    if (addTeamButton) {
        addTeamButton.addEventListener('click', () => {
            const table = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
            const newRow = table.insertRow();
            for (let i = 0; i < numberOfColumns; i++) { // Adjust numberOfColumns as needed
                let newCell = newRow.insertCell();
                newCell.contentEditable = 'true';
                if (i === 0) { newCell.innerText = 'New Team'; } // Example content
            }
        });
    }
}

// Call initializeScorePanel if not dynamically loading the scoring panel
initializeScorePanel();

