const config = require('./config.json');
const discord = require('discord.js');

const client = new discord.Client({intents:[
    discord.GatewayIntentBits.Guilds,
    discord.GatewayIntentBits.GuildPresences
]})

client.once(discord.Events.ClientReady, (readyClient) => {
    console.log('ready');
});

let monitoring_members = []

client.on(discord.Events.PresenceUpdate, (oldPresence, newPresence) => {
    if(config.targets.includes(String(newPresence.user.id))) {
        if(newPresence.status === 'offline') {
            if(!monitoring_members.includes(String(newPresence.user.id))) {
                monitoring_members.push(String(newPresence.user.id));
                setInterval(() => {
                    if(monitoring_members.includes(String(newPresence.user.id))) {
                        const alert_channel = client.channels.cache.find(channel => channel.id == config.alert_channel);
                        alert_channel.send(`${newPresence.user.username}がダウンしています`);
                    }
                }, 300*1000);
            }
        }
        else {
            if(monitoring_members.includes(String(newPresence.user.id))) {
                const alert_channel = client.channels.cache.find(channel => channel.id == config.alert_channel);
                alert_channel.send(`${newPresence.user.username}が復旧しました`);
                monitoring_members = monitoring_members.filter(target => target != newPresence.user.id);
            }
        }
    }
})

client.login(config.token);