import { setupDashboardEvents } from './dashboardEvents.js';
import { drawGoals } from './dashboardPage-goals.js';
import { drawProgress } from './dashboardPage-progress.js';
import { drawTools } from './dashboardPage-tools.js';

function drawDashboard(canvasManager) {
    const dashboardPopup = document.getElementById("dashboard-popup");
    if (dashboardPopup) {
        dashboardPopup.style.display = "block";
        dashboardPopup.innerHTML = 
        /*HTML*/
        `
        <button id="close-dashboard-button" class="activatable-button">
            <img src="/public/Images/UI/close.svg" alt="close">
        </button>
        <div id="dashboard-content">
            <div id="dashboard-sidebar">
                <nav id="sidebar-nav">
                    <ul>
                        <li><a href="#" id="dashboard-link">Dashboard</a></li>
                        <li><a href="#" id="goals-link">Goals</a></li>
                        <li><a href="#" id="progress-link">Progress</a></li>
                        <li><a href="#" id="tools-link">Tools</a></li>
                    </ul>
                </nav>
            </div>
            <main>
                <section id="dashboard-main" class="dashboard-page">
                    <h2>Dashboard</h2>
                    <div id="main-calendar">
                        <h3>Weekly Calendar</h3>
                        <div class="mc-week">
                            <div class="mc-day">Mon</div>
                            <div class="mc-day">Tue</div>
                            <div class="mc-day">Wed</div>
                            <div class="mc-day">Thu</div>
                            <div class="mc-day">Fri</div>
                            <div class="mc-day">Sat</div>
                            <div class="mc-day">Sun</div>
                        </div>
                    </div>
                    <div class="daily-insights">
                        <h3>Daily Insights</h3>
                        <div class="insight">
                            <p>Insight 1: Your current productivity is high! Keep up the great work!</p>
                        </div>
                        <div class="navigation">
                            <button class="prev-insight dimension-theme-colored">Previous</button>
                            <button class="next-insight dimension-theme-colored">Next</button>
                        </div>
                    </div>
                    <div class="quick-update">
                        <h3>Quick Update</h3>
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
                    </div>
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
                </section>
                <section id="dashboard-goals" class="dashboard-page">
                    <!-- Content specific to Habits -->
                </section>
                <section id="dashboard-progress" class="dashboard-page">
                    <!-- Content specific to Challenges -->
                </section>
                <section id="dashboard-tools" class="dashboard-page">
                    <!-- Content specific to Performance Tracking -->
                </section>
            </main>
        </div>
        `;
        setupDashboardEvents(canvasManager);
        drawPages();
    } else {
        console.error("Element with id 'dashboard-popup' not found.");
    }
}

function clearDashboard() {
    const dashboardPopup = document.getElementById("dashboard-popup");
    if (dashboardPopup) {
        dashboardPopup.style.display = "none";
        dashboardPopup.innerHTML = "";
    } else {
        console.error("Element with id 'dashboard-popup' not found.");
    }
}

function drawPages() {
    drawGoals();
    drawProgress();
    drawTools();
}

export { drawDashboard, clearDashboard };
