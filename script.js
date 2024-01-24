navigator.getUserMedia = navigator.getUserMedia ||     
   navigator.webkitGetUserMedia ||     
   navigator.mozGetUserMedia ||     
   navigator.msGetUserMedia;    
navigator.getUserMedia(     
{     
   audio: true     
},     
function (e) {     
   // success     
},     
function (e) {     
   // error     
   console.error(e);     
});

var context = new AudioContext()
var o = context.createOscillator()
o.type = "sine"
o.connect(context.destination)
o.start()

document.getElementById('play-sound').addEventListener('click', function() {
    var audioContext = new AudioContext();
    var oscillator = audioContext.createOscillator();
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Fréquence en Hz (La à 440Hz)
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1); // Joue le son pendant 1 seconde
});
