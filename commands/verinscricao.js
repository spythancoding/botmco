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

    const embeds = inscritos.map((i, idx) =>
      new EmbedBuilder()
        .setColor('#9b59b6')
        .setTitle(`📋 Inscrição #${idx + 1}`)
        .addFields(
          { name: '👤 Usuário', value: `<@${i.userId}>`, inline: true },
          { name: '🎮 Nick', value: i.nick, inline: true },
          { name: '⭐ Nível', value: i.nivel, inline: true },
          { name: '🎂 Idade', value: i.idade, inline: true },
          { name: '🛡️ Líder Org', value: i.liderOrg, inline: true },
          { name: '🤝 Indicação', value: i.indicacao || 'Nenhuma', inline: true }
        )
        .setFooter({ text: 'Status: Pendente' })
        .setTimestamp()
    );

    await interaction.reply({ embeds });
  }
};
