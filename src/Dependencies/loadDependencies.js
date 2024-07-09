//ANIMATION STATES

    //Home Button
    let homeButtonAnimating = false;

    //Chat Name & Logo
    let chatNameAndLogoAnimating = false;

function loadDependencies() {
    loadAnimeJS();
}

function loadAnimeJS() {
    // Load Anime.js
    const animeScript = document.createElement('script');
    animeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
    animeScript.async = false;
    document.head.appendChild(animeScript);
}


export { loadDependencies };