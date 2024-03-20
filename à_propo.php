<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>À propos du projet</title>
    <link rel="stylesheet" href="style.css"> <!-- Assurez-vous d'avoir un fichier CSS pour le style -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>

</head>
<body>
    <header>
        <div class="header-text">
              <h1>À propos de notre projet</h1>
          </div>
    </header>
    <main>
        <section>
            <h2>Le Concept</h2>
            <p>
                Au cœur de notre projet se trouve la volonté d'innover dans le domaine de 
                la communication par ondes sonores, une technologie à la fois ancienne et profondément moderne.
                 En exploitant les capacités omniprésentes des appareils audio disponibles aujourd'hui, de simples haut-parleurs 
                 et microphones à des systèmes plus sophistiqués, nous visons à créer un protocole de communication qui transcende les 
                 limitations physiques et les contraintes de sécurité des méthodes conventionnelles. Ce projet n'est pas seulement une 
                 exploration technique; il s'agit d'une quête pour redéfinir comment les données peuvent être partagées de manière
                  invisible et harmonieuse dans notre environnement quotidien, ouvrant ainsi de nouvelles avenues pour l'intégration 
                  technologique dans des domaines aussi variés que l'Internet des objets (IoT), la sécurité des données, et l'accessibilité.
            </p>
        </section>
        <section>
            <h2>Les Technologies Utilisées</h2>
            <p>
                Notre projet tire parti d'une combinaison de technologies web frontales et backend pour faciliter la 
                communication via des ondes sonores. Au cœur de notre architecture, le HTML5 et CSS3 structurent et stylisent 
                l'interface utilisateur, tandis que JavaScript, notamment via l'API Web Audio, joue un rôle crucial dans la 
                génération et le traitement des signaux sonores.
            </p>
        </section>
        </main><section>
            <h2>Laisser un avis</h2>
        <form action="submit_comment.php" method="post">
            <label for="nom">Nom:</label><br>
            <input type="text" id="nom" name="nom" required><br>
            <label for="note">Note:</label><br>
            <input type="number" id="note" name="note" min="1" max="5" required><br>
            <label for="avis">Avis:</label><br>
            <textarea id="avis" name="avis" required></textarea><br>
            <input type="submit" value="Soumettre">
          </form>
        </section>
        <section>
            <h2> Avis :</h2>
            <?php
              $servername = "localhost";
              $username = "root"; // Utilisateur par défaut de XAMPP pour MySQL
              $password = ""; // Par défaut, XAMPP n'a pas de mot de passe pour MySQL
              $dbname = "avis"; // Assurez-vous que c'est le bon nom de base de données
          
              $conn = new mysqli($servername, $username, $password, $dbname);
          
              if ($conn->connect_error) {
                die("Connection failed: " . $conn->connect_error);
              }
          
              $sql = "SELECT ID, Nom, Note, Avis, Date FROM avis ORDER BY Date DESC";
              $result = $conn->query($sql);
          
              if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                  echo "<div class='avis'>";
                  echo "<h3>" . htmlspecialchars($row['Nom']) . "</h3>";
                  echo "<p>Note : " . str_repeat('★', $row['Note']) . "</p>";
                  echo "<p>" . nl2br(htmlspecialchars($row['Avis'])) . "</p>";
                  echo "<p>Posté le : " . $row['Date'] . "</p>";
                  echo "</div>";
                }
              } else {
                echo "<p>Aucun avis pour le moment.</p>";
              }
              $conn->close();
            ?>
          </section>
          
    </main>
    <footer id="contact" class="footer-a-propos">
        <p>&copy; 2024 <a href="mailto:guillaume.lincot@etud.univ-angers.fr">Guillaume Lincot</a> et <a href="mailto:thomas.boulineau@etud.univ-angers.fr">
            Thomas Boulineau</a>. Tous droits réservés.</p>
        <!-- Lien vers le projet GitHub -->
        <p>Consultez notre projet sur <a href="https://github.com/findert1/P1" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
    </footer>
    <script type="text/javascript" src="scritpavis.js"></script>
</body>
</html>
