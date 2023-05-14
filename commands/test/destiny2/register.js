const { mongoClient } = require('../../../modules/db.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Register Bungie name for use with other commands.')
        .addStringOption((option) => {
            return option
                .setName('bungie-name')
                .setDescription('Bungie name to register.')
                .setRequired(true);
        }),
    async execute(interaction) {
        await registerBungieName(interaction);
    }
};

async function registerBungieName(interaction) {
    const bungieName = interaction.options.getString('bungie-name');
    const collection = mongoClient.collections.auth;
    const discordName = interaction.user.tag;
    await collection.updateOne(
        { username: discordName },
        { $set: { bungieName: bungieName } },
        { upsert: true }
    );
    interaction.reply({
        content: `Bungie name ${bungieName} successfully registered for user ${discordName}`
    });
}
