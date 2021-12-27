const { createCanvas, loadImage, registerFont } = require('canvas'),
    { MessageAttachment } = require('discord.js'),
    colors = require(`${process.cwd()}/config/embedcolors.json`),
    { convertXp } = require(`${process.cwd()}/utils/xpUtils`),
    db = require(`${process.cwd()}/utils/databaseDriver`);

    //loading Arimo
    registerFont(`${process.cwd()}/fonts/Arimo-Regular.ttf`, {family:"Arimo"});
    registerFont(`${process.cwd()}/fonts/Arimo-Bold.ttf`, {family:"Arimo", weight:"bold"});
    registerFont(`${process.cwd()}/fonts/Arimo-BoldItalic.ttf`, {family:"Arimo", weight:"bold", style: "italic"});
    registerFont(`${process.cwd()}/fonts/Arimo-Italic.ttf`, {family:"Arimo", style: "italic"});

function colorAverage(img) {
    let skipPx = 25,
        rgb = {red: 0, green: 0, blue: 0},
        canvas = createCanvas(),
        canvasctx = canvas.getContext('2d'),
        i = -4,
        width = canvas.width = img.width,
        height = canvas.height = img.height;

    canvasctx.drawImage(img, 0, 0)

    let data = canvasctx.getImageData(0, 0, width, height).data,
        count = 0;

        while ( (i += skipPx * 4) < data.length ) {
            count++;
            rgb.red += data[i];
            rgb.green += data[i+1];
            rgb.blue += data[i+2];
        }

        let result = [~~(rgb.red/count), ~~(rgb.green/count), ~~(rgb.blue/count)] 

        return {
            value: result,
            isLight: Math.sqrt(0.299 * (result[0] * result[0]) + 0.587 * (result[1] * result[1]) + 0.114 * (result[2] * result[2])) > 127.5 ? true : false
        }
}

