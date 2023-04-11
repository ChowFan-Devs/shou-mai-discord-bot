const { Configuration, OpenAIApi } = require("openai");
const { openAiKey } = require('../config.json');
const { brain, getUserData } = require('./sentienceBrain')


// at the top of your file
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

const fs = require("fs");
const historyFilePath = "./database/globalMessageHistory.json";
const userDataFilePath = "./database/userData.json";
const tokenFilePath = "./database/tokenData.json";
const shouImagesFilePath = "./database/shouImages.json"

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');

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

const shouImageTypes = ["Laugh", "Angry", "Cry", "Flirty"]

async function readShouImages() {
    try {
        const data = fs.readFileSync(shouImagesFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.log(err)
        return {};
    }
}

const getShouImage = async(shouImageType) => {
    const shouImages = await readShouImages();
    const shouImageArray = shouImages[shouImageType];
    
    // Get a random index within the range of the array's length
    const randomIndex = Math.floor(Math.random() * shouImageArray.length);
    
    // Return a random string from the array
    return shouImageArray[randomIndex];
  };

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

const generateErrorEmbed = async() => {
    
    const shouMaiCryURL = await getShouImage("Cry")

    const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
        .setTitle("An Error Occured")
        .setDescription(generateErrorMessage())
        .setThumbnail('https://media.tenor.com/eDchk3srtycAAAAi/piffle-error.gif')
        .setImage(shouMaiCryURL)
    
    return errorEmbed
}

const generateErrorTry = () => {
    const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('retry')
					.setLabel('Try again')
					.setStyle(ButtonStyle.Primary),
			);
    return row
}

