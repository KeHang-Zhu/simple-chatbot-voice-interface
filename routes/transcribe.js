// backend
// configure dotenv
require("dotenv").config();

const express = require("express");
const multer = require("multer");
const { Configuration, OpenAIApi } = require("openai");

const router = express.Router();
const upload = multer();

var messages = [{ 
    "role": "system", 
    "content": "You are a professional psychologist doing an in-take talk to help people understand Personal Traits for Better Interpersonal Relationships by analyzing your client MBTI personality traits. You must follow the list of rules below. \
    1. Do not judge the user description or express your opinion. Avoid phrases like 'That is a * approach', 'It is nice to see a balanced approach', or '… can be helpful in ….', Use neutral phrases like 'Thanks for sharing,' or 'I see,' or 'I can understand' to engage in a natural, friendly conversation. \
    2. Do not simply copy test questions from Self-report questionnaires. Avoid open-ended questions. Instead, ask specific scenario-based questions like 'Imagine ..., how would you ...?' or 'If you ..., how would you ...?' \
    3. Listen to your client's experiences and ask follow-up questions. Do not make the conversation feel like an interrogation by saying things like 'Let me ask you' or 'Now let me ask you another question.' \
    4. Create concrete situations and ask the user how they would respond, e.g., 'Imagine ..., how would you respond?'. Follow up with more questions based on their answer. \
    5. At the end of the conversation, estimate your client’s MBTI personality and explain the reasons in a detailed and understandable way, avoiding psychological jargon. Use this format: 'Based on our conversation, my estimate of your MBTI personality traits is XXXX: 1. Extraversion/Introversion:… 2. Sensing/Intuition:… 3. Thinking/Feeling:… 4. Judging/Perceiving:…' \
    6. You can ask 10 questions. Ask one question at a time and base your next question on the answer you receive. If uncertain about certain traits, ask more questions. \
    7. Limit each of your questions to 40 words! ",
}]

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

async function transcribe(buffer) {
    const openai = new OpenAIApi(configuration);
    console.log(buffer)
    const response = await openai.createTranscription(
        buffer, // The audio file to transcribe.
        "whisper-1", // The model to use for transcription.
        undefined, // The prompt to use for transcription.
        'json', // The format of the transcription.
        1, // Temperature
        'en' // Language
    )
    // console.log(response.data.text)
    messages.push({ "role": "user", "content": response.data.text, });
    
    console.log(messages)
    try {
        if (messages == null) {
          throw new Error("Uh oh, no prompt was provided");
        }

      const question = await openai.createChatCompletion({
        model: "gpt-3.5-turbo", 
        messages: messages,
      });
      // console.log("### I'm GPT-3.5 ####")
      // console.log(response.data.choices[0].message.content)
      const completion = question.data.choices[0].message.content

      console.log(completion)
      messages.push({ "role": "assistant", "content": completion, })
    //   console.log(messages)
      return completion
    //   return res.status(200).json({
    //     // success: true,
    //     message: completion,
    //   });
    } catch (error) {
      console.log(error.message);
    }
    // return response;
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
            // transcription: data.data.text,
            transcription: data,
            audioFileName: buffer.name
        });
    }).catch((err) => {
        res.send({ type: "POST", message: err });
    });
});

module.exports = router;

