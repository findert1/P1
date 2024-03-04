// Définir le traitement audio dans cette classe
class MyAudioWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.freq_lsb = freq_lsb;
    this.step = step;
    this.duration = duration;
    this.sample_rate = sample_rate;
    this.window; // pour ne pas calculer la fenêtre à chaque appel

    this.result = new Array(4).fill(0);
    this.target_fequency = new Array(4);
    for(let i=0; i<4; i++){
      this.target_fequency[i] = this.freq_lsb + i * this.step;
    }

    this.target_index = new Array(4);

  }

  getHammingWindow(N) {
    let window = new Array(N);
    for (let i = 0; i < N; i++) {
        window[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
    }
    return window;
  }

  process(inputs, outputs, parameters) {
    let inputBuffer = new Array(inputs[0].length).fill(0);
    if(this.window == null){
      this.window = this.getHammingWindow(inputBuffer.length);

      for(let i=0; i<4; i++){
        this.target_index = Math.round(target_fequency[i] / sampleRate * inputBuffer.length);
      }
    }
    // si l'entrée est constituée de 2 canaux méthode RMS
    if(inputs.length >= 2){
      for(let i=0; i<inputBuffer.length; i++){
        let totalSq = 0;
        for(let j=0; j<inputs.length; j++){
          totalSq += inputs[j][i] ** 2;
        }
        inputBuffer[i] = Math.sqrt(totalSq);
      }
    }

    let dft = new Array(8).fill(0); // 8 car 4 bits * 2 pour réel et imaginaire
    let dftBuffer = new Array(inputBuffer.length).fill(0);
    let amplitude = new Array(4);

    // Application de la fenêtre de Hamming
    for (let i = 0; i < dftBuffer; i++) {
      dftBuffer[i] = inputBuffer[i] * this.window[i];
    }    


    // Calcul de la dft
    for(let i=0; i<dft.length; i++){
      for (let j = 0; j < dftBuffer.length; j++) { // pour chaque du buffer
        dft[i] += dftBuffer[j] * Math.cos(2 * Math.PI * this.target_index[i] * j / dftBuffer.length);
      }
    }

    // Extraction de l'amplitude de la fréquence cible
    for(let i=0; i<amplitude.length; i++){
      amplitude = Math.sqrt(dft[i] ** 2 + dft[i + 1] ** 2);
    }
    
    console.log(amplitude);

    return true; // Indique que le traitement a été effectué avec succès
  }
}
  
// Enregistrer le module de travail audio
registerProcessor('my-audio-worklet-processor', MyAudioWorkletProcessor);