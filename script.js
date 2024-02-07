// Fonction pour obtenir la référence de l'élément d'entrée de texte et du bouton
const textInput = document.getElementById("text-input");
const sendButton = document.getElementById("send-sound");
const TONE_LENGTH_MS = 250; // Durée de chaque tonalité
const ADDITIONAL_DELAY_MS = 1000; // Délais de départ

// Nouvelles fréquences de départ et de fin
const START_FREQ = 10024; // Commence juste au-dessus de 10 kHz
const END_FREQ = 17000; // Fin à 20 kHz pour avoir une large plage
const STEP_FREQ = 20; // Ajustement pour calculer les fréquences des caractères

// Écouteur d'événement pour le bouton
sendButton.addEventListener("click", function() {
    const textToEncode = textInput.value;
    sendTextAsSound(textToEncode);
});

function sendTextAsSound(text) {
    const tones = [];
    
    // Créer un tableau de fréquences pour chaque caractère
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        let freq = START_FREQ + (charCode * STEP_FREQ);
        tones.push(freq);
    }

    function playTonesSequentially(index) {
        if (index < tones.length) {
            playTone(tones[index], TONE_LENGTH_MS);
            setTimeout(() => playTonesSequentially(index + 1), TONE_LENGTH_MS);
        } else {
            setTimeout(() => playTone(END_FREQ, TONE_LENGTH_MS), TONE_LENGTH_MS);
        }
    }

    playTone(START_FREQ, TONE_LENGTH_MS);
    setTimeout(() => playTonesSequentially(0), ADDITIONAL_DELAY_MS);
}

function playTone(freq, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    setTimeout(() => {
        oscillator.stop();
        audioContext.close();
    }, duration);
}
