// Définir le traitement audio dans cette classe

//import * from AudioWorkletProcessor;

class MyAudioWorkletProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    console.log("Construction de l'instance du processing du son...");
    // constantes pour les calculs
    this.freq_lsb = 1000;
    this.step = 666;
    this.duration = 0.5;

    this.setup = false;
  
    this.window; // pour ne pas calculer la fenêtre à chaque appel
    this.result = new Array(4).fill(0);
    this.target_fequency = new Array(4);
    this.target_index = new Array(4);

    this.port.onmessage = this.handleMessage.bind(this);

    console.log("Instance processing déclarée");
    console.log("Sample rate : " + sampleRate);
  }

  handleMessage(event){
    const message = event.data;
    this.port.postMessage({ result: message.result });
  }

  setHammingWindow(N) {
    console.log("Calcul de la fenêtre de Hamming...");
    this.window = new Array(N);
    for (let i = 0; i < N; i++) {
        this.window[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
    }
    console.log("Fenêtre de Hamming : " + this.window);
    console.log("Taille : " + this.window.length);
  }

  setTargetFrequencies(N){
    console.log("Remplissage du tableau des fréquences cible...");
    for(let i=0; i<4; i++){
      this.target_fequency[i] = this.freq_lsb + this.step * i;
    }
    console.log("Fréquences cible : " + this.target_fequency);

    console.log("Remplissage du tableau des index cible...");
    for(let i=0; i<4; i++){
      this.target_index[i] = Math.round(this.target_fequency[i] / sampleRate * N);
    }
    console.log("Indices cible : " + this.target_index);
  }

  calculDFT(input){
    var N = input.length;
    var dftReal = new Array(N);
    var dftImag = new Array(N);

    for (var k = 0; k < N; k++) {
        for (var n = 0; n < N; n++) {
            var theta = (2 * Math.PI * k * n) / N;
            dftReal[k] += input[n] * Math.cos(theta);
            dftImag[k] -= input[n] * Math.sin(theta);
        }
    }

    return [dftReal, dftImag];
  }

  calculFrequences(sampleRate, N) {
    var frequencies = new Array(N);
    for (var k = 0; k < N; k++) {
        frequencies[k] = (k * sampleRate) / N;
    }
    return frequencies;
  }

  calculAmplitude(dftReal, dftImag) {
    var magnitude = new Array(dftReal.length);
    for (var i = 0; i < dftReal.length; i++) {
        magnitude[i] = Math.sqrt(dftReal[i] * dftReal[i] + dftImag[i] * dftImag[i]);
    }
    return magnitude;
}

  process(inputs, outputs, parameters) {
    //console.log(inputs[0][0]);
    let inputBuffer = new Array(inputs[0][0].length).fill(0);
    if(!this.setup){
      console.log("Initialisation process...");
      this.setHammingWindow(inputBuffer.length);
      this.setTargetFrequencies(inputBuffer.length);
      this.setup = true;
      console.log("Fin du process d'initialisation.");
    }

    // si l'entrée est constituée de 2 canaux méthode RMS
    //console.log("Nombre d'entrées : " + inputs.length); 
    // 1 entrée
    //console.log("Nombre de canaux d'entrée : " + inputs[0].length);
    
    // 2 canaux d'entrée
    if(inputs[0].length > 1){
      for(let i=0; i<inputBuffer.length; i++){
        let totalSq = 0;
        for(let j=0; j<inputs[0].length; j++){
          totalSq += inputs[0][j][i] ** 2;
        }
        inputBuffer[i] = Math.sqrt(totalSq);
      }
    }

    //console.log("Input buffer : " + inputBuffer);

    let dft = new Array(8).fill(0); // 8 car 4 bits * 2 pour réel et imaginaire
    let dftBuffer = new Array(inputBuffer.length).fill(0);
    let amplitude = new Array(4);

    // Application de la fenêtre de Hamming
    for (let i = 0; i < dftBuffer.length; i++) {
      dftBuffer[i] = inputBuffer[i] * this.window[i];
    }
    //console.log("dftBuffer : " + dftBuffer);

    // Calcul de la dft
    //let [dftReal, dftImag] = this.calculDFT(dftBuffer);
    //console.log("dftReal : " + dftReal);
    //console.log("dftImag : " + dftImag);

    // Extraction de l'amplitude de chaque fréquence
    //let amplitude = this.calculAmplitude(dftReal, dftImag);

    
    for(let i=0; i<dft.length; i++){
      for (let j = 0; j < dftBuffer.length; j++) { // pour chaque du buffer
        dft[i] += dftBuffer[j] * Math.cos(2 * Math.PI * this.target_index[Math.floor(i/2)] * j / dftBuffer.length);
      }
    }
    //console.log(dft);

    // Extraction de l'amplitude de la fréquence cible
    for(let i=0; i<amplitude.length; i++){
      let val = Math.sqrt(dft[i] ** 2 + dft[i + 1] ** 2);
      amplitude[i] = val * 100;
    }
    
    //console.log(amplitude);

    this.port.postMessage({ result: amplitude });
    //console.log(amplitude);

    return true;
  }
}
  
// Enregistrer le module de travail audio
registerProcessor("my-audio-worklet-processor", MyAudioWorkletProcessor);
//export default MyAudioWorkletProcessor;

//https://github.com/WebAudio/web-audio-api/issues/1942