<?php

$servername = "localhost";
$username = "root"; // Utilisateur par défaut de XAMPP pour MySQL
$password = ""; // Par défaut, XAMPP n'a pas de mot de passe pour MySQL
$dbname = "avis"; // Assurez-vous que c'est le bon nom de base de données

// Créez une connexion
$conn = new mysqli($servername, $username, $password, $dbname);
    
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
