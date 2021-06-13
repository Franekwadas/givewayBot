const keepAlive = require('./server.js'); 
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
    Client.reloadConfig();
});

Client.on('message', async message => {

    const givewayOfThisGuild = Client.giveway.find(g => g.guildId == message.guild.id);
    var ifAnyGivewayExist = givewayOfThisGuild.acctualGiveway.find(e => e.exist == true);

    if (message.channel.id == givewayOfThisGuild.createGivewayChannel && !message.content.startsWith(Client.prefix) && !message.author.bot) {

        if (typeof givewayOfThisGuild === 'undefined') {
            message.channel.send("Wystąpił nieoczekiwany błąd!");
            return;
        }

        
        if (typeof ifAnyGivewayExist !== 'undefined') {

            if (!message.author.id == ifAnyGivewayExist.author) return;

            var ifAnyRewardOfGivewayExist = givewayOfThisGuild.acctualGiveway.find(e => e.reward == "");
            var ifAnyTimeOfGivewayExist = givewayOfThisGuild.acctualGiveway.find(e => e.time == "");
            var ifUserAcceptThatMessage = givewayOfThisGuild.acctualGiveway.find(e => e.ifUserCheck == false);

            if (typeof ifAnyRewardOfGivewayExist !== 'undefined') {

                ifAnyRewardOfGivewayExist.reward = message.content;
                
                message.channel.send("A teraz podaj za ile będą wyniki (Napisz liczbe wraz z m lub h lub d. Np. 60m 24h 1d)");

            } else if (typeof ifAnyTimeOfGivewayExist !== 'undefined') {

                if (message.content.endsWith("m")) {

                    if (!isNaN(message.content.replace("m", ""))) {

                        ifAnyTimeOfGivewayExist.time = (parseInt(message.content.replace("m", "")) * 60000).toString();
                        ifAnyTimeOfGivewayExist.timeType = "m";

                        Client.runGiveway(message, givewayOfThisGuild, ifAnyGivewayExist, false);

                    } else {
                        message.channel.send("Podaj prawidłowy czas!");
                    }
                } else if (message.content.endsWith("h")) {

                    if (!isNaN(message.content.replace("h", ""))) {

                        ifAnyTimeOfGivewayExist.time = (parseInt(message.content.replace("h", "")) * 3600000).toString();
                        ifAnyTimeOfGivewayExist.timeType = "h";

                        Client.runGiveway(message, givewayOfThisGuild, ifAnyGivewayExist, false);

                    } else {
                        message.channel.send("Podaj prawidłowy czas!");
                    }

                } else if (message.content.endsWith("d")) {

                    if (!isNaN(message.content.replace("d", ""))) {

                        ifAnyTimeOfGivewayExist.time = (parseInt(message.content.replace("d", "")) * 86400000).toString();
                        ifAnyTimeOfGivewayExist.timeType = "d";

                        Client.runGiveway(message, givewayOfThisGuild, ifAnyGivewayExist, false);
                        
                    } else {
                        message.channel.send("Podaj prawidłowy czas!");
                    }

                } else {

                    message.channel.send("Napisz liczbe wraz z m lub h lub d. Np. 60m 24h 1d");

                }
            } else if (typeof ifUserAcceptThatMessage !== 'undefined') {
                if (message.content.startsWith("koniec")) {
                    if (message.content.endsWith("acc")) {
                        Client.runGiveway(message, givewayOfThisGuild, ifAnyGivewayExist, true);
                    } else if (message.content.endsWith("dec")) {
                        givewayOfThisGuild.acctualGiveway.splice(givewayOfThisGuild.acctualGiveway.indexOf(ifAnyGivewayExist), 1);
                        message.channel.send("Prosze bardzo można zacząć prace od nowa :smile:");
                    }
                }
            }
        }

    }

    Client.reloadConfig();

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

    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.partial) await reaction.fetch();
    if (user.bot) return;
    if (!reaction.message.guild) return;

    const givewayOfThisGuild = Client.giveway.find(g => g.guildId == reaction.message.guild.id);

    if (reaction.message.channel.id == givewayOfThisGuild.givewayChannel) {

        if (reaction.emoji.name == "🎉") {

            const ifAnyGivewayExist = givewayOfThisGuild.acctualGiveway.find(e => e.exist == true);

            if (typeof ifAnyGivewayExist !== 'undefined') {

                if (typeof ifAnyGivewayExist.users.find(p => p.userID == user.id) === 'undefined') {

                    ifAnyGivewayExist.users.push({

                        "userID": user.id,
                        "idToJSONSorting": givewayOfThisGuild.NextUserId
                        
                    });

                    givewayOfThisGuild.NextUserId = givewayOfThisGuild.NextUserId+1;

                    Client.reloadConfig();

                }

            }

        } else {
            reaction.message.reactions.cache.get(reaction.emoji).delete();
        }

    }
});

