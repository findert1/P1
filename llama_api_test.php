<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Test API Llama 2</title>
</head>
<body>
    <h1>Test de l'API Llama 2</h1>
    <form action="llama_api_test.php" method="post">
        <label for="prompt">Question:</label><br>
        <input type="text" id="prompt" name="prompt" required><br>
        <input type="submit" value="Envoyer la question">
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['prompt'])) {
        $url = 'http://localhost:11434/api/generate';
    
        $data = array(
            'model' => 'llama2',
            'prompt' => $_POST['prompt'],
            'stream' => false,
             
        );

        $data_string = json_encode($data);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($data_string))
        );

       

$response = curl_exec($ch); // Assurez-vous que cette ligne est bien avant l'initialisation de $fullResponse
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo "Erreur cURL : " . $err;
} else {
    
    $fullResponse = "";

    
    //  $response contient quelque chose.
    if ($response) {
        // Séparation de la réponse brute en lignes
        $lines = explode("\n", $response);

        // Traitement de chaque ligne
        foreach ($lines as $line) {
            if (trim($line)) { // Vérifiez si la ligne n'est pas vide
                $part = json_decode(trim($line), true);
                if ($part && isset($part['response'])) {
                    $fullResponse .= $part['response'];
                    if (isset($part['done']) && $part['done']) {
                        // Si la partie contient "done":true, c'est la fin de la réponse
                        break;
                    }
                }
            }
        }
    }

    

                // Utilisation d'une expression régulière pour extraire le texte entre les guillemets
                preg_match('/"([^"]+)"/', $fullResponse, $matches);

                // $matches[1] contiendra le texte entre les guillemets si un match a été trouvé
                if (!empty($matches[1])) {
                    echo "<p>Correction :</p><pre>" . htmlspecialchars($matches[1]) . "</pre>";
                } else {
                    echo "<p>Aucune correction trouvée dans la réponse.</p>";
                }

                // ... [le reste du code]

                 // Affichez la réponse complète si elle existe, sinon affichez un message d'erreur
    if ($fullResponse) {
        echo "<p>Réponse complète de Llama 2:</p><pre>" . htmlspecialchars($fullResponse) . "</pre>";
    } else {
        echo "<p>Erreur : Aucune réponse reçue de l'API.</p>";
    }

                }





    }
    ?>
</body>
</html>

