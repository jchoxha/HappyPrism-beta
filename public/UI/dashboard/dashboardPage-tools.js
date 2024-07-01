function drawTools() {
    const tools = document.getElementById("dashboard-tools");
    tools.innerHTML = `
        <h2>Performance Tracking</h2>
        <form>
            <div class="goal-update">
                <label for="goal1">Exercise</label>
                <input type="number" id="goal1" name="goal1" placeholder="Minutes">
                <button type="button" class="dimension-theme-colored">Update</button>
            </div>
            <div class="goal-update">
                <label for="goal2">Reading</label>
                <input type="number" id="goal2" name="goal2" placeholder="Pages">
                <button type="button" class="dimension-theme-colored">Update</button>
            </div>
            <div class="goal-update">
                <label for="goal3">Meditation</label>
                <input type="number" id="goal3" name="goal3" placeholder="Minutes">
                <button type="button" class="dimension-theme-colored">Update</button>
            </div>
        </form>
        <div class="recently-updated">
            <h3>Recently Updated</h3>
            <ul>
                <li>Exercise - 30 minutes</li>
                <li>Reading - 20 pages</li>
                <li>Meditation - 15 minutes</li>
            </ul>
        </div>
        <div class="completed-goals">
            <h3>Completed Goals</h3>
            <ul>
                <li><span class="emoji">🏆</span> Challenge - Completed 5K Run</li>
                <li><span class="emoji">🥇</span> Challenge - Read 10 Books in 3 months</li>
                <li><span class="emoji">🏆</span> Habit - Meditate 15 minutes Daily for 30 days</li>
                <li><span class="emoji">🥇</span> Project - Complete version 1.0 of Goal Setting App</li>
            </ul>
        </div>
    `;
}

module.exports = { drawTools };
