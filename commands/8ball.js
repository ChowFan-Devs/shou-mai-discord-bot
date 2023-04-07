const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('A magic 8-ball feature that gives random answers to yes/no questions.')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Your question')
                .setRequired(true)),

    async execute(interaction) {

        const positiveResponses = ["You betcha!", "For sure, dude!", "Abso-freaking-lutely!", "Hell yeah! 🤘", "You know it! 🙌", "No doubt, bro!"];
        const negativeResponses = ["Not a chance, chief.", "No way, Jose.", "Nah, bruh.", "Fat chance, dude.", "Don't hold your breath.", "Sorry, Charlie."];
        
        // generate a random number between 0 and 1
        const randomNum = Math.random();
        
        // choose a response based on the random number
        let response;
        if (randomNum < 0.5) {
            response = positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
        } else {
            response = negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
        }

        const input = interaction.options.getString("input")

        console.log(input)
        
        const eightBallEmbed = new EmbedBuilder ()
            .setColor('Blue')
            .setTitle(response)
            .setAuthor({name: '8ball'})
            .setDescription(`<@${interaction.user.id}> asked "${input}"`)

        
        await interaction.reply({ embeds: [eightBallEmbed] });
    },
};
