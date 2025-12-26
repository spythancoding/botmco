const { SlashCommandBuilder } = require('discord.js');
const { infofamiliaEmbed } = require('../embeds/infofamiliaEmbed');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('infofamilia')
    .setDescription('Envia a mensagem oficial de informações da família'),

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

    // 📢 Envia a embed no canal atual
    await interaction.channel.send({
      embeds: [infofamiliaEmbed]
    });

    // 🤫 Resposta invisível para o público
    return interaction.reply({
      content: 'Mensagem enviada com sucesso.',
      ephemeral: true
    });
  }
};
