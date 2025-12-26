const { EmbedBuilder } = require('discord.js');

// IDs de canais e cargos
const WELCOME_CHANNEL_ID = '1313574352993648651';
const VISITOR_ROLE_ID = '1439059436789305395';

// IDs importantes
const CANAL_REGRAS = '1439091960659972106';
const CANAL_INSCRICAO = '1450516667397439670';

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    // 🏷️ Cargo visitante
    const visitorRole = member.guild.roles.cache.get(VISITOR_ROLE_ID);
    if (visitorRole) {
      try {
        await member.roles.add(visitorRole);
      } catch (e) {
        console.error(`Erro ao adicionar cargo de visitante: ${e.message}`);
      }
    }

    // ✨ Embed de boas-vindas
    const embed = new EmbedBuilder()
      .setColor('#980505ff')
      .setTitle('👋 Bem-vindo à Família MoChavãO')
      .setDescription(
        `Seja bem-vindo(a), <@${member.id}>!\n\n` +
        `A **Família MoChavãO** é baseada em **hierarquia, disciplina e respeito**.\n` +
        `Para iniciar sua jornada conosco, siga os passos abaixo:\n\n` +

        `📜 **Leia atentamente as regras** no canal <#${CANAL_REGRAS}>\n` +
        `🧾 **Realize sua inscrição oficial** pelo canal <#${CANAL_INSCRICAO}>\n\n` +

        `Após a inscrição, nossa equipe irá analisar sua solicitação.\n` +
        `O resultado será enviado diretamente via **mensagem privada** no Discord.`
      )
      .addFields(
        {
          name: '🎭 Cargo inicial',
          value: visitorRole ? visitorRole.name : 'Não atribuído',
          inline: true
        },
        {
          name: '🎮 Servidor SAMP',
          value: '104.234.189.170:7777',
          inline: true
        }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      // 👉 quando quiser, troque pelo banner oficial da família
      .setImage('https://cdn.discordapp.com/attachments/1450348057295061045/1453948154087997452/Gemini_Generated_Image_s8n165s8n165s8n1.png?ex=694f4e3c&is=694dfcbc&hm=564352db30135527b9ff8b980670e4f905c85905403024cba4e03f857cf19de6&')
      .setFooter({
        text: 'Família MoChavãO • União, respeito e hierarquia'
      })
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  }
};
