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

