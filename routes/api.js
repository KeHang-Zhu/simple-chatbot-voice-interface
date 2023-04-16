// backend
// configure dotenv
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const { Configuration, OpenAIApi } = require("openai");

const router = express.Router();
const upload = multer();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

async function transcribe(buffer) {
    const openai = new OpenAIApi(configuration);
    console.log("here I fetch the OPEN AI")
    console.log(buffer)
    const response = await openai.createTranscription(
        buffer, // The audio file to transcribe.
        "whisper-1", // The model to use for transcription.
        undefined, // The prompt to use for transcription.
        'json', // The format of the transcription.
        1, // Temperature
        'en' // Language
    )
    // console.log(response)
    return response;
}

// We use sendFile to send an HTML file which contains our form where users can upload the audio files.
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "index.html"));
});

router.post("/", upload.any('file'), (req, res) => {
    audio_file = req.files[0];
    //create a buffer from the audio file, which would contain the audio file's data in a format that can be sent to the OpenAI API.
    buffer = audio_file.buffer;

    //We then set a name to the buffer using the original
    // TODO
    buffer.name = audio_file.originalname;
    const response = transcribe(buffer);

    // send a JSON back to the client. 
    // send the transcription and the audio file name back to the frontend. 
    response.then((data) => {
        res.send({ 
            type: "POST", 
            transcription: data.data.text,
            audioFileName: buffer.name
        });
    }).catch((err) => {
        res.send({ type: "POST", message: err });
    });
});

module.exports = router;

