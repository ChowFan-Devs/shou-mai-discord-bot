const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const HenrikDevValorantAPI = require('unofficial-valorant-api');
const VAPI = new HenrikDevValorantAPI();

const fs = require('fs');

const databasePath = './database/linkedRiotAccounts.json';

// Save account data to the database
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

// Fetch account data from the database
function fetchAccountData(userID) {
    let accounts;
    try {
        accounts = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
    } catch (error) {
        accounts = {};
    }

    return accounts[userID];
}

// Get account data from the API
async function getAccountData(name, tagline, region) {
    const account = await VAPI.getAccount({name: name, tag: tagline});

    if(account.error) {
        return { error: "ERROR FETCHING YOUR ACCOUNT" };
    }

    const picture = account.data.card.small;
    const wide = account.data.card.wide;
    const level = account.data.account_level;

    const mmr_data = await VAPI.getMMR({
        version: 'v1',
        region: region,
        name: name,
        tag: tagline,
    });

    if(mmr_data.error) {
        return { error: "ERROR FETCHING YOUR MMR" };
    }

    const rank = mmr_data.data.currenttierpatched;
    const elo = mmr_data.data.elo;

    return { picture, wide, level, rank, elo };
}

async function getCompetitiveTiers() {
    try {
        const response = await axios.get('https://valorant-api.com/v1/competitivetiers');
        return response.data.data[4].tiers;
    } catch (error) {
        console.error(error);
    }
}

// Create account embed
async function createAccountEmbed(name, tagline, picture, level, rank, wide) {

    const tiers = await getCompetitiveTiers()
    const rankToFind = rank.toUpperCase();

    const result = tiers.filter(tier => tier.tierName === rankToFind);
    const rankIcon = result[0].largeIcon

    return new EmbedBuilder()
        .setAuthor({name: "Valorant Account Information", iconURL: picture})
        .setTitle(`${name}#${tagline}`)
        .setThumbnail(rankIcon)
        .addFields(
            { name: 'Account Level', value: level+"", inline: true },
            { name: 'Rank', value: rank, inline: true },
        )
        .setImage(wide);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('val')
        .setDescription('Handy Valorant Related Commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('link')
                .setDescription('Links your Riot Account to this Server')
                .addStringOption(option =>
                    option.setName(`user`)
                        .setDescription("Your username + tagline `username#0000`")
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('account')
                .setDescription('Displays your VALORANT account (only works when linked)'))
        ,

    async execute(interaction) {

        if (interaction.options.getSubcommand() === 'link') {
            const usertag = interaction.options.getString("user");
            const [name, tagline] = usertag.split('#');

            await interaction.deferReply({ephemeral: true});

            const accountData = await getAccountData(name, tagline, 'ap');

            if(accountData.error) {
                return interaction.editReply(accountData.error);
            }

            saveAccountToDatabase(interaction.user.id, name, tagline, 'ap', accountData.rank, accountData.elo, accountData.level);

            const linkedEmbed = await createAccountEmbed(name, tagline, accountData.picture, accountData.level, accountData.rank);
            linkedEmbed.setTitle("You have successfully linked your account.");

            interaction.editReply({embeds: [linkedEmbed]});
        }
        else if (interaction.options.getSubcommand() === 'account') {

            const accountData = fetchAccountData(interaction.user.id);

            if (!accountData) {
                return interaction.reply({ content: "Please link your account first using `/val link <username>#<tagline>`.", ephemeral: true });
            } else {
                const apiAccountData = await getAccountData(accountData.name, accountData.tagline, accountData.region);

                if(apiAccountData.error) {
                    return interaction.reply(apiAccountData.error);
                }

                const accountEmbed = await createAccountEmbed(accountData.name, accountData.tagline, apiAccountData.picture, apiAccountData.level, apiAccountData.rank, apiAccountData.wide);

                interaction.reply({embeds: [accountEmbed]});
            }
        }
    },
};

module.exports.saveAccountToDatabase = saveAccountToDatabase;

