
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

function integerToChar(integer) {
  integer = Math.round(integer) -1;
  if (integer >= 0 && integer <= 127-32) {
      return String.fromCharCode(' '.charCodeAt(0) + integer);
  } else {
      return '\0';
  }
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

document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    let isListening = false;
    let animationFrameId;
    var register = new Array();
    var result = new Array();
    var index = 0;
    var indexLettre = 0;
    const seuil = 100;
    const indexFreqMin = 3724;
    const indexFreqMax = 3819;
    const freqA = 3962; // correspond à l'espace
    const freqZ = 4660; // correspond à la tilde
    const marge = 3; // diffénrece de fréquences entre 2 lettres
    const longueur = 13; // combien de fois une lettre doit se répéter pour qu'on confirme bien que c'est elle

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        //analyser.connect(audioContext.destination);
        analyser.fftSize = 16384;

        const bufferLength = analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);

        // Get the reference to the HTML elements
        const maxFrequencyElement = document.getElementById('max-frequency');
        const maxFrequencyValueElement = document.getElementById('max-frequency-value');

        const seuilElement = document.getElementById('seuil');
        seuilElement.textContent = `Seuil : ${seuil}`;
        const freqMinElement = document.getElementById('freqMin');
        freqMinElement.textContent = `Indice de fréquence minimale : ${indexFreqMin}`;

        function updateFrequencyData() {
          if (!isListening) {
            return; // Stop updating when not listening
          }
          analyser.getByteFrequencyData(frequencyData);

          // mettre toutes les fréquences en-dessous de la fréquence min à 0
          for(let i=0; i<freqA-1; i++){
            frequencyData[i] = 0;
          }

          // Find the index of the maximum value in the frequencyData array

          const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));
          maxFrequencyElement.textContent = `Max Frequency: ${maxIndex}`;
          maxFrequencyValueElement.textContent = `Max Frequency Value: ${frequencyData[maxIndex]}`;

          if(frequencyData[maxIndex] >= seuil && maxIndex>indexFreqMin ){
            // Pour le premier élément reçu
            register[index] = maxIndex;
            //var node = document.createElement('li');
            //var lettre = integerToChar(((maxIndex-freqA)/(freqZ-freqA))*(127-32));
            //node.appendChild(document.createTextNode(`${index}: ${maxIndex}: ${lettre}`));
            //document.querySelector('ul').appendChild(node);
            //result[index] = lettre;
            index++;
            // Pour tous les autres éléments reçus
            // suppression des anciennes conditions d'enregistrement
            //if((register[index-1] - marge >= maxIndex || register[index-1] + marge <= maxIndex) && maxIndex != indexFreqMax){
              //}
            // SSSSSTTTTTTTTTTTTTTTbbbbbbbbbbbbbbbmmmmmmmmmmmmmmmmmvvvvvvvvvvvvvvvvvuuuuuuuuuuuuu

            // il faut compter le nombre de fois que l'entrée du tableau se répète à peu de choses près
            if(index>longueur){
              var derniers = register.slice(-longueur);

              // vérification si on en a pas mal à suivre avec une certaine marge
              if(derniers.indexOf(Math.max(...derniers)) <
              derniers.indexOf(Math.min(...derniers)) + marge){
                var lettreTemp = integerToChar(((maxIndex-freqA)/(freqZ-freqA))*(127-32));
                if(indexLettre != 0){
                  if(result[indexLettre-1] != lettreTemp){
                    result[indexLettre] = lettreTemp;
                    console.log(result[indexLettre]);
                    indexLettre ++;
                    
                  }
                }else{
                  result[indexLettre] = lettreTemp;
                  console.log(result[indexLettre]);
                  indexLettre ++;
                  
                }
                
              }
            }
          }
          
          // Schedule the next update
          // Condition pour savoir quand la transmission est terminée
          //if(maxIndex!=indexFreqMax){
          requestAnimationFrame(updateFrequencyData);
          //}
          
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
        register = new Array();
        result = new Array();
        var ulElement = document.querySelector('ul');
        while (ulElement.firstChild) {
            ulElement.removeChild(ulElement.firstChild);
        }
      });
});

