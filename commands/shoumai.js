const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const getUserData = (id) => {
    const userData = fs.readFileSync('./database/userData.json');
    const users = JSON.parse(userData).users;
    for (let i = 0; i < users.length; i++) {
        if (users[i].ID === id) {
          return users[i];
        }
      }
}

const updateUserAbout = (id, description) => {
    const userData = fs.readFileSync('./database/userData.json');
    const parsedData = JSON.parse(userData);
    const users = parsedData.users;
  
    for (let i = 0; i < users.length; i++) {
      if (users[i].ID === id) {
        if (users[i].ABOUT.length >= 5) {
          return false;
        }
        users[i].ABOUT.push(description);
        break;
      }
    }
  
    fs.writeFileSync('./database/userData.json', JSON.stringify(parsedData, null, 2));
    return true;
  };

  const deleteUserDescription = (id, description) => {
    const userData = fs.readFileSync('./database/userData.json');
    const parsedData = JSON.parse(userData);
    const users = parsedData.users;
    let success = false;
  
    for (let i = 0; i < users.length; i++) {
      if (users[i].ID === id) {
        const index = users[i].ABOUT.findIndex(item => item.toLowerCase() === description.toLowerCase());
        if (index !== -1) {
          users[i].ABOUT.splice(index, 1);
          success = true;
        }
        break;
      }
    }
  
    fs.writeFileSync('./database/userData.json', JSON.stringify(parsedData, null, 2));
    return success;
  };
  
  const addUserName = (id, name) => {
    const userData = fs.readFileSync('./database/userData.json');
    const parsedData = JSON.parse(userData);
    const users = parsedData.users;
  
    for (let i = 0; i < users.length; i++) {
      if (users[i].ID === id) {
        if (users[i].NAME.length >= 3) {
          return false;
        }
        users[i].NAME.push(name);
        break;
      }
    }
  
    fs.writeFileSync('./database/userData.json', JSON.stringify(parsedData, null, 2));
    return true;
  };
  
  const deleteUserName = (id, name) => {
    const userData = fs.readFileSync('./database/userData.json');
    const parsedData = JSON.parse(userData);
    const users = parsedData.users;
    let success = false;
  
    for (let i = 0; i < users.length; i++) {
      if (users[i].ID === id) {
        const index = users[i].NAME.findIndex(item => item.toLowerCase() === name.toLowerCase());
        if (index !== -1) {
          users[i].NAME.splice(index, 1);
          success = true;
        }
        break;
      }
    }
  
    fs.writeFileSync('./database/userData.json', JSON.stringify(parsedData, null, 2));
    return success;
  };
  
  

const chowfanIds = [
    "712437132240617572",
    "464791690750984193",
    "739798732869992529",
    "367283052910739456",
    "606468921989529631",
    "696666733737410571",
    "445263818054959134",
    "750265730200764426",
    "632207264815644682"
]

const authorizedIds = [
  "712437132240617572",
  "464791690750984193",
];


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

