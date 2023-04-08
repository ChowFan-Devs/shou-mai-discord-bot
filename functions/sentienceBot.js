const { Configuration, OpenAIApi } = require("openai");
const { openAiKey } = require('../config.json');
const { brain } = require('./sentienceBrain')

const fs = require("fs");
const historyFilePath = "./globalMessageHistory.json";

const configuration = new Configuration({
  apiKey: openAiKey,
});

const openai = new OpenAIApi(configuration);

async function readGlobalMessageHistory() {
    try {
        const data = fs.readFileSync(historyFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

async function saveGlobalMessageHistory(history) {
    const data = JSON.stringify(history);
    fs.writeFileSync(historyFilePath, data, "utf-8");
}

async function respondSentience(message) {
    const userID = message.author.id;
    const userMessage = message.content.replace("<@1093966109838946374>", "Shou Mai");

    const msgRef = await message.channel.send("Shou Mai is thinking...");

    message.channel.sendTyping();

    // Load global message history from the filesystem
    const globalMessageHistory = await readGlobalMessageHistory();

    // Add the new user message to the history
    globalMessageHistory.push({ role: "user", content: `${userID}: ${userMessage}` });

    // If the history length is more than 10, remove the oldest message
    if (globalMessageHistory.length > 10) {
        globalMessageHistory.shift();
    }

    const messages = [
        { role: "system", content: brain },
        { role: "user", content: "712437132240617572: Hello" },
        { role: "assistant", content: `{"GPT":"Hello there, how can I assist you today?","Shou":"Oh, it's Ghegi, the smart developer. What do you want?"}` },
        ...globalMessageHistory
    ];

    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
    });

    let response = completion.data.choices[0].message["content"];

    console.log(response);

    const jsonObject = JSON.parse(response);
    const shouValue = jsonObject["Shou"];

    // Add the response to the history
    globalMessageHistory.push({ role: "assistant", content: response });

    console.log(globalMessageHistory)
    // Save global message history to the filesystem
    saveGlobalMessageHistory(globalMessageHistory);

    msgRef.edit(shouValue);
}

module.exports = { respondSentience }