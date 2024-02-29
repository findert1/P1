<?php

$servername = "localhost"; // ou "127.0.0.1", ce qui est l'adresse de localhost
$port = 3306; // Le port par défaut pour MySQL, changez-le si nécessaire
$username = "guillaumelincot8701";
$password = "1Wv2i2DVWata";
$dbname = "guillaumelincot8701"; // Assurez-vous que c'est le bon nom de base de données

// Créez une connexion
$conn = new mysqli($servername, $username, $password, $dbname, $port);
    
    // Définissez le mode d'erreur PDO sur Exception
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

 // Récupération des avis depuis la base de données
$sql = "SELECT ID, Nom, Note, Avis, Date FROM avis";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  // Affichage des données de chaque ligne
  while($row = $result->fetch_assoc()) {
    echo "ID: " . $row["ID"]. " - Nom: " . $row["Nom"]. " - Note: " . $row["Note"]. " - Avis: " . $row["Avis"]. " - Date: " . $row["Date"]. "<br>";
  }
} else {
  echo "0 avis trouvés";
}
$conn->close();
?>
