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
    let oscillator = audioContext.createOscillator();
    oscillator.frequency.value = freq;
    oscillator.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + DURATION);
}

// Fonction pour créer un son contenant plusieurs sinusoïdes
function createMultiSineWave(freqArray, startTime) {
    freqArray.forEach(function(freq) {
        createSineWave(freq, startTime, DURATION);
    });
}

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
    console.log(text);
    let startTime = audioContext.currentTime;
    createMultiSineWave(charToFrequencies(String.fromCharCode(2)), startTime);
    for(let i=0; i<text.length; i++){
        createMultiSineWave(charToFrequencies(text[i]), startTime + (i+1)*DURATION);
    }
    createMultiSineWave(charToFrequencies(String.fromCharCode(3)), startTime + (text.length+1)*DURATION);
}

function charToFrequencies(character){
    let asciiCode = character.charCodeAt(0);
    let binaryString = asciiCode.toString(2);
    binaryString = binaryString.padStart(8, '0'); // compléter pour avoir 8 bits
    let binaryArray = binaryString.split('').map(Number);
    let freqArray = new Array();
    for(let i=0; i<8; i++){
        if(binaryArray[i]) freqArray.push(i*STEP + FREQ_LSB);
    }
    console.log(binaryArray);
    console.log(freqArray);
    return freqArray;
}

// partie réception
let maxFrequencyAnalyser;
let minFrequencyAnalyser;
let frequencyWidthAnalyser;
let frequencyData;
let frequencies = [];
let seuil = 180;

for(let i=0; i<8; i++){
    frequencies[i] = FREQ_LSB + i*STEP;
}


document.addEventListener('DOMContentLoaded', () =>{
    let analyser = audioContext.createAnalyser();
    //analyser.fftSize = 16384; 
    let sampleRate = audioContext.sampleRate;
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
            console.log(frequencyData);
            let car = processFrequencies();
            if(car != '\0') console.log(processFrequencies());
            setTimeout(updateFrequencyData, 500);;
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
    let index;
    let tabResult = [0, 0, 0, 0, 0, 0, 0, 0];
    for(let i=0; i<8; i++){
        index = getIndexAtFrequency(frequencies[i]);
        if(frequencyData[index] > seuil){
            tabResult[i] = 1;
        }
    }
    return String.fromCharCode(parseInt(tabResult.join(''), 2));
}

function getIndexAtFrequency(frequency) {
    if (frequency < minFrequencyAnalyser || frequency > maxFrequencyAnalyser) {
        return -1; 
    }
    return Math.round((frequency - minFrequencyAnalyser) / frequencyWidthAnalyser);
}