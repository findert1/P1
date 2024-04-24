<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Communication par Onde sonores</title>
    <link rel="stylesheet" type="text/css" href="style.css">
</head>
<body>
    <div id="sidebarMenu" class="sidebar">
        <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">×</a>
        <a href="#" onclick="closeNav()">Accueil</a>
        <a href="#decodeur" onclick="closeNav()">Décodeur</a>
        <a href="#message" onclick="closeNav()">Envoyer un Message</a>
        <a href="à_propo.php" target="_blank" onclick="closeNav()">Description</a>
        <a href="#contact" onclick="closeNav()">Contact</a>
    </div>

    <div id="main">
        <header>
            <div class="header-text">
                <button class="openbtn" onclick="openNav()">☰ Menu</button>
                <h1>Communication par Ondes sonores</h1>
            </div>
        </header>

        <main>
            <section id="decodeur">
                <h2>Décodeur</h2>
                <h3>Analyse de fréquence</h3>
                <button id='start-button'>Start/stop</button>
                <p class="header-text">Utilisez le bouton "Start/stop" pour activer ou désactiver la capture de son.</p>
                <p id="max-frequency">Max frequency: </p>
                <p id="max-frequency-value">Max frequency value: </p>
            </section>
            
            <section>
                <h3>Fortes fréquences enregistrées:</h3>
                <p id="seuil"></p>
                <p id="freqMin"></p>
                <ul id="liste"></ul>
                <h4>Résultat: </h4>
                <p id="result">Le résultat s'affichera ici.</p>
                <form method="post">
                    <label for="prompt">Copiez le texte que vous souhaitez corriger ici</label><br>
                    <input type="text" id="prompt" name="prompt" required><br>
                    <button >Tenter de corriger la réponse avec l'IA"</button>
                </form>

                <?php
                if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['correct'])) {
                    $prompt = filter_input(INPUT_POST, 'prompt', FILTER_SANITIZE_STRING);
                    $url = 'http://localhost:11434/api/generate';

                    $data = array(
                        'model' => 'llama2',
                        'prompt' => $prompt
                    );

                    $data_string = json_encode($data);

                    $ch = curl_init($url);
                    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
                        'Content-Type: application/json',
                        'Content-Length: ' . strlen($data_string)
                    ));

                    $response = curl_exec($ch);
                    $err = curl_error($ch);
                    curl_close($ch);

                    if ($err) {
                        echo "Erreur cURL : " . $err;
                    } else {
                        $responseArray = json_decode($response, true);
                        if (isset($responseArray['response'])) {
                            echo "<p>Réponse complète de Llama 2:</p><pre>" . htmlspecialchars($responseArray['response']) . "</pre>";
                        } else {
                            echo "<p>Erreur : Aucune réponse reçue de l'API.</p>";
                        }
                    }
                }
                ?>
            </section>
        </main>

        <main>
            <div class="container">
                <div class="section-content">
                    <h2 id="message">Envoyer un Message</h2>
                    <input type="text" id="text-input" placeholder="Tapez quelque chose ici">
                    <button id="send-sound">Convertir et jouer le son</button>
                    <p id="displayDelai">Délai avant envoi: </p>
              </div>
            </div>

            <section>
                <h2>À propos des auteurs</h2>
                <p>Ce projet a été développé par Guillaume Lincot et Thomas Boulineau.</p>
            </section>

            <section>
                <h2>Informations sur le Projet</h2>
                <p>Ce projet vise à explorer les possibilités de communication via des ondes sonores en utilisant des technologies web modernes.</p>
            </section>
        </main>
    </div>

    <footer id="contact" class="footer-a-propos lien-interne">
        <p>&copy; 2024 <a href="mailto:guillaume.lincot@etud.univ-angers.fr">Guillaume Lincot</a> et <a href="mailto:thomas.boulineau@etud.univ-angers.fr">Thomas Boulineau</a>. Tous droits réservés.</p>
        <p>Consultez notre projet sur <a href="https://github.com/findert1/P1" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
    </footer>

    <script type="text/javascript" src="script.js"></script>
</body>
</html>
