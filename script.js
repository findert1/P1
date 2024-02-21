
var audioContext = new (window.AudioContext || window.webkitAudioContext)();

const textInput = document.getElementById("text-input");
const sendButton = document.getElementById("send-sound");
const TONE_LENGTH_MS = 250;
const ADDITIONAL_DELAY_MS = 2000;  // Augmentez si nécessaire pour vous assurer que le son de départ est joué

// Nouvelles fréquences
const START_FREQ = 10024;
const END_FREQ = 17000;
const STEP_FREQ = 50;

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
    var textToEncode = textInput.value;
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


function integerToChar(integer) { // 0: ' ', 126: '~'
  if (integer >= 0 && integer <= 127-32) {
      return String.fromCharCode(' '.charCodeAt(0) + integer);
  } else {
      return '\0';
  }
}

function freqToChar(freq){
  return String.fromCharCode(Math.floor((freq-START_FREQ)/STEP_FREQ));
}

function affichage(tab){ // faire en sorte que cette fonction retourne un string propre
  let chaine = new Array();
  let j=0;
  for(let i=0; i<tab.length; i++){
    if (tab[i] != '\0'){
      chaine[j] = tab[i];
      j++;
    }
  }
  return chaine.join("");
}

var minFrequencyAnalyser;
var maxFrequencyAnalyser;
var frequencyWidthAnalyser;

function getFrequencyAtIndex(index) {
  return minFrequencyAnalyser + index * frequencyWidthAnalyser;
}

function getIndexAtFrequency(frequency) {
  // Vérifier si la fréquence est dans la plage de fréquences de l'analyseur
  if (frequency < minFrequencyAnalyser || frequency > maxFrequencyAnalyser) {
      return -1; // La fréquence est hors de la plage de fréquences
  }
  // Calculer l'index correspondant
  const index = Math.floor((frequency - minFrequencyAnalyser) / frequencyWidthAnalyser);
  
  return index;
}



var maxIndex;
var maxFrequency;



document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 16384;
    const sampleRate = audioContext.sampleRate;
    const bufferLength = analyser.frequencyBinCount;
    minFrequencyAnalyser = 0;
    maxFrequencyAnalyser = sampleRate / 2; 
    frequencyWidthAnalyser = (maxFrequencyAnalyser - minFrequencyAnalyser) / bufferLength;
    const frequencyData = new Uint8Array(bufferLength);


    let isListening = false;
    let animationFrameId;
    var register = new Array(); // enregistrement des fréquences
    var result = new Array(); // mot de sortie
    var index = 0;
    var indexLettre = 0;
    var repetition = 0;
    const seuil = 120;
    const longueur = 175; // combien de fois une lettre doit se répéter pour qu'on confirme bien que c'est elle
    const retour = 4; // de combien on doit retourner en arrière dans register pour être sûr que c'est la bonne lettre au changement de fréquence
    var temps = 0;

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        //analyser.connect(audioContext.destination);

        // Get the reference to the HTML elements
        const maxFrequencyElement = document.getElementById('max-frequency');
        const maxFrequencyValueElement = document.getElementById('max-frequency-value');

        const seuilElement = document.getElementById('seuil');
        seuilElement.textContent = `Seuil : ${seuil}`;
        const freqMinElement = document.getElementById('freqMin');
        freqMinElement.textContent = `Fréquence minimale : ${START_FREQ}`;

        function updateFrequencyData() {
          if (!isListening) {
            return; // Stop updating when not listening
          }
          analyser.getByteFrequencyData(frequencyData);
        
          // Mettre toutes les fréquences en-dessous de la fréquence min à 0
          for(let i=0; i<getIndexAtFrequency(START_FREQ); i++){
            frequencyData[i] = 0;
          }
        
          // Find the index of the maximum value in the frequencyData array
          maxIndex = frequencyData.indexOf(Math.max(...frequencyData));
          maxFrequency = getFrequencyAtIndex(maxIndex);
          maxFrequencyElement.textContent = `Max Frequency: ${maxFrequency}`;
          maxFrequencyValueElement.textContent = `Max Frequency Value: ${frequencyData[maxIndex]}`;
        
          if(frequencyData[maxIndex] >= seuil){ // Si le son capté est assez fort
            // Pour le premier élément reçu
            register[index] = maxIndex;
        
            // repérer lorsqu'on a un changement de fréquence
            if(index>0){
              if(getFrequencyAtIndex(register[index-1]) < getFrequencyAtIndex(maxIndex)-STEP_FREQ*0.9 || 
              getFrequencyAtIndex(register[index-1]) > getFrequencyAtIndex(maxIndex)+STEP_FREQ*0.9){ // changement
                if(temps==0) temps = performance.now();
                let tempsfin = performance.now();
                //console.log("changement de fréquence détecté");
                // calculer le temps entre les deux derniers changements de fréquence
                if(tempsfin-temps > longueur){
                  repetition = Math.floor((tempsfin-temps)/longueur);
                  //console.log(tempsfin-temps);
                  for(let i=0; i<repetition; i++){
                    lettreTemp = freqToChar(getFrequencyAtIndex(register[index-retour]));
                    result[indexLettre] = lettreTemp;
                    console.log(lettreTemp);
                    indexLettre++;
                  }
                }
                temps = tempsfin;
              }
            }
            index++;
          }
        
          //recommencer en boucle
           
          requestAnimationFrame(updateFrequencyData);
          
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
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

      document.getElementById('reset-button').addEventListener('click', () => {
        index = 0;
        indexLettre = 0;
        indexChangement = 0; 
        register = new Array();
        result = new Array();
        temps = 0;
        var ulElement = document.querySelector('ul');
        while (ulElement.firstChild) {
            ulElement.removeChild(ulElement.firstChild);
        }
      });
});

