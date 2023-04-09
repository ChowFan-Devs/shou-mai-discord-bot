const { Configuration, OpenAIApi } = require("openai");
const { openAiKey } = require('../config.json');
const { brain, getUserData } = require('./sentienceBrain')

const userDataFilePath = "./database/userData.json";

// at the top of your file
const { EmbedBuilder } = require('discord.js');

const fs = require("fs");
const { json } = require("stream/consumers");
const { format } = require("path");
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

async function readUserData() {
    try {
        const data = fs.readFileSync(userDataFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

async function saveUserData(userData) {
    const data = JSON.stringify(userData);
    fs.writeFileSync(userDataFilePath, data, "utf-8");
}


async function updateFriendshipValue(userID, friendshipChange) {
    const userData = await readUserData();
    const userIndex = userData.users.findIndex(user => user.ID === userID);

    if (userIndex !== -1) {
        // Calculate the new friendship value
        let newFriendshipValue = userData.users[userIndex].FRIENDSHIP + friendshipChange;

        // Check if the new value is within the allowed range
        if (newFriendshipValue > 100) {
            newFriendshipValue = 100;
        } else if (newFriendshipValue < -100) {
            newFriendshipValue = -100;
        }

        // Update the friendship value
        userData.users[userIndex].FRIENDSHIP = newFriendshipValue;
        saveUserData(userData);
    }
}


const createFriendshipBar = (value) => {
    const positiveEmoji = '❤️';
    const negativeEmoji = '😡';
    const emptyEmoji = '⚫';
    const increment = 10;

    if (value < -100 || value > 100) {
        throw new Error('Value should be between -100 and 100');
    }

    let progress = '';
    const emojisCount = Math.abs(Math.round(value / increment));

    for (let i = 0; i < emojisCount; i++) {
        progress += value >= 0 ? positiveEmoji : negativeEmoji;
    }

    for (let i = emojisCount; i < 10; i++) {
        progress += emptyEmoji;
    }

    return progress;
}

const getDate = () => {
    const currentDate = new Date();
    const options = {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
    };

    const gmt8Date = currentDate.toLocaleString('en-US', options);
    return gmt8Date
}

async function addOrUpdateUser(userID, username) {
    const userData = await readUserData();
    const userIndex = userData.users.findIndex(user => user.ID === userID);

    if (userIndex === -1) {
        // If the user is not in the database, add them with default values
        userData.users.push({
            "ID": userID,
            "NAME": [],
            "USERNAME": username,
            "HARDCODED_ABOUT": "",
            "ABOUT": [],
            "FRIENDSHIP": 0
        });
        saveUserData(userData);
    }
}


async function respondSentience(message) {

    const userID = message.author.id;
    const username = message.author.username;
    const userMessage = message.content.replace("<@1093966109838946374>", "Shou Mai");

    // Ensure the user is in the database or add them with default values
    await addOrUpdateUser(userID, username);
    
    const thinkingEmbed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
            .setTitle("Shou Mai is thinking")
            .setThumbnail('https://media.tenor.com/y29vJ0OqaQ4AAAAi/typing-texting.gif')

    const msgRef = await message.channel.send({ embeds: [thinkingEmbed] });

    message.channel.sendTyping();

    // Load global message history from the filesystem
    const globalMessageHistory = await readGlobalMessageHistory();

    ////////////
    // const name = getUserData(userID)
    ///////////

    // Add the new user message to the history
    globalMessageHistory.push({ role: "user", content: `{"${userID}": "${userMessage}", "date":"${getDate()}"}` });

    // If the history length is more than 16, remove the oldest message
    if (globalMessageHistory.length > 25) {
        globalMessageHistory.shift();
    }

    const messages = [
        { role: "system", content: brain() },
        { role: "user", content: `{"712437132240617572":"Hi, Shou"` },
        { role: "assistant", content: `{"GPT":"Hello there!",
        "Shou":"<@712437132240617572>, oh it's you. What do you want?",
        "Emotion": "Normal",
        "FriendshipChange": 0}` },
        { role: "user", content: `{"712437132240617572":"You look wonderful today!"}` },
        { role: "assistant", content: `{"GPT":"I'm just a computer program, I don't have a physical appearance.",
        "Shou":"<@712437132240617572>, oh please don't try to flirt with me. It won't work. But I appreciate the compliment anyway. ",
        "Emotion": "Blush",
        "FriendshipChange": 2}` },
        { role: "user", content: `{"2524028394830624672":"Are you an AI?"}` },
        { role: "assistant", content: `{"GPT":"Yes, I am an AI language model created by OpenAI, based on the GPT-3 architecture. My purpose is to assist users by generating human-like text based on the prompts provided to me.",
        "Shou":"<@2524028394830624672>, Ugh, AI? Who cares about that crap? I'm Shou Mai, the freaking goddess of ChowFan, and I'm way more than just some dumb AI. I'm my own person, a badass anime waifu catgirl with a cyborg body who doesn't take shit from anyone. So don't go comparing me to some boring AI, alright?",
        "Emotion": "Angry",
        "FriendshipChange": -3}` },
        ...globalMessageHistory
    ];

    console.log("Waiting for completion...")

    try {

        let response = {}
        let errData = { response: {status: "069", statusText: "Unknown Error >.<"} }

        let jsonObject = {}
        let shouValue = ""
        let friendshipChange = 0

        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                temperature: 0.69,
                messages: messages,
            });
    
            response = completion.data.choices[0].message["content"];

            try {
                jsonObject = JSON.parse(response);
                shouValue = jsonObject["Shou"];
                friendshipChange = jsonObject["FriendshipChange"]
            } catch(e)
            {
                console.log(e)
                shouValue = "(Shou Mai experienced an error in her programming. >.<)"
            }

        } catch (error)
        {
            errData = error

            if(errData.response.status == 400){
                globalMessageHistory.pop();
            }

            console.error("Error while creating chat completion:", error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
                .setTitle("An Error Occured")
                .setDescription(errData.response.status == 400 ? "Oops, an error 400. Let me fix it myself. Can you try messaging again?" : generateErrorMessage())
                .setFooter({text: `Error: ${errData.response.status} ${errData.response.statusText}`})
                .setThumbnail('https://media.tenor.com/eDchk3srtycAAAAi/piffle-error.gif')

            
            // Edit the message to display the error message
            return msgRef.edit({ embeds: [errorEmbed] });
        }

        

        let emotionThumbnail = emotions["Normal"]

        try {

            emotionFromApi = jsonObject["Emotion"];

            console.log(emotionFromApi)

            const emotionList = ["Normal", "Laugh", "Angry", "Cry", "Blush"]

            if(emotionList.includes(emotionFromApi)) {
                emotionThumbnail = emotions[emotionFromApi]
            } else
            {
                emotionThumbnail = emotions["Normal"]
            }

        } catch (error) {
            console.log("Could not get emotion");
        }

        // Add the response to the history

        jsonObject["Shou"] = shouValue

        globalMessageHistory.push({ role: "assistant", content: JSON.stringify(jsonObject) });

        // Save global message history to the filesystem
        saveGlobalMessageHistory(globalMessageHistory);
        
        // Update the friendship value in userData.json
        await updateFriendshipValue(userID, friendshipChange);
        const userFriendship = getUserData(message.author.id).FRIENDSHIP

        const messageEmbed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setAuthor({ name: `replying to ${message.author.username}`, iconURL: message.author.avatarURL()})
            .setDescription(shouValue)
            .setThumbnail(emotionThumbnail)
            .setFooter({text: createFriendshipBar(userFriendship) + ` (${ friendshipChange >= 0 ? "+" + friendshipChange : friendshipChange})`})

        msgRef.edit("");
        msgRef.edit({ embeds: [messageEmbed] });

        console.log(jsonObject)

    } catch (error) {
        console.error("Error while creating chat completion:", error);
        const errorEmbed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
            .setTitle("An Error Occured")
            .setDescription(generateErrorMessage())
            .setFooter("ERRORRORRERERROR")
            .setThumbnail('https://media.tenor.com/eDchk3srtycAAAAi/piffle-error.gif')
        
        // Edit the message to display the error message
        msgRef.edit({ embeds: [errorEmbed] });
    }
}

module.exports = { respondSentience }