const { EmbedBuilder,PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle,ModalBuilder ,TextInputStyle, SelectMenuBuilder,TextInputBuilder , Formatters} = require("discord.js");
const { Command } = require("../../../../Global/Structures/Default.Commands");
const {Guild} = require("../../../../Global/Config/Guild")
const cezapuan = require("../../../../Global/Database/cezapuan")
const penalty =require("../../../../Global/Database/ceza")
const mute = require("../../../../Global/Database/mute")
const Roles = require("../../../../Global/Database/Roles")
const Channel = require("../../../../Global/Database/Channel")
const ms = require("ms");
class ChatMute extends Command {
    constructor(client) {
        super(client, {
            name: "C-mute",
            description: "ID'si girilen kullanıcıyı süreli bir şekilde sunucunun metin kanallarında susturur",
            usage: ".cmute @weatrix/ID <süre> <sebep>",
            category: "Moderasyon",
            aliases: ["sustur","mute","cmute"],
            enabled: true,
        });
    }
async onRequest (client, message, args,embed) {
    let roles = await Roles.findOne({guildID: message.guild.id})
    let channels = await Channel.findOne({guildID: message.guild.id})
if( [PermissionsBitField.Flags.Administrator,PermissionsBitField.Flags.ManageRoles,PermissionsBitField.Flags.BanMembers,PermissionsBitField.Flags.KickMembers,].some(x=> message.member.permissions.has(x))
    ||
    [roles.mutehammer].some(x=> message.member.roles.cache.has(x))){
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if(!member) return cevap(message,"memberYok")
    if (member.user.bot) return cevap(message,"bot")
    if (!member.manageable) return cevap(message,"yetersizYetki")
    if (member.roles.highest.position >= message.member.roles.highest.position && !client.owners.includes(message.author.id)) return cevap(message,"üstAynıYetki")
    var sure = args[1]
    if(!sure || !ms(sure)) return cevap(message,"sureYok")
    sure = ms(sure)
    let mutesure = args[1].replace(`s`, " Saniye").replace(`m`, " Dakika").replace(`h`, " Saat").replace(`d`, " Gün").replace(`w`, " Hafta")
    var reason = args.splice(2).join(" ")
    if(!reason) reason = "Sebep Girilmedi."
    const data = await penalty.find();
    let cezakontrol = data.filter(x=> x.penaltys.some(x=> x.type == "CHAT-MUTE" && x.Punished == member.id && x.Finished == false)).length > 0
    if(member.roles.cache.has(roles.muterol) || cezakontrol) return message.reply({content:`**${member.user.tag}**, Aktif cezası bulunduğu için susturma işlemi yapılamaz.`})
    const ceza = await penalty.countDocuments().exec();
    await penalty.findOneAndUpdate({guildID: message.guild.id, userID:member.id, cezaId: ceza+1}, {$set:{penaltys:{Staff:message.member.id, Punished:member.id, SentencingDate:Date.now(),PenaltyEndTime: Date.now()+sure,Finished:false,Reason:reason, type:"CHAT-MUTE"}}},{upsert:true})
    if(roles && roles.muterol) await member.roles.add(roles.muterol)
    await message.reply({content:`${client.emojis.cache.find(x => x.name === "appEmoji_tik")} Susturma (\`Chat Mute\`) İşlemi Başarılı! \n "${member.id}" ID'li kullanıcı <t:${(Date.now() / 1000).toFixed()}> tarihinde (<t:${(Date.now() / 1000).toFixed()}:R>) metin kanallarından susturuldu!`})
   message.guild.channels.cache.get(channels.mutelog)
    .send({embeds:[embed.setDescription(`${member} [\`${member.id}\`], Sunucunun metin kanallarından susturuldu!`).addFields({name:`** **`,value:`\` ❯ \` **Yetkili:** ${message.member} [\`${message.member.user.tag} - ${message.member.id}\`]\n\` ❯ \`** Kullanıcı:** ${member} [\`${member.id}\`]\n\` ❯ \`** Tarih:** <t:${(Date.now() / 1000).toFixed()}> [<t:${(Date.now() / 1000).toFixed()}:R>]\n\` ❯ \`**  Sebep:** ${reason}\n\` ❯ \` **Süre:**\n\`\`\` ${mutesure} \`\`\``})]})
    await mute.findOneAndUpdate({guildID:message.guild.id, userID:message.member.id},{$inc:{limit:1,mute:1},$push:{mutes:{Punished:member.id, SentencingDate:Date.now(), Type:"C-MUTE", Reason:reason,Finished:false}}},{upsert:true})
    await cezapuan.findOneAndUpdate({guildID:message.guild.id,userID:member.id}, {$inc:{cezapuan:10}},{upsert:true})
    let cezapuandata = await cezapuan.findOne({guildID:message.guild.id,userID:member.id})
    if(channels.penaltyPointsLog !=undefined && message.guild.channels.cache.get(channels.penaltyPointsLog)) message.guild.channels.cache.get(channels.penaltyPointsLog)
    .send({content:`**${member} Ceza puanın güncellendi!.** mevcut ceza puanın **${cezapuandata ? cezapuandata.cezapuan : 0}**`})
} else {return message.reply({content:"Bu komutu kullanmak için gerekli yetkilere veya rollere sahip değilsin."})}
}
}
module.exports = ChatMute;