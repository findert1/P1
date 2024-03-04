// Définir le traitement audio dans cette classe
class AudioWorkletProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      // Traitement audio ici
  
      return true; // Indique que le traitement a été effectué avec succès
    }
  }
  
  // Enregistrer le module de travail audio
  // Permet d'instancier la classe AudioWorkletProcessor
  registerProcessor('audio-worklet-processor', AudioWorkletProcessor);