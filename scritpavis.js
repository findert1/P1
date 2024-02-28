// lecture du ficher csv 

document.addEventListener('DOMContentLoaded', function() {
    fetch('Avis.csv')
      .then(response => response.text())
      .then(text => {
        const rows = text.split('\n').map(row => row.split(","));
        const html = rows.map(row => `<div class="avis">
          <h4>${row[1]}</h4>
          <p>Note : ${'★'.repeat(parseInt(row[2]))}</p>
          <p>${row[3]}</p>
          <p>Posté le : ${row[4]}</p>
        </div>`).join('');
        
        document.getElementById('liste-avis').innerHTML = html;
      })
      .catch(error => console.error('Erreur lors du chargement du fichier CSV:', error));
  });
  