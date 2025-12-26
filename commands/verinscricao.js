const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerInscritos } = require('../utils/dataManager');
const { isFounder, isOwner, isSubOwner } = require('../utils/permissions');

function v(valor) {
  if (!valor) return '—';
  if (typeof valor === 'string' && valor.trim() === '') return '—';
  return String(valor);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verinscricao')
    .setDescription('Ver inscrições pendentes'),

  async execute(interaction) {
    const member = interaction.member;

    if (
      !isFounder(member) &&
      !isOwner(member) &&
      !isSubOwner(member)
    ) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }

    const inscritos = Object.values(lerInscritos())
      .filter(i => i.status === 'pendente_inscricao');

    if (!inscritos.length) {
      return interaction.reply({
        content: '📭 Nenhuma inscrição pendente.',
        ephemeral: true
      });
    }

    const embeds = inscritos.map((i, idx) => {
      const d = i.dados || {};

      return new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle(`📋 Inscrição #${idx + 1}`)
        .addFields(
          { name: '👤 Usuário', value: `<@${i.userId}>`, inline: true },
          { name: '🎮 Nick', value: v(d.nick), inline: true },
          { name: '📛 Nome', value: v(d.nome), inline: true },

          { name: '🎂 Idade', value: v(d.idade), inline: true },
          { name: '⭐ Nível', value: v(d.nivelConta), inline: true },
          { name: '⏱️ Horas RG', value: v(d.horasRG), inline: true },

          { name: '🛡️ Líder Org', value: v(d.liderOrg), inline: true },
          { name: '🎧 Microfone', value: v(d.microfone), inline: true },
          { name: '📞 Call', value: v(d.call), inline: true },

          { name: '⏰ Horário', value: v(d.horario), inline: true },
          { name: '📱 WhatsApp', value: v(d.whatsapp), inline: true },

          {
            name: '📝 Observações',
            value: v(d.observacoes),
            inline: false
          }
        )
        .setFooter({ text: 'Status: Pendente' })
        .setTimestamp();
    });

    await interaction.reply({ embeds });
  }
};
