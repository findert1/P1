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
    
        // Convertir le texte en une séquence de bits.
        const textToBits = text => {
            return text.split('').map(char => {
                const charCode = char.charCodeAt(0).toString(2);
                // Assurer que chaque byte a 8 bits de longueur.
                return charCode.padStart(8, '0');
            }).join('');
        };
    
        // Jouer un ton pour chaque bit.
        const playBit = (bit, index) => {
            setTimeout(() => {
                playTone(bit === '1' ? BIT_1_FREQ : BIT_0_FREQ, TONE_LENGTH_MS);
                // Jouer le ton de confirmation pour le bit suivant.
                if (index % 8 === 7) {
                    setTimeout(() => {
                        playTone(NEXT_BIT_FREQ, TONE_LENGTH_MS);
                    }, TONE_LENGTH_MS);
                }
            }, index * TONE_LENGTH_MS * 2);
        };
    
        // Commencer la transmission
        playTone(START_FREQ, TONE_LENGTH_MS);
    
        // Convertir le texte en bits et les jouer.
        const bits = textToBits(text);
        bits.split('').forEach(playBit);
    
        // Terminer la transmission après tous les bits.
        setTimeout(() => {
            playTone(END_FREQ, TONE_LENGTH_MS);
        }, bits.length * TONE_LENGTH_MS * 2);
    }
    
    // La fonction playTone reste la même.
    

    document.getElementById('send-sound').addEventListener('click', function() {
        var text = document.getElementById('text-input').value;
        sendTextAsSound(text);
    });
});
