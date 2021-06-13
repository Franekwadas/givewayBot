const Discord = require('discord.js');
const Client = new Discord.Client();
const giveway = require('./giveway.json');
const fs = require("fs");
Client.commands = new Discord.Collection();
Client.configFile = JSON.parse(fs.readFileSync('./appconfig.json', 'utf8'));
Client.giveway = JSON.parse(fs.readFileSync('./giveway.json', 'utf8'));

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);

    Client.commands.set(command.name, command);
}

Client.once('ready', async () => {

    console.log("Welcome!");

});

Client.on('message', async message => {

    Client.prefix = await Client.configFile.find(g => g.guildId == message.guild.id).prefix;

    if (!message.content.startsWith(Client.prefix) || message.author.bot) return;

    const args = message.content.slice(Client.prefix.length).split(/ +/);
    var command = args.shift().toLowerCase();

    try {
        Client.commands.get(command).execute(message, args, Client);

    } catch (error) {
        
        message.channel.send(`Przykro mi ale niestety nie znam takiej komendy. Aby zobaczyć moją liste komend wpisz ${Client.prefix}pomoc`);

        console.error(error);

    }

});

Client.on('messageReactionAdd', async (reaction, user) => {

    

});

Client.login('ODUzNTMyMzUwODAxMTE3MjE0.YMWv8g.6j_p9EM5zJjAqQca6sVxLpawKSo');