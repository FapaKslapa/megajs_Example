import {createRequire} from "module";
import {fileURLToPath} from 'url';
import {dirname} from 'path';
import {megaFunction} from "./server/mega.js";
import multer from 'multer';

const require = createRequire(import.meta.url);
const express = require('express');
const path = require('path');
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Utilizza il middleware express.json() per analizzare le richieste JSON
app.use(express.json());
// Fornisce la cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // limita la dimensione del file a 5MB
    },
    allowUploadBuffering: true, // abilita il buffering del file
});
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file; // Accedi al file caricato
        const fileName = path.basename(file.originalname); // Estrai solo il nome del file
        const link = await megaFunction.uploadFileToStorage(fileName, file.buffer); // Carica il file su Mega
        console.log('File caricato con successo. Path: ', fileName);
        res.status(200).json({"Result": fileName, "link": link}); // Restituisci solo il nome del file e il link
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore del server');
    }
});

app.post('/download', async (req, res) => {
    const link = req.body.mega;
    const name = req.body.name;
    try {
        const {stream, fileName} = await megaFunction.downloadFileFromLink(link); // Scarica il file da Mega
        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
        stream.pipe(res); // Invia il flusso di dati al client
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore del server');
    }
});