const Discord = require('discord.js');

module.exports = {

    "name": "creategiveway",
    "description": "Stwórz nowy giveway!",

    async execute(message, args, client) {

        var config = client.configFile.find(c => c.guildId == message.guild.id);

        if (config.moderatorRoles.length <= 0) {
            message.channel.send("Błąd konfiguracji! Nikt nie skonfigurował roli moderatorskich.");
            return;
        }

        var hasPermission = false;

        config.moderatorRoles.forEach(role => {
            if (message.member.roles.cache.has(role)) {
                hasPermission = true;
            }
        });

        if (!hasPermission) {
            message.channel.send("Nie masz wystarczających uprawnień!");
            return;
        }

        const givewayOfThisGuild = client.giveway.find(g => g.guildId == message.guild.id);

        if (typeof givewayOfThisGuild === 'undefined') {
            message.channel.send("Wystąpił niespodziewany błąd konfiguracyjny!");
            return;
        }

        if (message.channel.id != givewayOfThisGuild.createGivewayChannel) {
            message.channel.send(`Do tej komendy jest przeznaczony specjalny kanał <#${givewayOfThisGuild.createGivewayChannel}>`);
            return;
        }

        var ifGiveWayExist = givewayOfThisGuild.acctualGiveway.find(e => e.exist == true);
        
        if (typeof ifGiveWayExist !== 'undefined') {
            message.channel.send("Aktualnie jest już jeden giveway!");
            return;
        }

        await givewayOfThisGuild.acctualGiveway.splice(givewayOfThisGuild.acctualGiveway.indexOf(givewayOfThisGuild.author), 1);

        client.reloadConfig();

        givewayOfThisGuild.acctualGiveway.push({

            "author": message.author.id,
            "time": "",
            "reward": "",
            "exist": true,
            "ifUserCheck": false,
            "timeType": "",
            "users": []
        });
        givewayOfThisGuild.NextUserId = 1;

        message.channel.send("A teraz napisz jaka będzie nagroda.");

        client.reloadConfig();

    }
      
}