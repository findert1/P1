let audioContext = new (window.AudioContext || window.webkitAudioContext)();

const textInput = document.getElementById("text-input");
const sendButton = document.getElementById("send-sound");
const TONE_LENGTH_MS = 400;
const ADDITIONAL_DELAY_MS = 0;  // Augmentez si nécessaire pour vous assurer que le son de départ est joué

// Nouvelles fréquences
const START_FREQ = 10024;
const END_FREQ = 17000;
const STEP_FREQ = 20;

let serverTime;
let ecartAbsoluLocal;
//syncClockWithNTP();

//setInterval(synchroniserHeureAvecNTP, 1000);

//setInterval(envoiTexte, 1100);

sendButton.addEventListener("click", function() {
    if(audioContext.state === "suspended") {
        audioContext.resume().then(() => {
            console.log("AudioContext resumed successfully");
            //envoiTexte();
            envoiTexte();
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
    tones.push(END_FREQ); // Ajouter le son de fin

    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
          console.log('AudioContext activated just before playing the tone.');
      });
    } 

    let repetitionsPreambule = 6; // 5 bits simples et 1 bit double
    let maintenant = audioContext.currentTime;

    // jouer préambule
    
    for(let i=0; i<repetitionsPreambule - 1; i++){ // j'ai choisi arbitrairement 5 fois
      // ce qui sera considéré comme le bit 1 du préambule
      playFrequency(START_FREQ, maintenant + (TONE_LENGTH_MS * i)/1000, TONE_LENGTH_MS/2);
      console.log("Préambule 1 : " + (maintenant + (TONE_LENGTH_MS * i)/1000) + " " + TONE_LENGTH_MS/2);

      // ce qui sera considéré comme le bit 0
      //if(i != repetitionsPreambule - 2){ // parce qu'on veut pas jouer de 0 à la fin de la trame de préambule
        playFrequency(START_FREQ + 3*STEP_FREQ, maintenant + (TONE_LENGTH_MS * (i+1/2))/1000, TONE_LENGTH_MS/2); // 3* parce que je l'aurai décidé ainsi
        console.log("Préambule 0 : " + (maintenant + (TONE_LENGTH_MS * (i+1/2))/1000) + " " + TONE_LENGTH_MS/2);
      //}
    }

    // jouer le dernier bit de préambule qui annonce le début des données
    playFrequency(START_FREQ, maintenant + (TONE_LENGTH_MS * (repetitionsPreambule-1))/1000, TONE_LENGTH_MS);
    console.log("Préambule 1 : " + (maintenant + (TONE_LENGTH_MS * (repetitionsPreambule-1))/1000) + " " + TONE_LENGTH_MS);
    
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
  return String.fromCharCode(code);
  /*
  if(code >= 32){
    return String.fromCharCode(code);
  }else{
    return ' ';
  }
  */
}

// variables
const analyser = audioContext.createAnalyser();
analyser.fftSize = 16384;
let frequencyResolution = audioContext.sampleRate / analyser.fftSize;
let isListening = false;
let animationFrameId;
//var register = new Array(); // enregistrement des fréquences
var result = new Array(); // mot de sortie
var index = 0;
var indexLettre = 0;
const seuil = 100;
const seuil_temps = 180;
const marge = 3; // diffénrece de fréquences entre 2 lettres

const bufferLength = analyser.frequencyBinCount;

// Get the reference to the HTML elements
const maxFrequencyElement = document.getElementById('max-frequency');
const maxFrequencyValueElement = document.getElementById('max-frequency-value');

const seuilElement = document.getElementById('seuil');
seuilElement.textContent = `Seuil : ${seuil}`;

let chrono = performance.now();

let preambuleHaut = false;
let heurePreambule;
let heuresFrontsMontants = [];
let indexHFM = 0; // HFM = temps fronts montants
let heuresFrontsDescendants = [];
let indexHFD = 0; // HFD = temps fronts descendants

let idEchantillonnage;

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
              //updateFrequencyData();
              debuterEcoute();
            });
          } else {
            isListening = false;
            console.log('AudioContext is now stopped.');
            terminerEcoute();
            //document.getElementById("result").innerText = affichage(result);
          }
        });
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
      document.getElementById('reset-button').addEventListener('click', () => {
        /* ne sert à rien, supprimer le bouton de reset
        index = 0;
        indexLettre = 0;
        //register = new Array();
        result = new Array();
        document.getElementById("result").innerText = "";

        preambuleHaut = false;
        heurePreambule = null;
        heuresFrontsMontants = [];
        indexHFM = 0; // HFM = temps fronts montants
        heuresFrontsDescendants = [];
        indexHFD = 0; // HFD = temps fronts descendants

        idEchantillonnage = null;
        */
      });
});

function getMaxFrequency(){
  const frequencyData = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(frequencyData);

  for(let i=0; i<START_FREQ/frequencyResolution; i++){
    frequencyData[i] = 0;
  }

  const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));
  maxFrequencyElement.textContent = `Max Frequency: ${maxIndex * frequencyResolution}, ${frequencyToChar(maxIndex * frequencyResolution)}`;
  maxFrequencyValueElement.textContent = `Max Frequency Value: ${frequencyData[maxIndex]}`;

  requestAnimationFrame(getMaxFrequency);

  return [maxIndex * frequencyResolution, frequencyData[maxIndex]];
}

