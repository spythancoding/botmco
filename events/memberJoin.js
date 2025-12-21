const { EmbedBuilder } = require('discord.js');

// IDs de canais e cargos
const WELCOME_CHANNEL_ID = '1313574352993648651';
const VISITOR_ROLE_ID = '1439059436789305395';

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    // Adiciona automaticamente o cargo de visitante
    const visitorRole = member.guild.roles.cache.get(VISITOR_ROLE_ID);
    if (visitorRole) {
      try {
        await member.roles.add(visitorRole);
      } catch (e) {
        console.error(`Erro ao adicionar cargo de visitante: ${e}`);
      }
    }

    // Embed de boas-vindas (FAMÍLIA RPG)
    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('👋 BEM-VINDO À FAMÍLIA MOCHAVÃO!!')
      .setDescription(
        `Seja bem-vindo(a), <@${member.id}>!\n\n` +
        `**Para se dar bem por aqui:**\n\n` +
        `📜 Leia as <#1439091960659972106>\n` +
        `🧾 Torne-se um membro da família através da <#1450516667397439670>\n` +
        `💬 Apresente-se no <#1313574410975838248>\n\n` +
        `Convide seus amigos também: [Convite do servidor](https://discord.gg/JfaKQkcudy)`
      )
      .addFields(
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '📛 Nome', value: member.user.tag, inline: true },
        { name: '🎭 Cargo inicial', value: visitorRole ? visitorRole.name : 'Não atribuído', inline: true },
        { name: '🎮 Servidor de SAMP', value: '104.234.189.170:7777', inline: true }
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setFooter({ text: 'Sistema automático • Família RPG' })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
};
