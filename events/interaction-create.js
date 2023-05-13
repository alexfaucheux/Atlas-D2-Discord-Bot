const { Events, quote } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    execute: async (interaction) => {
        executeInteraction(interaction);
    }
};

async function executeInteraction(interaction) {
	// Exits if the interation is not a slash command via chat
    if (!interaction.isChatInputCommand()) {
        return;
    }

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
		console.error(`Unabled to execute command.\n${error}`);
        await handleInteractionError(interaction, error);
    }
}

async function handleInteractionError(interaction, error) {
    let con;
    if (500 <= error.response?.status < 600) {
        con = 'Oops!  Looks like this service is unavailable right now.  Please try again later.'
    } else {
        con = 'There was an error while executing this command!'
    }
    const errorObj = {
        content: quote(con),
        ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorObj);
    } else {
        await interaction.reply(errorObj);
    }
}
