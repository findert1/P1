document.addEventListener('DOMContentLoaded', function() {
    Papa.parse('Avis.csv', {
      download: true,
      header: true,
      complete: function(results) {
        const rows = results.data;
        const html = rows.map(row => {
          const nom = row.Nom ? row.Nom.trim() : '';
          const note = row.Note ? '★'.repeat(parseInt(row.Note.trim())) : '';
          const avis = row.Avis ? row.Avis.trim() : '';
          const date = row.Date ? row.Date.trim() : '';
  
          return `<div class="avis">
            <h4>${nom}</h4>
            <p>Note : ${note}</p>
            <p>${avis}</p>
            <p>Posté le : ${date}</p>
          </div>`;
        }).join('');
  
        document.getElementById('liste-avis').innerHTML = html;
      }
    });
  });
  