const FREQ_LSB = 3000;
const STEP = 333;
const DURATION = 0.5;

//import * as mod from "./my-audio-worklet-processor.js";

async function setupAudioProcessing() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();//(window.AudioContext || window.webkitAudioContext)();
    const input = audioContext.createMediaStreamSource(stream);

    // Obtenez le nombre de canaux d'entrée
    const numberOfInputChannels = input.channelCount;
    console.log("Nombre de canaux d'entrée : " + numberOfInputChannels);

    // Créer un AudioWorkletNode pour le traitement audio
    await audioContext.audioWorklet.addModule('my-audio-worklet-processor.js');
    const audioWorkletNode = new AudioWorkletNode(audioContext, 'my-audio-worklet-processor');

    // Connecter l'entrée à l'AudioWorkletNode
    input.connect(audioWorkletNode);
    console.log("connecté");

    audioWorkletNode.port.onmessage = function(event) {
        const result = event.data.result;
        //console.log(result);
        document.getElementById("result1").textContent = result[0];
        document.getElementById("result2").textContent = result[1];
        document.getElementById("result3").textContent = result[2];
        document.getElementById("result4").textContent = result[3];
    }
}

let listeningActive = false;

document.getElementById("start-button").addEventListener("click", function(){
    // Appeler la fonction pour configurer le traitement audio
    setupAudioProcessing().catch(error => {
        console.error('Erreur lors de la configuration du traitement audio:', error);
    });
});


