const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerInscritos } = require('../utils/dataManager');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscricoes')
    .setDescription('Ver inscrições pendentes'),

  async execute(interaction) {
    const member = interaction.member;

    if (
      !isFounder(member) &&
      !isOwner(member) &&
      !isSubOwner(member)
    ) {
      return interaction.reply({
        content: '❌ Você não tem permissão.',
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

    // Lista apenas menções
    const listaUsuarios = inscritos
      .map(i => `👤 <@${i.userId}>`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📊 Inscrições Pendentes (${inscritos.length})`)
      .setDescription(listaUsuarios)
      .setFooter({
        text: 'Use /verinscricao @usuário para ver os detalhes'
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
