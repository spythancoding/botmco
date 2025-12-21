const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { lerMembros, salvarMembros } = require('../utils/dataManager');

const LOG_CHANNEL_ID = '1440593789042561096';

module.exports = {
  name: 'guildBanAdd',
  async execute(ban) {
    const { guild, user } = ban;

    const channel = guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!channel) return;

    let responsavel = 'Desconhecido';
    let motivo = 'Não informado';

    try {
      const logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd
      });

      const banLog = logs.entries.first();
      if (banLog && banLog.target.id === user.id) {
        responsavel = banLog.executor?.tag ?? responsavel;
        motivo = banLog.reason ?? motivo;
      }
    } catch (err) {
      console.error('Erro ao buscar audit logs:', err);
    }

    // 🗃️ REGISTRO NA FICHA
    const membros = lerMembros();
    if (membros[user.id]) {
      membros[user.id].dataSaida = Date.now();
      membros[user.id].tipoSaida = '⛔ Ban';
      membros[user.id].responsavelSaida = responsavel;
      membros[user.id].motivoSaida = motivo;
      membros[user.id].blacklist = true;
      salvarMembros(membros);
    }

    // 📋 EMBED (PADRÃO JOIN)
    const embed = new EmbedBuilder()
      .setColor('#8b0000')
      .setTitle('⛔ Registro de banimento')
      .setDescription(
        `Um usuário foi banido do servidor.\n\n` +
        `👤 Usuário: <@${user.id}>`
      )
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📛 Nome', value: user.tag, inline: true },
        { name: '🛡️ Responsável', value: responsavel, inline: true },
        { name: '📄 Motivo', value: motivo, inline: false }
      )
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: 'Sistema automático • Família RPG' })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
};
