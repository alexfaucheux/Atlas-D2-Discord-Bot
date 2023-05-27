import { Events, ActionRowBuilder, quote } from "discord.js";
import { isAuthenticated, authButton } from "../modules/auth.js";

export default {
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
    const client = interaction.client
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return;
    }

    const user = interaction.user;
    const authenticated = await isAuthenticated(user);

    if (!authenticated) {
        const row = new ActionRowBuilder().addComponents(authButton(user.id));
        interaction.reply({
            content: 'To use this command, you must authorized with Bungie first. Please login and try again.',
            ephemeral: true,
            components: [row]
        });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Unabled to execute command.`);
        console.error(error);
        await handleInteractionError(interaction, error);
    }
}

async function handleInteractionError(interaction, error) {
    let con;
    if (500 <= error.response?.status < 600) {
        con = 'Oops!  Looks like this service is unavailable right now.  Please try again later.';
    } else {
        con = 'There was an error while executing this command!';
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
