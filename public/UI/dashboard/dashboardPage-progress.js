function drawProgress() {
    const progressSection = document.getElementById('dashboard-progress');
    progressSection.innerHTML = `
        <h2>Challenges</h2>
        <div class="progress">
            <div class="progress-bar" style="width: 30%"></div>
            <div class="progress-bar" style="width: 20%"></div>
            <div class="progress-bar" style="width: 15%"></div>
        </div>
        <div class="progress-labels">
            <span>Exercise</span>
            <span>Reading</span>
            <span>Meditation</span>
        </div>
    `;
}

module.exports = { drawProgress };
