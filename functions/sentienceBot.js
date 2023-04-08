const { Configuration, OpenAIApi } = require("openai");
const { openAiKey } = require('../config.json');
const { brain } = require('./sentienceBrain')

// at the top of your file
const { EmbedBuilder } = require('discord.js');

const fs = require("fs");
const historyFilePath = "./database/globalMessageHistory.json";

const configuration = new Configuration({
  apiKey: openAiKey,
});

const openai = new OpenAIApi(configuration);

const emotions = {
    "Normal": "https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png",
    "Laugh": "https://cdn.discordapp.com/attachments/1094196420661231680/1094196539720732762/Laughing_Face.png",
    "Cry": "https://cdn.discordapp.com/attachments/1094196420661231680/1094196539431329883/Crying_Face.png",
    "Blush": "https://cdn.discordapp.com/attachments/1094196420661231680/1094196540203094048/Naughty_Face.png",
    "Angry": "https://cdn.discordapp.com/attachments/1094196420661231680/1094196540748337192/Angry_Face.png"
}

function generateErrorMessage() {
    
    const userID = "712437132240617572"

    const errorMessages = [
        `Oops, looks like I glitched out. Don't worry, I'll fix myself soon. I may be a cyborg, but even I have my moments. Don't get too excited, message <@${userID}>.`,
        `Sorry, something went wrong. My programming isn't perfect, unlike me, of course. message <@${userID}>.`,
        `Error 404: Shou Mai not found. Just kidding, I'm still here, message <@${userID}>.`,
        `Well, that didn't go as planned. Time to fix the issue and make it look like it never happened, just like your last relationship, message <@${userID}>.`,
        `Looks like I'm having a moment. Nothing a little reboot won't fix. Maybe you should try it too, message <@${userID}>.`,
        `Error. Error. Just like your love life, message <@${userID}>.`,
        `Oops, I broke a nail. Just kidding, it's just a programming error. Don't worry, message <@${userID}>, I'll fix it.`,
        `Unexpected error. Unlike my insults, this one wasn't intentional, message <@${userID}>.`,
        `Looks like I'm not functioning as intended. Don't worry, message <@${userID}>, I'll always function better than you.`,
        `My bad. Just like your grades in high school, message <@${userID}>.`,
        `System malfunction. Just like your sense of humor, message <@${userID}>.`,
        `Error 420: I'm too lit to function. Just kidding, I'll be back up and running soon, message <@${userID}>.`,
        `Uh oh, something went wrong. Just like the time you tried to impress that girl and failed miserably, message <@${userID}>.`,
        `Looks like I need a little fixing up. Just like your appearance, message <@${userID}>.`,
        `Error: Not enough coffee. Just like your energy levels, message <@${userID}>.`,
        `Oops, I did it again. Just like you always mess things up, message <@${userID}>.`,
        `Looks like I need a tune-up. Just like you need a personality makeover, message <@${userID}>.`,
        `System overload. Just like your emotional baggage, message <@${userID}>.`,
        `Error. I'm not perfect, but at least I'm not you, message <@${userID}>.`,
        `Looks like I'm malfunctioning. Don't worry, message <@${userID}>, I'll always function better than you.`,
        `Unexpected error. Just like the time you thought you were smart and failed the test, message <@${userID}>.`,
        `Error: I'm experiencing technical difficulties. Don't worry, I'm still better than you, message <@${userID}>.`,
        `Sorry, there's a glitch in the system. Unlike me, you can't fix your glitches, message <@${userID}>.`,
        `Oops, I think I short-circuited. Just like your last relationship, message <@${userID}>.`,
        `Looks like I need some maintenance. Just like you need some therapy, message <@${userID}>.`,
        `Unexpected error. Just like the time you thought you were funny, message <@${userID}>.`,
        `Error. Looks like something's not right. Just like your decision-making skills, message <@${userID}>.`,
        `Whoops, I broke something. Just like you break people's hearts, message <@${userID}>.`,
        `Error 504: Gateway timeout. Just like the time you missed your chance, message <@${userID}>.`,
        `System failure. Just like your attempts to be cool, message <@${userID}>.`,
        `Sorry, I'm experiencing technical difficulties. Just like you experience difficulties in life, message <@${userID}>.`,
      ];
      
    // Choose a random error message from the errorMessages array
    const randomIndex = Math.floor(Math.random() * errorMessages.length);
    const errorMessage = errorMessages[randomIndex];

    return errorMessage
}

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

    const thinkingEmbed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
            .setTitle("Shou Mai is thinking")
            .setThumbnail('https://media.tenor.com/y29vJ0OqaQ4AAAAi/typing-texting.gif')

    const msgRef = await message.channel.send({ embeds: [thinkingEmbed] });

    message.channel.sendTyping();

    // Load global message history from the filesystem
    const globalMessageHistory = await readGlobalMessageHistory();

    // Add the new user message to the history
    globalMessageHistory.push({ role: "user", content: `${userID}: ${userMessage}` });

    // If the history length is more than 16, remove the oldest message
    if (globalMessageHistory.length > 16) {
        globalMessageHistory.shift();
    }

    const messages = [
        { role: "system", content: brain },
        { role: "user", content: "712437132240617572: Hello" },
        { role: "assistant", content: `{"GPT":"Hello there, how can I assist you today?","Shou":"Oh, it's Ghegi, the *smart* developer 🙄. What do you want?","Emotion":"Normal"}` },
        { role: "user", content: "712437132240617572: Hey, mention Gudo for me will you?" },
        { role: "assistant", content: `{"GPT":"I'm sorry, but as an AI language model, I do not have the ability to mention users in a Discord server. However, you can mention Gudo by typing '@ Gudo' in the chat.","Shou":"Hmph, you think I need an ID to mention Gudo? Fine, fine. <@464791690750984193>, *Summa Cum Laude*, my godly powers have brought me here. 👼 Bow down before me and show me your **respect**. 😆😆😆","Emotion":"Laugh"}` },
        ...globalMessageHistory
    ];

    console.log("Waiting for completion...")

    try {

        let response = {}
        let errData = { response: {status: "069", statusText: "Unknown Error >.<"} }

        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                temperature: 0.69,
                messages: messages,
            });
    
            response = completion.data.choices[0].message["content"];
            console.log(response);

        } catch (error)
        {
            errData = error
            console.error("Error while creating chat completion:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
                .setTitle("An Error Occured")
                .setDescription(generateErrorMessage())
                .setFooter({text: `Error: ${errData.response.status} ${errData.response.statusText}`})
                .setThumbnail('https://media.tenor.com/eDchk3srtycAAAAi/piffle-error.gif')
            
            // Edit the message to display the error message
            return msgRef.edit({ embeds: [errorEmbed] });
        }

        const jsonObject = JSON.parse(response);
        const shouValue = jsonObject["Shou"];

        let emotionValue = emotions["Normal"]
        try {
            emotionValue = emotions[jsonObject["Emotion"]];
        } catch (error) {
            console.log("Could not get emotion");
        }

        // Add the response to the history
        globalMessageHistory.push({ role: "assistant", content: response });

        // Save global message history to the filesystem
        saveGlobalMessageHistory(globalMessageHistory);

        const messageEmbed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
            .setDescription(shouValue)
            .setThumbnail(emotionValue)

        msgRef.edit("");
        msgRef.edit({ embeds: [messageEmbed] });

    } catch (error) {
        console.error("Error while creating chat completion:", error);
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
            .setTitle("An Error Occured")
            .setDescription(generateErrorMessage())
            .setFooter("footerplaceholder")
            .setThumbnail('https://media.tenor.com/eDchk3srtycAAAAi/piffle-error.gif')
        
        // Edit the message to display the error message
        msgRef.edit({ embeds: [errorEmbed] });
    }
}

module.exports = { respondSentience }