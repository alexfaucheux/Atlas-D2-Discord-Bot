# Atlas D2

A Discord bot server that delivers Destiny 2 discord news.

## HOW TO USE

### Requirements Before Use

- Install the latest versions of Node and Go.
- You will need to set up your own bot application.
  - Create a bot here: <https://discord.com/developers/applications>.
- You will need to create an application with Bungie.
  - Create an application here: <https://www.bungie.net/en/Application>
- You will need to create your own MongoDB cluster.
  - Create an account and cluster here: <https://www.mongodb.com/>
- In the root directory, create a ```.env``` file.
- Add these variables to your ```.env``` files (ALL of these are required for this server to run):
  - ```DISCORD_TOKEN```: The access token for your discord bot. Get this by going to the settings/Bot in your bot application
  - ```CLIENT_ID```: The client id for your discord bot.  Get this from settings/OAuth2 in your bot application.
  - ```CLIENT_SECRET```: The client secret for your discord bot. In the same section as client Id.
  - ```BUNGIE_API_KEY```: The API key that bungie gives you when you sign up for an application.
  - ```MONGODB_USER```: The username for a user in your MongoDB cluster.
  - ```MONGODB_PASS```: The password for a user in your MongoDB cluster.

### Installation

- Run the command ```npm run initialize``` in the terminal in the root directory.
  - Make sure you have Node and Go installed before running this command!
- Once initialized, you can start the server using the command ```npm start```
