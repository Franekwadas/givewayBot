module.exports = {
    "name": "prefix",
    "description": "Zmień prefix bota!",

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

        if (typeof args[0] !== 'undefined') {


            config.prefix = args[0];

            client.prefix = args[0];

            await message.channel.send(`Pomyślnie zmieniono prefix na ${args[0]}`);

            client.reloadConfig();

        } else {
            message.channel.send("Powiedz na jaki chcesz nowy prefix!");
        }

    }
}