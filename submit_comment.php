<?php
$servername = "localhost";
$username = "root"; // Utilisateur par défaut de XAMPP pour MySQL
$password = ""; // Par défaut, XAMPP n'a pas de mot de passe pour MySQL
$dbname = "avis"; // Assurez-vous que c'est le bon nom de base de données

// Créez une connexion
$conn = new mysqli($servername, $username, $password, $dbname);

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