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
  - ```DISCORD_TOKEN```: Discord bot access token
  - ```CLIENT_ID```: Discord bot client Id.
  - ```CLIENT_SECRET```: Discord bot client secret.
  - ```BUNGIE_API_KEY```: Bungie app api key.
  - ```BUNGIE_AUTH_ID```: Bungie app client id.
  - ```BUNGIE_AUTH_SECRET```: Bungie app client secret.
  - ```MONGODB_USER```: MongoDB cluster username.
  - ```MONGODB_PASS```: MongoDB cluster password.
  - ```TEST_SERVER_ID```: The ID for the server to test your bot in.
- To use oauth, you need to run the local express server. 
  - You need to generate these files to run the server (openssl recommended):
    - ```selfsigned.crt```
    - ```selfsigned.key```

### Installation

- Run the command ```npm run initialize``` in the terminal in the root directory.
  - Make sure you have Node and Go installed before running this command!
- Once initialized, you can start the server using the command ```npm start```
