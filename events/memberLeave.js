const { EmbedBuilder } = require('discord.js');
const { lerMembros, salvarMembros } = require('../utils/dataManager');

// Canal de logs / saída
const LOG_CHANNEL_ID = '1440593789042561096';

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const channel = member.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    // 📁 Atualiza ficha do membro
    const membros = lerMembros();
    if (membros[member.id]) {
      membros[member.id].dataSaida = Date.now();
      membros[member.id].tipoSaida = '🚪 Saiu';
      salvarMembros(membros);
    }

    // 🚪 Embed de saída (PADRÃO FAMÍLIA RPG)
    const embed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle('🚪 SAIU DO SERVIDOR')
      .setDescription(
        `O membro abaixo **não faz mais parte do DISCORD MOCHAVÃO.**.\n\n` +
        `Se saiu por vontade própria ou outro motivo, o registro foi salvo automaticamente.`
      )
      .addFields(
        { name: '🆔 ID', value: member.id, inline: true },
        { name: '📛 Nome', value: member.user?.tag ?? 'Desconhecido', inline: true },
        { name: '📅 Data da saída', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
      )
      .setThumbnail(member.user?.displayAvatarURL() ?? null)
      .setFooter({ text: 'Sistema automático • Família RPG' })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
};
