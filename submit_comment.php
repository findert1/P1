<?php
$servername = "localhost"; // ou "127.0.0.1", ce qui est l'adresse de localhost
$port = 3306; // Le port par défaut pour MySQL
$username = "guillaumelincot8701";
$password = "1Wv2i2DVWata";
$dbname = "guillaumelincot8701"; // Assurez-vous que c'est le bon nom de base de données

// Créez une connexion
$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// Si des données POST existent, traiter la soumission du formulaire
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nom = $conn->real_escape_string($_POST['nom']);
    $note = $conn->real_escape_string($_POST['note']);
    $avis = $conn->real_escape_string($_POST['avis']);
    $date = date('Y-m-d');

    $stmt = $conn->prepare("INSERT INTO avis (Nom, Note, Avis, Date) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("siss", $nom, $note, $avis, $date);

    if ($stmt->execute()) {
      echo "New record created successfully";
    } else {
      echo "Error: " . $stmt->error;
    }

    $stmt->close();
}

// Afficher les avis existants


$conn->close();
?>
<p> votre avis à été pris en compte </p>
<a href="à_propo.php"> retour</a>