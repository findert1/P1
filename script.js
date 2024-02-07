// Fonction pour obtenir la référence de l'élément d'entrée de texte et du bouton
const textInput = document.getElementById("text-input");
const sendButton = document.getElementById("send-sound");
const TONE_LENGTH_MS = 200; // Remplacez 50 par la durée en millisecondes que l'on souhaite
const ADDITIONAL_DELAY_MS=500 // délais de départ


// Écouteur d'événement pour le bouton
sendButton.addEventListener("click", function() {
    const textToEncode = textInput.value;
    sendTextAsSound(textToEncode);
});

function sendTextAsSound(text) {
    const START_FREQ = 1024;
    const STEP_FREQ = (text.length <= 4) ? 256 : 16; // Exemple pour 4 bits ou 8 bits
    const END_FREQ = 8192;
    const tones = [];

    
    // Créer un tableau de fréquences pour chaque caractère
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        let freq = START_FREQ + (charCode * STEP_FREQ);

        // Vérifier que la fréquence calculée est dans la plage autorisée
        if (freq < -24000) {
            freq = -24000;
        } else if (freq > 24000) {
            freq = 24000;
        }

        tones.push(freq);
    }

    // Fonction récursive pour jouer les tonalités une par une
    function playTonesSequentially(index) {
        if (index < tones.length) {
            playTone(tones[index], TONE_LENGTH_MS);
            setTimeout(() => {
                playTonesSequentially(index + 1); // Jouer la tonalité suivante après TONE_LENGTH_MS
            }, TONE_LENGTH_MS);
        } else {
            // Toutes les tonalités ont été jouées, émettre le ton de fin
            setTimeout(() => {
                playTone(END_FREQ, TONE_LENGTH_MS);
            }, TONE_LENGTH_MS);
        }
    }

    // Démarrer la séquence de tonalités
    // Démarrer la séquence de tonalités avec le son de départ
    playTone(START_FREQ, TONE_LENGTH_MS);
    setTimeout(() => {
        playTonesSequentially(0);
    }, ADDITIONAL_DELAY_MS); // Ajout d'un délais au début

}


function playTone(freq, duration) {
    // Fonction pour jouer un ton à une fréquence et durée spécifiées

    // Créer un nouveau contexte audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Créer un oscillateur
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine'; // Type d'onde: 'sine' pour une onde sinusoïdale
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime); // Fréquence en Hz
    
    // Créer un gain (pour contrôler le volume)
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume initial
    
    // Connecter l'oscillateur au gain puis au contexte audio
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Démarrer l'oscillateur
    oscillator.start();
    
    // Arrêter l'oscillateur après la durée spécifiée
    setTimeout(() => {
        oscillator.stop();
        audioContext.close(); // Fermer le contexte audio après avoir joué le son
    }, duration);
}

function integerToChar(integer) {
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
  return chaine.toString();
}

document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    let isListening = false;
    let animationFrameId;
    var register = new Array();
    var result = new Array();
    var index = 0;
    const seuil = 100;
    const indexFreqMin = 380;
    const indexFreqMax = 2900;
    const freqA = 570; // correspond à l'espace
    const freqZ = 1129; // correspond à la tilde
    const marge = 2; // diffénrece de fréquences entre 2 lettres

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
          for(let i=0; i<indexFreqMin; i++){
            frequencyData[i] = 0;
          }

          // Find the index of the maximum value in the frequencyData array

          const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));
          maxFrequencyElement.textContent = `Max Frequency: ${maxIndex}`;
          maxFrequencyValueElement.textContent = `Max Frequency Value: ${frequencyData[maxIndex]}`;

          // Réinitialisation de la liste et du tableau quand on a la fréquence du début

          

          if(frequencyData[maxIndex] >= seuil && maxIndex>indexFreqMin ){
            // Pour le premier élément reçu
            if(index == 0){
              register[index] = maxIndex;
              var node = document.createElement('li');
              node.appendChild(document.createTextNode(`${index}: ${maxIndex}`));
              document.querySelector('ul').appendChild(node);
              index++;
            }else{
              // Pour tous les autres éléments reçus
              if((register[index-1] - marge >= maxIndex || register[index-1] + marge <= maxIndex) && maxIndex != indexFreqMax){
                register[index]=maxIndex;
                var node = document.createElement('li');
                var lettre = integerToChar(((maxIndex-freqA)/(freqZ-freqA))*(127-32));
                node.appendChild(document.createTextNode(`${index}: ${maxIndex}: ${lettre}`));
                document.querySelector('ul').appendChild(node);
                result[index] = lettre;
                index++;
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
        register = new Array();
        result = new Array();
        var ulElement = document.querySelector('ul');
        while (ulElement.firstChild) {
            ulElement.removeChild(ulElement.firstChild);
        }
      });
});

