// On déclare l'audioContext en dehors de toute interaction utilisateur pour éviter les problèmes de politique de lecture automatique.
var audioContext;

// Nous attendons que le DOM soit complètement chargé avant d'ajouter le gestionnaire d'événements.
window.addEventListener('DOMContentLoaded', (event) => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Lier le bouton à une fonction qui jouera le son.
    document.getElementById('play-sound').addEventListener('click', function() {
        // Reprendre l'AudioContext au cas où il serait en état suspendu.
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Créer un nouvel oscillateur pour chaque clic, lié au contexte audio existant.
        var oscillator = audioContext.createOscillator();
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Fréquence en Hz (La à 440Hz)
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 1); // Joue le son pendant 1 seconde
    });
});

window.addEventListener('DOMContentLoaded', (event) => {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();

    function playTone(freq, duration) {
        var oscillator = audioContext.createOscillator();
        oscillator.frequency.value = freq;
        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }

    function sendTextAsSound(text) {
        const START_FREQ = 2000;
        const BIT_1_FREQ = 600;
        const BIT_0_FREQ = 800;
        const END_FREQ = 1500;
        const NEXT_BIT_FREQ = 1200;
        const TONE_LENGTH_MS = 50;

        playTone(START_FREQ, TONE_LENGTH_MS);

        // Ici, vous devez implémenter la logique pour convertir votre texte en une série de tons.
        // ...

        // Pour l'exemple, nous jouerons juste le ton de début et de fin.
        setTimeout(() => {
            playTone(END_FREQ, TONE_LENGTH_MS);
        }, TONE_LENGTH_MS * 2); // juste un délai avant de jouer le ton de fin
    }

    document.getElementById('send-sound').addEventListener('click', function() {
        var text = document.getElementById('text-input').value;
        sendTextAsSound(text);
    });
});
