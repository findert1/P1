const FREQ_LSB = 3000;
const STEP = 333;
const DURATION = 0.5;

async function setupAudioProcessing() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const input = audioContext.createMediaStreamSource(stream);
  
    // Obtenez le nombre de canaux d'entrée
    const numberOfInputChannels = input.channelCount;
    console.log("Nombre de canaux d'entrée : " + numberOfInputChannels);
  
    // Créer un AudioWorkletNode pour le traitement audio
    await audioContext.audioWorklet.addModule('my-audio-worklet-processor.js');
    const audioWorkletNode = new AudioWorkletNode(audioContext, 'my-audio-worklet-processor', {
        sample_rate: audioContext.sampleRate,
        freq_lsb: FREQ_LSB,
        step: STEP,
        duration: DURATION
    });
  
    // Connecter l'entrée à l'AudioWorkletNode
    input.connect(audioWorkletNode);

  }

// Appeler la fonction pour configurer le traitement audio
setupAudioProcessing().catch(error => {
    console.error('Erreur lors de la configuration du traitement audio:', error);
});
