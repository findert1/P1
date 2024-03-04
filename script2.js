// faire en sorte d'envoyer 2 bits par 2 bits car trop d'harmoniques

// partie commune

let audioContext = new (window.AudioContext || window.webkitAudioContext)();

const DELAI_DEMARRAGE = 1000;
const FREQ_LSB = 3000;
const STEP = 333;
const DURATION = 0.5;

// partie envoi

// Fonction pour créer UNE sinusoïde
function createSineWave(freq, startTime) {
    console.log(freq);
    let oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    let gainNode = audioContext.createGain();
    gainNode.gain.value = 0.01;
    oscillator.frequency.value = freq;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + DURATION);
}

// Fonction pour créer un son contenant plusieurs sinusoïdes
function createMultiSineWave(freqArray, startTime) {
    freqArray.forEach(function(freq) {
        createSineWave(freq, startTime, DURATION);
    });
}

//Uncaught (in promise) TypeError: Failed to execute 'stop' on 'AudioScheduledSourceNode': The provided double value is non-finite.

document.getElementById("send-sound").addEventListener("click", function() {
    if(audioContext.state == "suspended") {
        audioContext.resume().then(() => {
            console.log("AudioContext resumed successfully");
            processText();
        });
    } else {
        processText();
    }
});

function processText(){
    let text = document.getElementById("text-input").value;
    //console.log(text);
    let startTime = audioContext.currentTime;
    //createMultiSineWave(charToFrequencies(String.fromCharCode(2)), startTime);
    for(let i=0; i<text.length; i++){
        let asciiValue = text[i].charCodeAt(0);
        let binaire = asciiValue.toString(2).padStart(8, '0');
        let partie1 = binaire.slice(0, 4).split('');
        let partie2 = binaire.slice(4, 8).split('');
        createMultiSineWave(tabToFrequencies(partie1), startTime + (2*i)*DURATION);
        createMultiSineWave(tabToFrequencies(partie2), startTime + (2*i+1)*DURATION);
    }
    //createMultiSineWave(charToFrequencies(String.fromCharCode(3)), startTime + (text.length+1)*DURATION);
}

function tabToFrequencies(tab){
    //let asciiCode = character.charCodeAt(0);
    //let binaryString = asciiCode.toString(2);
    //binaryString = binaryString.padStart(8, '0'); // compléter pour avoir 8 bits
    //let binaryArray = binaryString.split('').map(Number);
    let freqArray = new Array();
    for(let i=0; i<4; i++){
        if(tab[i] == 1) freqArray.push(i*STEP + FREQ_LSB);
        console.log("fréquence");
    }
    console.log(tab);
    console.log(freqArray);
    
    return freqArray;
}

// partie réception
let maxFrequencyAnalyser;
let minFrequencyAnalyser;
let frequencyWidthAnalyser;
let frequencyData;
let frequencies = [];
let seuil = 200;
let fftSize;
let sampleRate;

for(let i=0; i<4; i++){
    frequencies[i] = FREQ_LSB + i*STEP;
}


document.addEventListener('DOMContentLoaded', () =>{
    let analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024; 
    fftSize = 1024
    sampleRate = audioContext.sampleRate;
    let bufferLength = analyser.frequencyBinCount;
    minFrequencyAnalyser = 0;
    maxFrequencyAnalyser = sampleRate / 2; 
    frequencyWidthAnalyser = (maxFrequencyAnalyser - minFrequencyAnalyser) / bufferLength;
    frequencyData = new Uint8Array(bufferLength);

    let isListening = false;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        function updateFrequencyData() {
            if (!isListening) {
              return; 
            }
            analyser.getByteFrequencyData(frequencyData);
            //console.log(frequencyData);
            let car = processFrequencies();
            if(car != '\0') console.log(processFrequencies());
            setTimeout(updateFrequencyData, 100);
        }

        document.getElementById('start-button').addEventListener('click', () => {
            if (!isListening) {
              audioContext.resume().then(() => {
                console.log('AudioContext is now allowed to start.');
                isListening = true;
                updateFrequencyData();
              });
            } else {
              isListening = false;
              cancelAnimationFrame(animationFrameId); // Stop the animation frame
              console.log('AudioContext is now stopped.');
  
              // affichage des éléments enregistrés dans le tableau 
              document.getElementById("result").innerText = affichage(result);
            }
          });
    }
    );
});


function processFrequencies(){
    /*let index;
    let tabResult = [0, 0, 0, 0];
    let tabFreq = [];
    for(let i=0; i<4; i++){
        index = getIndexAtFrequency(frequencies[i]);
        tabFreq[i] = index;
        if(frequencyData[index] > seuil){
            tabResult[i] = 1;
        }
    }
    //console.log(tabFreq);
    //console.log(tabResult);
    //console.log(String.fromCharCode(parseInt(tabResult.join(''), 2)));
    let car = String.fromCharCode(parseInt(tabResult.join(''), 2));
    document.getElementById('result').innerText = tabResult + car;
    return car;*/
    let binsToMonitor = frequencies.map(freq => Math.round(freq / (sampleRate / fftSize)));

    // Calculer l'amplitude pour chaque fréquence
    let amplitudes = binsToMonitor.map(bin => frequencyData[bin]);

    console.log(amplitudes);
    return amplitudes;
}

function getIndexAtFrequency(frequency) {
    if (frequency < minFrequencyAnalyser || frequency > maxFrequencyAnalyser) {
        return -1; 
    }
    return Math.round((frequency - minFrequencyAnalyser) / frequencyWidthAnalyser);
}


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