const { MessageAttachment } = require('discord.js'),
    { convertXp } = require(`../../utils/xpUtils`),
    db = require(`../../utils/databaseDriver`),
    { getAverageColor } = require('fast-average-color-node'),
    captureWebsite = import('capture-website'),
    axios = require('axios')

module.exports = {
    name: 'profile',
    category: 'social',
    shortdescription: undefined,
    description: undefined,
    cooldown: 60,
    ussage: "profile [@user/userID]",
    run: async function(message, args) {
        let target = message.mentions.members.first() || message.member,
            targetData = await db.all(`users`, target.id),
            backgroundURL = "https://cdn.discordapp.com/attachments/826472420143136809/826495407537913927/IMG_20200827_194512-EFFECTS.jpg",
            backgroundBuffer = await axios.get(backgroundURL, { responseType: 'arraybuffer' }),
            background = Buffer.from(backgroundBuffer.data, 'utf8').toString('base64')
            userAvatar = await axios.get(target.displayAvatarURL({format:'png'}), { responseType: 'arraybuffer' }).then(response => Buffer.from(response.data, 'utf8').toString('base64')),
            username = target.displayName,
            title = "No title displayed :0",
            xpInfo = convertXp(targetData.xp),
            fillratio = xpInfo.xp/ xpInfo.xpRequired,
            percent = (Math.floor(fillratio * 1000)/10).toLocaleString('en-US', {minimumIntegerDigits: 2, maximumIntegerDigits: 2, minimumFractionDigits: 1, maximumFractionDigits: 1}),
            description = targetData.description || "No description set",
            averageColor = await getAverageColor(Buffer.from(backgroundBuffer.data, 'utf8'), {step: 50})

        let profilecard = await (await captureWebsite).default.buffer(`./sources/profile/html/rankCard.html`, {
            width: 800, height: 600, launchOptions: {args: ['--no-sandbox','--disable-setuid-sandbox']},
            styles: [`
            :root {
                --background: url("data:image/png;base64,${background}");
                --text-color: rgb(${averageColor.value.slice(0, 3).map(e => e > 127 ? e+40 : e-40).join(", ")});
                --card-color: ${averageColor.value.slice(0, 3).map(e => 255 - e).join(", ")};
                --profilePicture: url("data:image/png;base64,${userAvatar}");
                --username: "${username}";
                --title: "${title}";
                --level: "${xpInfo.level}";
                --xp: "${xpInfo.xp}xp";
                --xpRequired: "${xpInfo.xpRequired}xp";
                --progress: ${percent}%;
                --progress-string: "${percent}%";
                --description: "${description}";
            }
            `], 
            delay: 0})

        const attachment = new MessageAttachment(profilecard, 'rankCard.png');
        message.channel.send({files: [attachment]})
        

    }
}