const clearMemory = () => {
  const emptyMessageHistory = [];
  fs.writeFileSync('./database/globalMessageHistory.json', JSON.stringify(emptyMessageHistory, null, 2));
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('shoumai')
		.setDescription('All about your interactions with Shou Mai!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('profile')
                .setDescription('See what Shou Mai thinks of you'))
        .addSubcommand(subcommand =>
            subcommand
                .setName("addabout")
                .setDescription("Add a description about yourself")
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("just some adjectives :>")
                        )
                    )
        .addSubcommand(subcommand =>
            subcommand
                .setName("deleteabout")
                .setDescription("Delete a description about yourself")
                .addStringOption(option =>
                    option
                        .setName("description")
                        .setDescription("remove existing descriptions")
                        )
                    )
        .addSubcommand(subcommand =>
            subcommand
                .setName("addname")
                .setDescription("Add a name for yourself")
                .addStringOption(option =>
                option
                    .setName("name")
                    .setDescription("A name you'd like to add")
                )
            )
            .addSubcommand(subcommand =>
            subcommand
                .setName("deletename")
                .setDescription("Delete a name for yourself")
                .addStringOption(option =>
                option
                    .setName("name")
                    .setDescription("A name you'd like to remove")
                )
            )
            .addSubcommand(subcommand =>
              subcommand
                  .setName('clearmemory')
                  .setDescription('Clear all of Shou Mai\'s memory (restricted access)')
            )
        ,

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'profile') {

            await interaction.deferReply({ephemeral: false});

            userProfile = await getUserData(interaction.user.id)

            const aboutString = userProfile.ABOUT.length != 0 ? userProfile.ABOUT.map(item => `\`${item}\``).join(", ") :"The user has not yet set his description."
            const nameString = userProfile.NAME.length != 0 ? userProfile.NAME.map(item => `\`${item}\``).join(", ") :"The user has not yet set his name."

            const profileEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setAuthor({ name: `${interaction.user.username}'s profile`, iconURL: 'https://media.discordapp.net/attachments/1094196420661231680/1094196540479905812/Normal_Face.png'})
                .setTitle(interaction.user.username)
                .setThumbnail(interaction.user.avatarURL())
                .addFields(
                    { name: 'About', value: aboutString },
                    { name: 'Name/s', value: nameString, inline: true },
                    { name: 'Chowfan', value: chowfanIds.includes(interaction.user.id) ? "Yes" : "No", inline: true },
                    { name: 'Friendship Level', value: createFriendshipBar(userProfile.FRIENDSHIP) + " (" + userProfile.FRIENDSHIP + "/100)"}
                )
                .setTimestamp()
                ;

            interaction.editReply({embeds: [profileEmbed]})
        }

        else if (interaction.options.getSubcommand() === 'addabout') {

            await interaction.deferReply({ephemeral: true});

            const description = interaction.options.getString("description");
            const success = updateUserAbout(interaction.user.id, description);
            
            if (success) {
              interaction.editReply(`\`${description}\` has been added to your description!`);
            } else {
              interaction.editReply('You have already reached the maximum allowed number of descriptions (5).');
            }
          }      
          
        else if (interaction.options.getSubcommand() === 'deleteabout') {

            await interaction.deferReply({ephemeral: true});

            const description = interaction.options.getString("description");
            const success = deleteUserDescription(interaction.user.id, description);
          
            if (success) {
              interaction.editReply(`\`${description}\` has been removed from your description.`);
            } else {
              interaction.editReply(`Error: The description "\`${description}\`" was not found.`);
            }
          }
        
        else if (interaction.options.getSubcommand() === 'addname') {

            await interaction.deferReply({ephemeral: true});

            const name = interaction.options.getString("name");
            const success = addUserName(interaction.user.id, name);
            
            if (success) {
                interaction.editReply(`\`${name}\` has been added to your names!`);
            } else {
                interaction.editReply('You have already reached the maximum allowed number of names (3).');
            }
        }
        else if (interaction.options.getSubcommand() === 'deletename') {

            await interaction.deferReply({ephemeral: true});
            
            const name = interaction.options.getString("name");
            const success = deleteUserName(interaction.user.id, name);
            
            if (success) {
                interaction.editReply(`\`${name}\` has been removed from your names.`);
            } else {
                interaction.editReply(`Error: The name "\`${name}\`" was not found.`);
            }
        }
        else if (interaction.options.getSubcommand() === 'clearmemory') {
          await interaction.deferReply({ephemeral: true});
      
          if (authorizedIds.includes(interaction.user.id)) {
              clearMemory();
              interaction.editReply('Shou Mai\'s memory has been cleared.');
          } else {
              interaction.editReply('You do not have permission to clear Shou Mai\'s memory.');
          }
      }
      
          
          

    },  
};
