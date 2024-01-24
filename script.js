// Fonction pour obtenir la référence de l'élément d'entrée de texte et du bouton
const textInput = document.getElementById("text-input");
const sendButton = document.getElementById("send-sound");
const TONE_LENGTH_MS = 50; // Remplacez 50 par la durée en millisecondes que l'on souhaite


// Écouteur d'événement pour le bouton
sendButton.addEventListener("click", function() {
    const textToEncode = textInput.value;
    sendTextAsSound(textToEncode);
});

function sendTextAsSound(text) {
    const START_FREQ = 1024;
    const STEP_FREQ = (text.length <= 4) ? 256 : 16; // Exemple pour 4 bits ou 8 bits
    const END_FREQ = 8192;

    // Emettre le ton de début
    playTone(START_FREQ, TONE_LENGTH_MS);

    // Convertir chaque caractère en ton
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
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
