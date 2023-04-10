const { Events } = require('discord.js');
const { respondSentience } = require("../functions/sentienceBot")

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isButton()) return;

	    console.log(interaction);

        if(interaction.customId === "retry")
        {
            const messageLog = await interaction.message.channel.messages.fetch({ limit: 5 });
            const message = messageLog.find(i => i.id < interaction.message.id && !i.author.bot)
            const userId = message.author.id

            if(interaction.user.id === userId)
            {
                await interaction.message.delete()
                respondSentience(message)
            } else
            {
                interaction.editReply({content: "You can't use this button. Don't even try.", ephemeral: true})
            }
        }
	},
};
