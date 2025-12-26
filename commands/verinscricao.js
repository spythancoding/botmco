const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerInscritos } = require('../utils/dataManager');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verinscricao')
    .setDescription('Ver inscrições pendentes (detalhado)'),  

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 Permissão
    if (
      !isFounder(member) &&
      !isOwner(member) &&
      !isSubOwner(member)
    ) {
      return interaction.reply('❌ Você não tem permissão para usar este comando.');
    }

    const inscritos = Object.values(lerInscritos())
      .filter(i => i.status === 'pendente_inscricao');

    if (!inscritos.length) {
      return interaction.reply('📭 Não há inscrições pendentes.');
    }

    // ⚠️ Limite do Discord: 10 embeds por mensagem
    const embeds = inscritos.slice(0, 10).map((i, index) => {
      return new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle(`📋 Inscrição #${index + 1}`)
        .setDescription(`👤 Usuário: <@${i.userId}>`)
        .addFields(
          {
            name: '🎮 Nick',
            value: i.nick || 'Não informado',
            inline: true
          },
          {
            name: '🧑 Nome',
            value: i.nome || 'Não informado',
            inline: true
          },
          {
            name: '🎂 Idade',
            value: i.idade ? `${i.idade}` : 'Não informado',
            inline: true
          },
          {
            name: '⭐ Nível',
            value: i.nivelConta || i.nivel || 'Não informado',
            inline: true
          },
          {
            name: '⏱️ Horas RG',
            value: i.horasRG || 'Não informado',
            inline: true
          },
          {
            name: '🛡️ Líder Org',
            value: i.liderOrg || 'Não informado',
            inline: true
          },
          {
            name: '🎧 Microfone',
            value: i.microfone || 'Não informado',
            inline: true
          },
          {
            name: '📞 Call',
            value: i.call || 'Não informado',
            inline: true
          },
          {
            name: '⏰ Horário',
            value: i.horario || 'Não informado',
            inline: true
          },
          {
            name: '📝 Observações',
            value: i.observacoes?.trim() || 'Nenhuma',
            inline: false
          }
        )
        .setFooter({ text: 'Status: Pendente' })
        .setTimestamp(new Date(i.dataInscricao));
    });

    return interaction.reply({ embeds });
  }
};
