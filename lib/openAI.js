import { Configuration, OpenAIApi } from "openai";

let openai;

function initOpenAI() {
  if (!openai) {
    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    })
    openai = new OpenAIApi(configuration);
  }
  return openai;
}

export default initOpenAI;