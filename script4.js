const FREQ_LSB = 3000;
const STEP = 666;
const DURATION = 0.5;
const THRESHOLD = 5;

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

    let compteur = 0;
    let debut = performance.now();
    let temps = 0;
    let frequence = 0;

    audioWorkletNode.port.onmessage = function(event) {
        const result = event.data.result;
        //console.log(result);
        document.getElementById("result1").textContent = result[0] > THRESHOLD;
        document.getElementById("result2").textContent = result[1] > THRESHOLD;
        document.getElementById("result3").textContent = result[2] > THRESHOLD;
        document.getElementById("result4").textContent = result[3] > THRESHOLD;
        
        compteur++;
        if(compteur == 10){
            temps = (performance.now() - debut)/1000;
            frequence = Math.round((1/temps) * 10);
            debut = performance.now();
            document.getElementById("frequence").textContent = "Fréquence des analyses : " + frequence + " Hz.";
            compteur = 0;
        }
    }
}

let listeningActive = false;

document.getElementById("start-button").addEventListener("click", function(){
    // Appeler la fonction pour configurer le traitement audio
    setupAudioProcessing().catch(error => {
        console.error('Erreur lors de la configuration du traitement audio:', error);
    });
});


