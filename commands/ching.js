// commands/ching.js
module.exports = {
    name: 'ching',
    description: 'Replies with Chong! Not Racist BTW.',
    async execute(interaction) {
      await interaction.reply('Chong!');
    },
  };