Client.runGiveway = async (message, JSONOfGiveway, infoInJSONofThisGiveway, potwierdzono) => {

    var czas = Client.timeCalculator(infoInJSONofThisGiveway.timeType, infoInJSONofThisGiveway.time);

    let messageEmbed = new Discord.MessageEmbed()
    .setTitle(`Giveway użytkownika ${message.author.username}`)
    .setColor("#fcb603")
    .addFields(
        { name: "Nagroda: ", value: `${infoInJSONofThisGiveway.reward}` },
        { name: "Wyniki za: ", value: `${czas}${infoInJSONofThisGiveway.timeType}` } 
    )
    .setFooter("Aby wziąć udział kliknij 🎉");
    
    if (potwierdzono == true) {
        var config = Client.configFile.find(g => g.guildId == message.guild.id)
        await message.guild.channels.cache.get(JSONOfGiveway.givewayChannel).send(`<@&${config.givewayRole}>`)
        let ReactionMessage = await message.guild.channels.cache.get(JSONOfGiveway.givewayChannel).send(messageEmbed);
        message.channel.send(`Wysłałem wiadomość na kanał: <#${JSONOfGiveway.givewayChannel}>`);
        ReactionMessage.react('🎉');
        setTimeout(() => {

            colldownOnGivewayToWin(message.guild);

        }, infoInJSONofThisGiveway.time);
        
    } else {
        message.channel.send("**Twoja wiadomość będzie wyglądała w następujący sposób:**");
        setTimeout(async () => {

            await message.channel.send(messageEmbed);
            await message.channel.send('\n\n**Jeżeli chcesz potwierdzić wpisz: "koniec acc" a jeśli nie to wpisz "koniec dec"**');

        }, 1200);
        

    }

    
}

async function colldownOnGivewayToWin(guild) {

    const givewayOfThisGuild = Client.giveway.find(g => g.guildId == guild.id);
    const ifAnyGivewayExist = givewayOfThisGuild.acctualGiveway.find(e => e.exist == true);

    var min = 1;
    var max = givewayOfThisGuild.NextUserId-1;

    var Winner = Math.floor( Math.random() * ( max - min + 1 ) + min );

    console.log(Winner);
    
    if (typeof ifAnyGivewayExist !== 'undefined') {
        var WinnerOfReward = ifAnyGivewayExist.users.find(i => i.idToJSONSorting == Winner);

        if(typeof WinnerOfReward === 'undefined') {
            guild.channels.cache.get(givewayOfThisGuild.givewayChannel).send("**Przykro mi, ale niestety nikt się nie zgłosił.**");
            givewayOfThisGuild.acctualGiveway.splice(givewayOfThisGuild.acctualGiveway.indexOf(ifAnyGivewayExist), 1);
            return;
        } 

        const embed = new Discord.MessageEmbed()
        .setTitle("Zwycięsca giveway-a wybrany!")
        .setColor("#b300ff")
        .setDescription(`**Gratulację: <@${WinnerOfReward.userID}>!**\n**Udało ci się wygrać:** __${ifAnyGivewayExist.reward}__**!**`)
        .setFooter("Jeszcze raz gratuluje!")

        const embed2 = new Discord.MessageEmbed()
        .setTitle("Zostałeś zwycięscą giveway-a!")
        .setColor("#b300ff")
        .setDescription(`**Gratulację: <@${WinnerOfReward.userID}>!**\n**Udało ci się wygrać:** __${ifAnyGivewayExist.reward}__**!**`)
        .setFooter("Jeszcze raz gratuluje!")
        
        var sendToUser = guild.members.cache.get(WinnerOfReward.userID).send(embed2);

        guild.channels.cache.get(givewayOfThisGuild.givewayChannel).send(embed);
        givewayOfThisGuild.acctualGiveway.splice(givewayOfThisGuild.acctualGiveway.indexOf(ifAnyGivewayExist), 1);
    }


}

Client.timeCalculator = (timeType, miliseconds) => {

    if (timeType == "m") {
        var time = miliseconds / 60000;
        return time;
    } else if (timeType == "h") {
        var time = miliseconds / 3600000;
        return time;
    } else if (timeType == "d") {
        var time = miliseconds / 86400000;
        return time;
    }

}

Client.reloadConfig = () => {

    try {
        var giveway = Client.giveway;
    } catch (error) {
      console.error(error);
    }

    fs.writeFileSync('./giveway.json', JSON.stringify(giveway));

}

keepAlive();
Client.login(process.env['TOKEN']);