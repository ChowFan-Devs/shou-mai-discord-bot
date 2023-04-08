const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const HenrikDevValorantAPI = require('unofficial-valorant-api');
const VAPI = new HenrikDevValorantAPI();

const fs = require('fs');

const databasePath = './database/linkedRiotAccounts.json';


function saveAccountToDatabase(userID, name, tagline, region, rank, elo, level) {
    let accounts;
    try {
        accounts = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
    } catch (error) {
        accounts = {};
    }

    accounts[userID] = { name, tagline, region, rank, elo, level };
    fs.writeFileSync(databasePath, JSON.stringify(accounts, null, 2));
    return true;
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('val')
		.setDescription('Handy Valorant Related Commands')
        .addSubcommand( subcommand =>
            subcommand
                .setName('link')
                .setDescription('Links your Riot Account to this Server')
                .addStringOption( option =>
                    option.setName(`user`)
                    .setDescription("Your username + tagline `username#0000`")
                )
            )
        .addSubcommand( subcommand =>
            subcommand
                .setName('account')
                .setDescription('Displays your VALORANT account (only works when linked)'))
        ,

    async execute(interaction) {

        //VALORANT LINK COMMAND

        if (interaction.options.getSubcommand() === 'link') {

            const usertag = interaction.options.getString("user")
            const [name, tagline] = usertag.split('#');
            
            await interaction.deferReply({ephemeral: true});

            const account = await VAPI.getAccount({name: name, tag: tagline});

            console.log(account)

            if(account.error){
                return interaction.editReply("ERROR FETCHING YOUR ACCOUNT");
            }

            const picture = account.data.card.small
            const region = account.data.region
            const level = account.data.account_level

            const mmr_data = await VAPI.getMMR({
                version: 'v1',
                region: region,
                name: name,
                tag: tagline,
            });

            if(mmr_data.error) {
                return interaction.editReply("ERROR FETCHING YOUR MMR")
            }

            const rank = mmr_data.data.currenttierpatched
            const elo = mmr_data.data.elo

            saveAccountToDatabase(interaction.user.id, name, tagline, region, rank, elo, level);

            const linkedEmbed = new EmbedBuilder()
                .setAuthor({name: `${name}#${tagline}`, iconURL: picture})
                .setTitle("You have successfully linked your account.")
                .setThumbnail(picture)
                .addFields(
                    { name: 'Account Level', value: level+"", inline: true },
                    { name: 'Rank', value: rank, inline: true },
                )

            interaction.editReply({embeds: [linkedEmbed]})

        }
        else if (interaction.options.getSubcommand() === 'account') {

            await interaction.deferReply({ephemeral: false});

            let accounts;
            try {
                accounts = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
            } catch (error) {
                accounts = {};
            }

            const accountData = accounts[interaction.user.id];

            const name = accountData.name
            const tagline = accountData.tagline

            if (!accountData) {
                return interaction.reply({ content: "Please link your account first using `/val link <username>#<tagline>`.", ephemeral: true });
            } else {

                const account = await VAPI.getAccount({name: name, tag: tagline});

                if(account.error){
                    return interaction.editReply("ERROR FETCHING YOUR ACCOUNT");
                }
                
                const picture = account.data.card.small
                const wide = account.data.card.wide
                const region = account.data.region
                const level = account.data.account_level

                const mmr_data = await VAPI.getMMR({
                    version: 'v1',
                    region: region,
                    name: name,
                    tag: tagline,
                });

                if(mmr_data.error) {
                    return interaction.editReply("ERROR FETCHING YOUR MMR")
                }

                const rank = mmr_data.data.currenttierpatched
                const elo = mmr_data.data.elo

                const accountEmbed = new EmbedBuilder()
                .setAuthor({name: `${name}#${tagline}`, iconURL: picture})
                .setTitle("You have successfully linked your account.")
                .setThumbnail(picture)
                .addFields(
                    { name: 'Account Level', value: level+"", inline: true },
                    { name: 'Rank', value: rank, inline: true },
                )
                .setImage(wide)

                interaction.editReply({embeds: [accountEmbed]})

            }
        } 
        
    },
};

module.exports.saveAccountToDatabase = saveAccountToDatabase;

