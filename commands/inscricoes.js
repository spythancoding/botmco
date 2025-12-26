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
    .setDescription('Ver lista de inscrições pendentes'),

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 Permissão
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
        content: '📭 Nenhuma inscrição pendente no momento.',
        ephemeral: true
      });
    }

    // 🧾 Lista numerada (limite seguro)
    const listaUsuarios = inscritos
      .slice(0, 25)
      .map((i, index) => `**${index + 1}.** <@${i.userId}>`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x5865F2) // Azul Discord
      .setTitle('📊 Inscrições Pendentes')
      .setDescription(
        `Total de inscrições aguardando análise: **${inscritos.length}**\n\n` +
        listaUsuarios
      )
      .setFooter({
        text: 'Use /verinscricao @usuário para ver os detalhes'
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
