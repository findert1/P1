
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

const textInput = document.getElementById("text-input");
const sendButton = document.getElementById("send-sound");
const TONE_LENGTH_MS = 250;
const ADDITIONAL_DELAY_MS = 2000;  // Augmentez si nécessaire pour vous assurer que le son de départ est joué

// Nouvelles fréquences
const START_FREQ = 10024;
const END_FREQ = 17000;
const STEP_FREQ = 20;

sendButton.addEventListener("click", function() {
    if(audioContext.state === "suspended") {
        audioContext.resume().then(() => {
            console.log("AudioContext resumed successfully");
            startSending();
        });
    } else {
        startSending();
    }
});

function startSending() {
    const textToEncode = textInput.value;
    // Introduisez un délai avant de commencer à envoyer
    setTimeout(() => sendTextAsSound(textToEncode), ADDITIONAL_DELAY_MS);
}

function sendTextAsSound(text) {
    let tones = [START_FREQ]; // Commencez par ajouter le son de départ

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        let freq = START_FREQ + (charCode * STEP_FREQ);
        tones.push(freq);
    }

    tones.push(END_FREQ); // Ajoutez le son de fin

    playTonesSequentially(tones, 0);
}

function playTonesSequentially(tones, index) {
    if (index < tones.length) {
        playTone(tones[index], TONE_LENGTH_MS, () => playTonesSequentially(tones, index + 1));
    }
}

function playTone(freq, duration, callback) {
    // Vérifier l'état de l'`AudioContext` et le reprendre si nécessaire
    if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext activated just before playing the tone.');
            actuallyPlayTone(freq, duration, callback);
        });
    } else {
        actuallyPlayTone(freq, duration, callback);
    }
}

function actuallyPlayTone(freq, duration, callback) {
    let oscillator = audioContext.createOscillator();
    let gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);

    if (callback) {
        setTimeout(callback, duration);
    }
}

