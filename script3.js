// Créer un contexte audio
let audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Créer un nœud ScriptProcessor
//let scriptNode = audioContext.createScriptProcessor(4096, 1, 1);

const audioWorkletNodeName = 'audio-worklet-processor';

audioContext.audioWorklet.addModule('audio-worklet-processor.js')
  .then(() => {
    // Créer une instance de AudioWorkletNode en utilisant le nom du module
    const audioWorkletNode = new AudioWorkletNode(audioContext, audioWorkletNodeName);

    // Connecter l'AudioWorkletNode à d'autres nœuds audio
    audioWorkletNode.connect(audioContext.destination);
  })
  .catch((error) => {
    console.error('Erreur lors du chargement du module de travail audio:', error);
  });

// Connecter le nœud ScriptProcessor
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(scriptNode);
    scriptNode.connect(audioContext.destination);
    
    // Définir la fonction de rappel
    scriptNode.onaudioprocess = function(event) {
        // Obtenir les données audio brutes
        let inputBuffer = event.inputBuffer.getChannelData(0);
    
        // Calculer l'amplitude de la fréquence spécifique
        let amplitude = extractAmplitudeForFrequency(inputBuffer, 3000, audioContext.sampleRate);
    
        // Utiliser l'amplitude calculée
        console.log('Amplitude of target frequency:', amplitude);
    };
});



// Fonction pour extraire l'amplitude d'une fréquence spécifique à partir d'un signal audio brut
function extractAmplitudeForFrequency(inputBuffer, targetFrequency, sampleRate) {
    let N = inputBuffer.length; // Taille de la fenêtre de données
    let fftBuffer = new Array(N).fill(0); // Initialisation du buffer pour la transformée de Fourier
    let window = getHammingWindow(N); // Obtention de la fenêtre de Hamming
    
    // Application de la fenêtre de Hamming
    for (let i = 0; i < N; i++) {
        fftBuffer[i] = inputBuffer[i] * window[i];
    }

    // Calcul de la transformée de Fourier discrète (DFT)
    let fft = new Array(N).fill(0);
    for (let k = 0; k < N; k++) {
        for (let n = 0; n < N; n++) {
            fft[k] += fftBuffer[n] * Math.cos(2 * Math.PI * k * n / N);
        }
    }

    // Recherche de l'indice de la fréquence cible dans le spectre de fréquence
    let targetIndex = Math.round(targetFrequency / sampleRate * N);

    // Extraction de l'amplitude de la fréquence cible
    let amplitude = Math.sqrt(fft[targetIndex] ** 2 + fft[targetIndex + 1] ** 2);
    return amplitude;
}

// Fonction pour obtenir la fenêtre de Hamming
function getHammingWindow(N) {
    let window = new Array(N);
    for (let i = 0; i < N; i++) {
        window[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
    }
    return window;
}
