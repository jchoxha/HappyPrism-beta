//ANIMATION STATES

    //Home Button
    let homeButtonAnimating = false;

    //Chat Name & Logo
    let chatNameAndLogoAnimating = false;

    async function loadDependencies() {
        await loadAnimeJS();
    }
    
    function loadAnimeJS() {
        return new Promise((resolve, reject) => {
            const animeScript = document.createElement('script');
            animeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
            animeScript.async = true;
            animeScript.onload = () => resolve();
            animeScript.onerror = () => reject(new Error('Failed to load Anime.js'));
            document.head.appendChild(animeScript);
        });
    }


export { loadDependencies };