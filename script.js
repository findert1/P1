let audioContext = new (window.AudioContext || window.webkitAudioContext)();

const textInput = document.getElementById("text-input");
const sendButton = document.getElementById("send-sound");
const TONE_LENGTH_MS = 250;
const ADDITIONAL_DELAY_MS = 0;  // Augmentez si nécessaire pour vous assurer que le son de départ est joué

// Nouvelles fréquences
const START_FREQ = 10024;
const END_FREQ = 17000;
const STEP_FREQ = 20;

let serverTime;
let ecartAbsoluLocal;
syncClockWithNTP();

//setInterval(synchroniserHeureAvecNTP, 1000);

//setInterval(envoiTexte, 1100);

sendButton.addEventListener("click", function() {
    if(audioContext.state === "suspended") {
        audioContext.resume().then(() => {
            console.log("AudioContext resumed successfully");
            //envoiTexte();
            envoiTexteNTP();
        });
    } else {
        envoiTexte();
    }
});

function envoiTexte() {
  const maintenantLocal = Date.now();
  //const maintenantAbsolu = maintenantLocal + ecartAbsoluLocal;
  //const heureEnvoiAbsolu = Math.ceil(maintenantAbsolu / 1000) * 1000;
  const heureEnvoi = Math.ceil(maintenantLocal / 1000) * 1000;
  const delaiEnvoi = heureEnvoi - maintenantLocal;
  console.log("Signal envoyé dans " + delaiEnvoi.toString());
  document.getElementById("displayDelai").innerText = "Signal envoyé dans " + delaiEnvoi.toString(); 
  setTimeout(() => sendTextAsSound(textInput.value), delaiEnvoi);
}

function envoiTexteNTP(){ // pareil que avant mais se base avec une synchro NTP
  const maintenantLocal = Date.now();
  const maintenantAbsolu = maintenantLocal + ecartAbsoluLocal;
  const heureEnvoiAbsolu = Math.ceil(maintenantAbsolu / 1000) * 1000;
  //const heureEnvoi = Math.ceil(maintenantLocal / 1000) * 1000;
  const delaiEnvoi = heureEnvoiAbsolu - maintenantLocal;
  console.log("Signal envoyé dans " + delaiEnvoi.toString());
  document.getElementById("displayDelai").innerText = "Signal envoyé dans " + delaiEnvoi.toString(); 
  setTimeout(() => sendTextAsSound(textInput.value), delaiEnvoi);
}

async function sendTextAsSound(text) {
    let tones = [];
    for (let i = 0; i < text.length; i++) {
        tones.push(charToFrequency(text.charAt(i)));
    }
    tones.push(END_FREQ); // Ajoutez le son de fin

    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
          console.log('AudioContext activated just before playing the tone.');
      });
    } 

    let repetitionsPreambule = 5;
    let maintenant = audioContext.currentTime;

    // jouer préambule
    
    for(let i=0; i<repetitionsPreambule; i++){ // j'ai choisi arbitrairement 5 fois
      playFrequency(START_FREQ, maintenant + (TONE_LENGTH_MS * i)/1000, TONE_LENGTH_MS/2);
      console.log("Préambule 1 : " + (maintenant + (TONE_LENGTH_MS * i)/1000) + " " + TONE_LENGTH_MS/2);
      //playFrequency(1, maintenant + (TONE_LENGTH_MS * (i+1))/1000, TONE_LENGTH_MS/2);
      //console.log("Préambule 0 : " + (maintenant + (TONE_LENGTH_MS * (i+1))/1000) + " " + TONE_LENGTH_MS/2);
    }
    
    for(let i=0; i<tones.length; i++){
      playFrequency(tones[i], maintenant + (TONE_LENGTH_MS * i)/1000 + repetitionsPreambule * TONE_LENGTH_MS / 1000, TONE_LENGTH_MS);
      console.log("Tone : " + (maintenant + (TONE_LENGTH_MS * i)/1000 + repetitionsPreambule * TONE_LENGTH_MS / 1000) + " " + TONE_LENGTH_MS);
    }
}