module.exports = {
    name: 'profile',
    category: 'social',
    shortdescription: undefined,
    description: undefined,
    cooldown: 60,
    ussage: "profile [@user/userID]",
    run: async function(message, args) {
        let target = message.mentions.members.first() || message.member
        target.xp = convertXp(await db.get(`users`, target.id, `xp`)) // pull out of db once you figure that one out
        let roundavatar = createCanvas(128, 128, 'png');
        let avatarctx = roundavatar.getContext('2d');

        avatarctx.beginPath();
        avatarctx.arc(64, 64, 64, 0, 2 * Math.PI);
        avatarctx.closePath();
        avatarctx.clip();

        let pfp = await loadImage(target.user.displayAvatarURL({format: 'png', size: 128}))

        let profilecard = new createCanvas(600, 450, 'png')
        let profilectx = profilecard.getContext('2d')

        let bg = await loadImage(`https://cdn.discordapp.com/attachments/826472420143136809/826495407537913927/IMG_20200827_194512-EFFECTS.jpg`), //will be pulled out of the database
        bgcolors = colorAverage(bg); // https://cdn.discordapp.com/attachments/797134085931794442/825074734261076008/image0.jpg

        profilectx.imagerendering = 'pixelated'
        profilectx.drawImage(bg, 0, 0, profilecard.width, profilecard.height)

        profilectx.fillStyle = avatarctx.fillStyle = `rgba(${255-bgcolors.value[0]}, ${255-bgcolors.value[1]}, ${255-bgcolors.value[2]}, 0.75)`
        avatarctx.fillRect(0,0,128,128)
        avatarctx.drawImage(pfp, 0, 0, 128, 128);

        //card render
        profilectx.fillRect(profilecard.width*0.10,profilecard.height*0.20,profilecard.width*0.8,profilecard.height*0.75); // main
        profilectx.fillRect(profilecard.width*0.10,profilecard.height*0.475,profilecard.width*0.25,profilecard.height*0.475); // side
        profilectx.fillRect(profilecard.width*0.10,profilecard.height*0.20,profilecard.width*0.8,profilecard.height*0.15); // top
        // xp bar background
        profilectx.fillStyle = `rgba(230, 213, 25, 0.4)`
        profilectx.fillRect(profilecard.width*0.10,profilecard.height*0.35,profilecard.width*0.8,profilecard.height*0.125);
        //info
        profilectx.fillStyle = avatarctx.fillStyle = `rgba(${255-bgcolors.value[0]}, ${255-bgcolors.value[1]}, ${255-bgcolors.value[2]}, 0.6)`
        profilectx.fillRect(profilecard.width*0.35,profilecard.height*0.475,profilecard.width*0.55,profilecard.height*0.125); // info top
        profilectx.fillStyle = avatarctx.fillStyle = `rgba(${255-bgcolors.value[0]}, ${255-bgcolors.value[1]}, ${255-bgcolors.value[2]}, 0.4)`
        profilectx.fillRect(profilecard.width*0.35,profilecard.height*0.6,profilecard.width*0.55,profilecard.height*0.125); // info middle

        //avatar and outline render
        profilectx.beginPath();
        if (!bgcolors.isLight) {profilectx.strokeStyle = `rgb(${255-bgcolors.value[0] - 80}, ${255-bgcolors.value[1] - 80}, ${255-bgcolors.value[2] - 80})`} else profilectx.strokeStyle = `rgb(${255-bgcolors.value[0] + 80}, ${255-bgcolors.value[1] + 80}, ${255-bgcolors.value[2] + 80})`
        profilectx.lineWidth = 10
        profilectx.arc(profilecard.width*0.12 + 64, profilecard.height*0.04 + 64, 64, 0, 2 * Math.PI);
        profilectx.stroke();
        profilectx.closePath();
        profilectx.drawImage(roundavatar, profilecard.width*0.12, profilecard.height*0.04);

        if (bgcolors.isLight) {profilectx.fillStyle = "#DDD"} else profilectx.fillStyle = "#222"

        profilectx.font = "30px Arimo";
        profilectx.fillText(target.user.username, 210, 120);

        
        profilectx.font = "20px Arimo";
        profilectx.fillText(target.title || `No title displayed :O`, 210, 145);

        //rendering the level dot
        profilectx.beginPath()
        profilectx.fillStyle = `rgb(${255-bgcolors.value[0]}, ${255-bgcolors.value[1]}, ${255-bgcolors.value[2]})`
        profilectx.arc(profilecard.width*0.10 + profilecard.height * 0.0625, profilecard.height*0.35 + profilecard.height * 0.0625, profilecard.height * 0.05, 0, 2 * Math.PI);
        profilectx.lineWidth = 5
        if (!bgcolors.isLight) {profilectx.strokeStyle = `rgb(${255-bgcolors.value[0] - 80}, ${255-bgcolors.value[1] - 80}, ${255-bgcolors.value[2] - 80})`} else profilectx.strokeStyle = `rgb(${255-bgcolors.value[0] + 80}, ${255-bgcolors.value[1] + 80}, ${255-bgcolors.value[2] + 80})`
        profilectx.stroke()
        profilectx.fill();
        profilectx.closePath()

        //rendering the xp bar
        profilectx.beginPath()
        let startpoint  = { x: profilecard.width*0.23, y: profilecard.height * 0.36}
        profilectx.moveTo(startpoint.x + profilecard.width*0.52, startpoint.y + profilecard.height * 0.02)
        profilectx.ellipse(startpoint.x, startpoint.y + profilecard.height * 0.05, profilecard.height * 0.03, 15, Math.PI*3/2, 0, Math.PI, true)
        profilectx.lineTo(startpoint.x + profilecard.width*0.52, startpoint.y + profilecard.height * 0.08);
        profilectx.ellipse(startpoint.x + profilecard.width*0.52, startpoint.y + profilecard.height * 0.05, profilecard.height * 0.03, 15, Math.PI/2, 0, Math.PI, true)
        profilectx.closePath()
        profilectx.save()
        profilectx.stroke()
        profilectx.clip()

        let fillratio = target.xp.xp/target.xp.xpRequired;
        profilectx.fillRect(startpoint.x-15 + ((profilecard.width*0.52 + 30) * fillratio), startpoint.y + profilecard.height * 0.02, (profilecard.width*0.52 + 30) * (1 - fillratio), profilecard.height * 0.06)
        profilectx.fillStyle = `rgb(230, 213, 25)`
        profilectx.fillRect(startpoint.x-15, startpoint.y + profilecard.height * 0.02, (profilecard.width*0.52 + 30) * fillratio, profilecard.height * 0.06)

        // remove the clip and outline xp bar
        profilectx.restore()
        // add xp/xp needed text
        profilectx.font = "bold 12px Arimo";
        profilectx.textAlign = "right"
        if (bgcolors.isLight) {profilectx.fillStyle = "#DDD"} else profilectx.fillStyle = "#222"
        profilectx.fillText(`${target.xp.xp} / ${target.xp.xpRequired} xp`, startpoint.x + profilecard.width*0.52 + 15, startpoint.y + profilecard.height * 0.11-1)
        //add % 
        profilectx.font = "bold 24px Arimo";
        profilectx.textAlign = "left";
        profilectx.textBaseline = 'middle';
        profilectx.fillText((Math.floor(fillratio * 1000)/10).toLocaleString('en-US', {minimumIntegerDigits: 2, maximumIntegerDigits: 2, minimumFractionDigits: 1, maximumFractionDigits: 1}) + "%", startpoint.x + profilecard.width*0.555, startpoint.y + profilecard.height * 0.05)
        //add level badge and progress circle
        profilectx.fillText(target.xp.level, profilecard.width*0.10 + profilecard.height * 0.0625  - profilectx.measureText(target.xp.level).width/2, profilecard.height*0.35 + profilecard.height * 0.0625);


        const attachment = new MessageAttachment(profilecard.toBuffer(),'test.png');
        message.channel.send({files: [attachment]})
    }
}