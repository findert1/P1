document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        //analyser.connect(audioContext.destination);
        analyser.fftSize = 16384;

        const bufferLength = analyser.frequencyBinCount;
        const frequencyData = new Uint8Array(bufferLength);

        // Get the reference to the HTML element where you want to display the max frequency value
        const maxFrequencyElement = document.getElementById('max-frequency');
        const maxFrequencyValueElement = document.getElementById('max-frequency-value');

        const seuil = 230;

        const seuilElement = document.getElementById('seuil');
        seuilElement.textContent = `Seuil : ${seuil}`;

        function updateFrequencyData() {
          analyser.getByteFrequencyData(frequencyData);

          // Find the index of the maximum value in the frequencyData array

          const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));

          // Display the value on the page
          maxFrequencyElement.textContent = `Max Frequency: ${maxIndex}`;
          maxFrequencyValueElement.textContent = `Max Frequency Value: ${frequencyData[maxIndex]}`;

          if(frequencyData[maxIndex] > seuil){
            var node = document.createElement('li');
            node.appendChild(document.createTextNode(`${maxIndex}`));
            document.querySelector('ul').appendChild(node);  
          }
          
          // Schedule the next update
          requestAnimationFrame(updateFrequencyData);
        }

        document.getElementById('start-button').addEventListener('click', () => {
          audioContext.resume().then(() => {
            console.log('AudioContext is now allowed to start.');
            updateFrequencyData();
          });
        });
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
  });