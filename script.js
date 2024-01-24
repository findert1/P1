function sendTextAsSound(text) {
    const START_FREQ = 1024;
    const STEP_FREQ = (text.length <= 4) ? 256 : 16; // Exemple pour 4 bits ou 8 bits
    const END_FREQ = 8192;

    // Encode with Reed Solomon ( pas encore implémenter )
    const encodedData = reedSolomonEncode(text);

    // Emettre le ton de début
    playTone(START_FREQ, TONE_LENGTH_MS);

    // Convertir chaque caractère en ton
    for (let i = 0; i < encodedData.length; i++) {
        const charCode = encodedData.charCodeAt(i);
        const freq = START_FREQ + (charCode * STEP_FREQ);
        playTone(freq, TONE_LENGTH_MS);
    }

    // Emettre le ton de fin
    setTimeout(() => {
        playTone(END_FREQ, TONE_LENGTH_MS);
    }, TONE_LENGTH_MS * 2);
}

function playTone(freq, duration) {
    // Fonction pour jouer un ton à une fréquence et durée spécifiées
    function playTone(freq, duration) {
        // Créer un nouveau contexte audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
        // Créer un oscillateur
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // Type d'onde: 'sine' pour une onde sinusoïdale
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime); // Fréquence en Hz
    
        // Créer un gain (pour contrôler le volume)
        const gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume initial
    
        // Connecter l'oscillateur au gain puis au contexte audio
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
    
        // Démarrer l'oscillateur
        oscillator.start();
    
        // Arrêter l'oscillateur après la durée spécifiée
        setTimeout(() => {
            oscillator.stop();
            audioContext.close(); // Fermer le contexte audio après avoir joué le son
        }, duration);
    }
    
}

function reedSolomonEncode(data) {
    // Vous devez inclure/importer une bibliothèque Reed Solomon ici
    // Par exemple, quelque chose comme `import rs from 'some-reed-solomon-lib';`
    

    // Encoder les données
    let encodedData = rs.encode(data);

    return encodedData;
}

