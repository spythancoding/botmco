const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const { lerMembros } = require('../utils/dataManager');

const INSCRICAO_SITE_URL = 'https://mochavao-inscricao.vercel.app/'; // 🔴 ajuste depois

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscrever')
    .setDescription('Inscrição para a família MoChavãO'),

  async execute(interaction) {

    // ======================
    // 🔒 BLOQUEIO: JÁ É MEMBRO
    // ======================
    const membros = lerMembros();

    if (membros[interaction.user.id]) {
      return interaction.reply({
        content:
          '❌ Você já faz parte da Família **MoChavãO** e não pode criar uma nova inscrição.',
        ephemeral: true
      });
    }

    // ======================
    // 🔗 LINK PERSONALIZADO
    // ======================
    const link = `${INSCRICAO_SITE_URL}?uid=${interaction.user.id}`;

    const embed = new EmbedBuilder()
      .setColor('#c0392b')
      .setTitle('📥 Inscrição • Família MoChavãO')
      .setDescription(
        'Para prosseguir com sua inscrição, clique no botão abaixo.\n\n' +
        '⚠️ **Preencha com atenção** todas as informações solicitadas.'
      )
      .addFields({
        name: '🔗 Link de Inscrição',
        value: `[Clique aqui para iniciar](${link})`
      })
      .setFooter({
        text: 'Família MoChavãO • Sistema Oficial de Inscrição'
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
