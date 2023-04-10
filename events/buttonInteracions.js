const { Events } = require('discord.js');
const { respondSentience } = require("../functions/sentienceBot")

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;

        if(interaction.customId === "retry")
        {
            let message;
            const messageLog = await interaction.message.channel.messages.fetch({ limit: 15 });
            try {
                message = messageLog.find(i => i.id < interaction.message.id && !i.author.bot)
            } catch(e)
            {
                return await interaction.reply("Oops, sorry. Can't do it.")
            }

            const userId = message.author.id

            if(interaction.user.id === userId)
            {
                await interaction.message.delete()
                respondSentience(message)
            } else
            {
                interaction.reply({content: "You can't use this button. Don't even try.", ephemeral: true})
            }
        }
	},
};
