import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

//TO use the dotenv variables we use dotenv.config()
dotenv.config();


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

//create an instance of openai
const openai = new OpenAIApi(configuration);

//Initialize express application
const app = express();
//This allows our server to be called from the frontend
app.use(cors());
//This allows us to pass JSON from frontend to the backend
app.use(express.json());

//You can not receive a lot of data from app.get
app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from Nirvana'
    })
});

//You can receiev all the data you want from app.post
app.post('/', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        
        const response = await openai.createCompletion({
            model:"text-davinci-003",
            prompt:`${prompt}`,
            temperature:0.7,
            max_tokens:3000,
            top_p:1,
            frequency_penalty:0,
            presence_penalty:0,
            stop:["\"\"\""]
        });

        res.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }
})

app.listen(5000, () => console.log('Server is running on  port http://127.0.0.1:5000/'));