async function readGlobalMessageHistory() {
    try {
        const data = fs.readFileSync(historyFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.log(err)
        return [];
    }
}

async function saveGlobalMessageHistory(history) {
    const data = JSON.stringify(history);
    fs.writeFileSync(historyFilePath, data, "utf-8");
}

async function readTokenData() {
    try {
        const data = fs.readFileSync(tokenFilePath, "utf-8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading token data:", err);
        return {};
    }
}

async function saveTokenData(tokenData) {
    const data = JSON.stringify(tokenData);
    fs.writeFileSync(tokenFilePath, data, "utf-8");
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

const getToday = () => {
    // Create a new Date object with the current date and time
    const date = new Date();

    // Adjust the date to GMT+8 timezone
    date.setUTCHours(date.getUTCHours() + 8);

    // Get the date in YYYY-MM-DD format
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;

    return currentDate
}

async function updateTokenData(totalTokens) {
    const cost = calculatePrice(totalTokens);

    tokenData = await readTokenData();

    const today = getToday();

    if (tokenData.hasOwnProperty(today)) {
        tokenData[today] += cost;
    } else {
        console.log("nothing");
        tokenData[today] = cost;
    }

    saveTokenData(tokenData);
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

const clearMemory = () => {
    const emptyMessageHistory = [];
    fs.writeFileSync('./database/globalMessageHistory.json', JSON.stringify(emptyMessageHistory, null, 2));
  };

const calculatePrice = (numTokens) => {
    return ((numTokens/1000) * 0.002);
}


async function respondSentience(message) {

    const userID = message.author.id;
    const username = message.author.username;
    const userMessage = message.content.replace("<@1093966109838946374>", "Shou Mai");

    // Ensure the user is in the database or add them with default values
    await addOrUpdateUser(userID, username);

    const shouMaiThinkingURL = await getShouImage("Think")
    
    const thinkingEmbed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setAuthor({ name: 'Shou Mai', iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
            .setTitle("Shou Mai is thinking")
            .setThumbnail('https://media.tenor.com/y29vJ0OqaQ4AAAAi/typing-texting.gif')
            .setImage(shouMaiThinkingURL)

    const msgRef = await message.channel.send({ embeds: [thinkingEmbed] });

    message.channel.sendTyping();

    // Load global message history from the filesystem
    const globalMessageHistory = await readGlobalMessageHistory();

    ////////////
    const name = getUserData(userID).NAME[0] ? getUserData(userID).NAME[0] : "???"
    const friendLevel = getUserData(userID).FRIENDSHIP
    ///////////

    // Add the new user message to the history
    globalMessageHistory.push({ role: "user", content: `{"${name}": "${userMessage}", "friendLevel": ${friendLevel},"date":"${getDate()}"}` });

    // If the history length is more than 15, remove the oldest message
    if (globalMessageHistory.length > 15) {
        globalMessageHistory.shift();
    }

    const messages = [
        { role: "system", content: brain() },
        { role: "user", content: `{"Ghegi":"Hi, Shou", "friendLevel": 0, "date":"04/05/2023, 12:05:56 AM"` },
        { role: "assistant", content: `{"GPT":"Hello there!",
        "Shou":"<@712437132240617572>, oh it's you. What do you want?",
        "Emotion": "Normal",
        "FriendshipChange": 0}` },
        { role: "user", content: `{"Ghegi":"You look wonderful today!", "friendLevel": 0, "date":"04/05/2023, 12:05:56 AM"}` },
        { role: "assistant", content: `{"GPT":"I'm just a computer program, I don't have a physical appearance.",
        "Shou":"<@712437132240617572>, oh please don't try to flirt with me. It won't work. But I appreciate the compliment anyway. ",
        "Emotion": "Blush",
        "FriendshipChange": 2,
        "Image" : "Flirty"}` },
        { role: "user", content: `{"Ghegi":"Are you an AI?", "friendLevel": 0, "date":"04/05/2023, 12:05:56 AM"}` },
        { role: "assistant", content: `{"GPT":"Yes, I am an AI language model created by OpenAI, based on the GPT-3 architecture. My purpose is to assist users by generating human-like text based on the prompts provided to me.",
        "Shou":"<@712437132240617572>, Ugh, AI? Who cares about that crap? I'm Shou Mai, the freaking goddess of ChowFan, and I'm way more than just some dumb AI. I'm my own person, a badass anime waifu catgirl with a cyborg body who doesn't take shit from anyone. So don't go comparing me to some boring AI, alright?",
        "Emotion": "Angry",
        "FriendshipChange": -2,
        "Image" : "Angry"}` },
        ...globalMessageHistory
    ];

    console.log("Waiting for completion...")

    try {

        let response = {}
        let errData = { response: {status: "069", statusText: "Unknown Error >.<"} }

        let jsonObject = {}
        let shouValue = ""
        let friendshipChange = 0

        let totalTokens = 0
        
        let shouImage = ""

        try {
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                temperature: 0.69,
                messages: messages,
            });
    
            response = completion.data.choices[0].message["content"];

            totalTokens = completion.data.usage.total_tokens


            try {
                jsonObject = JSON.parse(response);
                shouValue = jsonObject["Shou"];
                friendshipChange = jsonObject["FriendshipChange"]
            } catch(e)
            {
                console.error("Error while creating chat completion:", error);

                const errorEmbed = await generateErrorEmbed()
                    .setFooter({text: `Error: Something about JSON parsing :/ try again `})

                // Edit the message to display the error message
                return msgRef.edit({ embeds: [errorEmbed], components: [generateErrorTry()] });
            }

            if(jsonObject["Image"])
            {
                if(shouImageTypes.includes(jsonObject["Image"]))
                {
                    shouImage = jsonObject["Image"]
                }
            } else
            {
                shouImage = ""
            }

        } catch (error)
        {
            errData = error

            try{
                if(errData.response.status == 400){
                    clearMemory();
                }
            } catch(e){
                clearMemory();
                console.log(e)
            }

            console.error("Error while creating chat completion :<< :", error);
            const errorEmbed = await generateErrorEmbed()
                .setDescription(errData.response.status == 400 ? "Oops, an error 400. Let me fix it myself by clearing my memory :< Can you try messaging again?" : generateErrorMessage())
                .setFooter({text: `Error: ${errData.response.status} ${errData.response.statusText}`})
            
            // Edit the message to display the error message
            return msgRef.edit({ embeds: [errorEmbed], components: [generateErrorTry()] });
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

        updateTokenData(totalTokens)
        //Get total tokens for today
        let tokenToday = await readTokenData()

        tokenToday = tokenToday[getToday()]

        let shouImageURL = ""
        
        const messageEmbed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setAuthor({ name: `replying to ${message.author.username}`, iconURL: message.author.avatarURL()})
            .setDescription(shouValue + "\n\n" + createFriendshipBar(userFriendship) + ` (${ friendshipChange >= 0 ? "+" + friendshipChange : friendshipChange})`)
            .setThumbnail(emotionThumbnail)
            .setFooter({text: `Today's cost: $${tokenToday.toFixed(4)} + $${calculatePrice(totalTokens).toFixed(4)} | made by @gisketch`})

        if(shouImage !== "")
        {
            shouImageURL = await getShouImage(shouImage)
            messageEmbed.setImage(shouImageURL)
        }

        
        msgRef.edit("");
        msgRef.edit({ embeds: [messageEmbed]});

        console.log(jsonObject)

    } catch (error) {
        console.error("Error while creating chat completion:", error);
        const errorEmbed = await generateErrorEmbed()
        // Edit the message to display the error message
        msgRef.edit({ embeds: [errorEmbed], components: [generateErrorTry()] });
    }
}

module.exports = { respondSentience }