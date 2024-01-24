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
        const maxFrequencyValueElement = document.getElementById('max-frequency-value');

        function updateFrequencyData() {
          analyser.getByteFrequencyData(frequencyData);

          // Find the index of the maximum value in the frequencyData array

          const maxIndex = frequencyData.indexOf(Math.max(...frequencyData));

          // Display the value on the page
          maxFrequencyValueElement.textContent = `Max Frequency Value: ${maxIndex}`;

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