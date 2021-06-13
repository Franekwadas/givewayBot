const Discord = require('discord.js');

module.exports = {

    "name": "creategiveway",
    "description": "Stwórz nowy giveway!",

    execute(message, args, client) {

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

        if (typeof client.giveway.acctualGiveway.time !== 'undefined') {
            message.channel.send("Aktualnie jest już jeden giveway!");
            return;
        }

        let messageEmbed = new Discord.MessageEmbed()
        .setTitle(`Giveway użytkownika ${message.author.username}`)
        .addFields(
            { name: "Nagroda: ", value: `${args[0]}`},
            { name: "Wyniki za: ", value: `${args[1]}`}
        )
        .setColor("#DAA520")
        .setFooter(`Aby wziąć udział kliknij ${givewayOfThisGuild.givewayEmoji}`)

        message.guild.channels.cache.get(givewayOfThisGuild.givewayChannel).send(messageEmbed);


    }
      
}