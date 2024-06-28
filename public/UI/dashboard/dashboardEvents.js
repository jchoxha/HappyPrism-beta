let canvasManager = null;
function setupDashboardEvents(CanvasManager) {
    canvasManager = CanvasManager;
    const buttons = {
        "dashboard-link": () => showPage('dashboard-main'),
        "goals-link": () => showPage('dashboard-goals'),
        "progress-link": () => showPage('dashboard-progress'),
        "tools-link": () => showPage('dashboard-tools'),
        'close-dashboard-button': handleCloseDashboardButtonClick
    };

    for (const [id, clickHandler] of Object.entries(buttons)) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', clickHandler);
        }
    }
}

function handleAllButtonClick(event) {
    console.log("Button clicked: ", event.currentTarget.id);
    let buttons = null;
        buttons = document.querySelectorAll('.activatable-button');
        
    
    if (buttons != null) {
        buttons.forEach(btn => {
            if(btn != event.currentTarget){
                btn.classList.remove('button-active');
            }
            else{
                btn.classList.add('button-active');
            }
        });
       
        
    }
}

function showPage(page) {
    const pages = document.getElementsByClassName("dashboard-page");
    for (const p of pages) {
        p.style.display = "none";
    }
    document.getElementById(page).style.display = "block";
}


function handleCloseDashboardButtonClick(event) {
    handleAllButtonClick(event);
    document.getElementById('dashboard-button').classList.remove('button-active');
    canvasManager.toggleDashboard();
}

module.exports = { setupDashboardEvents };