let preambuleTermine = false;
function debuterEcoute(){
  const [maxFreq, amplitude] = getMaxFrequency();

  // dans le cas où on est dans les fréquences de préambule
  if(amplitude >= seuil 
    && maxFreq > START_FREQ - marge 
    && maxFreq < START_FREQ + marge ){ // quand on est dans les parties hautes du préambule
      console.log("Son préambule détecté");
      
      // mesurer la longueur du signal de préambule
        heurePreambule = performance.now();

      if(!preambuleHaut){ // détection d'un front montant
        preambuleHaut = true;
        heuresFrontsMontants[indexHFM] = heurePreambule;
        indexHFM++;
        console.log("Front montant préambule");
      }
  }
  
  // dans le cas où on est dans les parties "basses" du préambule
  if(amplitude >= seuil 
    && maxFreq > (START_FREQ+3*STEP_FREQ) - marge //3* parce que c'est encore moi qui l'ai décidé
    && maxFreq < (START_FREQ+3*STEP_FREQ) + marge){ // quand on est dans les parties creuses du préambule
    if(preambuleHaut){ // et qu'on détecte que c'est un front descendant
      preambuleHaut = false;
      heuresFrontsDescendants[indexHFD] = performance.now();
      console.log("longueur bit haut préambule : " + (heuresFrontsDescendants[indexHFD]-heuresFrontsMontants[indexHFM-1]));
      indexHFD++;
      console.log("Front descendant préambule");
    }
  }

  // vérifier si on n'est pas dans le dernier bit qui dure deux fois plus longtemps
  if(performance.now() - heuresFrontsMontants[indexHFM-1] > TONE_LENGTH_MS
  && preambuleHaut){
    //console.log(performance.now() - heuresFrontsMontants[indexHFM-1]);
    // dans ce cas il faut caler l'horloge
    let somme = 0;
    console.log("indexHFD : " + indexHFD);
    for(let i=0; i<indexHFD; i++){
      somme += heuresFrontsDescendants[i] + (indexHFD + 1 - i) * TONE_LENGTH_MS;
    }
    let heureDebutPerformance = somme / (indexHFD); // toujours + 1 ici car voir schéma
    //let heureDebutDate = new Date(performance.timing.navigationStart + heureDebutPerformance);
    let delaiAvantEchantillonage = heureDebutPerformance - performance.now();
    console.log("Dernier bit de préambule détecté, début de l'échantillonnage dans " + delaiAvantEchantillonage);
    setTimeout(commencerEchantillonnage, delaiAvantEchantillonage);
    preambuleTermine = true;
  }

  if(!preambuleTermine){
    requestAnimationFrame(debuterEcoute);
  }
  
}

// décodage des fréquences :
function commencerEchantillonnage(){
  idEchantillonnage = setInterval(echantillonnage, TONE_LENGTH_MS);
}

function terminerEcoute(){
  preambuleTermine = false;
  clearInterval(idEchantillonnage); // arrêt de l'échantillonnage à intervalles réguliers
  idEchantillonnage = null;
  console.log("fin de l'échantillonnage.");
  index = 0;
  indexLettre = 0;
  //register = new Array();
  result = new Array();
  document.getElementById("result").innerText = "";

  preambuleHaut = false;
  heurePreambule = null;
  heuresFrontsMontants = [];
  indexHFM = 0; // HFM = temps fronts montants
  heuresFrontsDescendants = [];
  indexHFD = 0; // HFD = temps fronts descendants

  idEchantillonnage = null;
  frequencyDataEnCours = false;
}

let frequencyDataEnCours = false;
function echantillonnage(){
  const [maxFreq, amplitude] = getMaxFrequency();

  var lettreTemp = frequencyToChar(maxFreq);
  result[indexLettre] = lettreTemp;
  console.log(lettreTemp);
  indexLettre ++;
  console.log("échantillonnage... " + indexLettre);

  // détection du bit de fin
  if(amplitude >= seuil 
    && maxFreq > END_FREQ - marge 
    && maxFreq < END_FREQ + marge ){
      terminerEcoute();
  }
}

/*
function updateFrequencyData() {

  analyser.getByteFrequencyData(frequencyData);

  // mettre toutes les fréquences en-dessous de la fréquence min à 0
  

  // Find the index of the maximum value in the frequencyData array

  const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));
  maxFrequencyElement.textContent = `Max Frequency: ${maxIndex * frequencyResolution}`;
  maxFrequencyValueElement.textContent = `Max Frequency Value: ${frequencyData[maxIndex]}`;

  // détection du bit de fin
  
  /* Méthode qui mesure le temps de chaque bip
    // Détection du changement de fréquence
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
    index++;
  }
  */
  //requestAnimationFrame(updateFrequencyData);
  

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