function playFrequency(freq, debutAudio, duree) {
    let oscillator = audioContext.createOscillator(); // un seul oscillateur pour chaque son
    let gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, debutAudio);
    gainNode.gain.setValueAtTime(0.1, debutAudio);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(debutAudio);

    //console.log(new Date(Date.now()).getMilliseconds());
    //gainNode.gain.setValueAtTime(0, debutAudio + (duree-50)/1000);*
    //gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.03);
    //gainNode.gain.exponentialRampToValueAtTime(0.01, debutAudio+(duree/1000) );
    oscillator.stop(debutAudio + duree/1000);
}

function charToFrequency(caractere){
  return START_FREQ + caractere.charCodeAt(0) * STEP_FREQ;
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

function frequencyToChar(frequence){
  let code = Math.round((frequence - START_FREQ) / STEP_FREQ); 
  if(code >= 32){
    return String.fromCharCode(code);
  }else{
    return ' ';
  }
}

// variables
const analyser = audioContext.createAnalyser();
analyser.fftSize = 16384;
let frequencyResolution = audioContext.sampleRate / analyser.fftSize;
let isListening = false;
let animationFrameId;
var register = new Array(); // enregistrement des fréquences
var result = new Array(); // mot de sortie
var index = 0;
var indexLettre = 0;
const seuil = 100;
const seuil_temps = 180;
const marge = 3; // diffénrece de fréquences entre 2 lettres

const bufferLength = analyser.frequencyBinCount;
const frequencyData = new Uint8Array(bufferLength);

// Get the reference to the HTML elements
const maxFrequencyElement = document.getElementById('max-frequency');
const maxFrequencyValueElement = document.getElementById('max-frequency-value');

const seuilElement = document.getElementById('seuil');
seuilElement.textContent = `Seuil : ${seuil}`;

let chrono = performance.now();



// validation de l'autorisation d'accès au micro par l'utilisateur

document.addEventListener('DOMContentLoaded', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);        
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
        document.getElementById("result").innerText = "";
      });
});

function updateFrequencyData() {
  if (!isListening) {
    return; // Stop updating when not listening
  }
  analyser.getByteFrequencyData(frequencyData);

  // mettre toutes les fréquences en-dessous de la fréquence min à 0
  for(let i=0; i<-1; i++){
    frequencyData[i] = 0;
  }

  // Find the index of the maximum value in the frequencyData array

  const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));
  maxFrequencyElement.textContent = `Max Frequency: ${maxIndex * frequencyResolution}`;
  maxFrequencyValueElement.textContent = `Max Frequency Value: ${frequencyData[maxIndex]}`;

  if(frequencyData[maxIndex] >= seuil && maxIndex > START_FREQ/frequencyResolution){
    console.log("Son au-dessus des seuils détecté"); 
    register[index] = maxIndex; 
    
    // Détection du changement de fréquence
    if(index > 1){
      if(register[index] > register[index-1] + marge || register[index] < register[index-1] - marge){
        console.log("Changement de fréquence détecté");
        // Mesure du temps pendant lequel une fréquence a été émise
        let temps = performance.now() - chrono;
        if(temps > seuil_temps){
          var lettreTemp = frequencyToChar(register[index-2] * frequencyResolution);
          for(let i=0; i< Math.floor(temps/seuil_temps); i++){
            result[indexLettre] = lettreTemp;
            console.log(lettreTemp);
            indexLettre ++;
          }
          console.log("Temps de la lettre : " + temps);
        }
        
        chrono = performance.now();
      }
    }else{
      chrono = performance.now();
    }
    index++;
  }
  requestAnimationFrame(updateFrequencyData);
}

/* menu hamburger*/
function openNav() {
  document.getElementById("sidebarMenu").style.width = "250px";
  document.body.classList.add('menu-open');
}

function closeNav() {
  document.getElementById("sidebarMenu").style.width = "0";
  document.body.classList.remove('menu-open');
}

function syncClockWithNTP() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', "https://worldtimeapi.org/api/ip", true);
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      var responseData = JSON.parse(xhr.responseText);
      serverTime = new Date(responseData.datetime);
      ecartAbsoluLocal = serverTime - Date.now(); 
      console.log(serverTime);
    } else {
      console.error('Failed to fetch NTP time');
    }
  };
  xhr.onerror = function() {
    console.error('Failed to fetch NTP time');
  };
  xhr.send();
}