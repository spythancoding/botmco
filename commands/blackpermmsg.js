const { SlashCommandBuilder } = require('discord.js');
const { isFounder, isOwner } = require('../utils/permissions');

const BLACKPERM_CHANNEL_ID = '1451677241011605636';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackpermmsg')
    .setDescription('Publica a mensagem final de blacklist permanente'),

  async execute(interaction) {
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({
        content: '❌ Acesso negado.',
        ephemeral: true
      });
    }

    const canal = interaction.guild.channels.cache.get(BLACKPERM_CHANNEL_ID);
    if (!canal) {
      return interaction.reply({
        content: '⚠️ Canal de blacklist permanente não encontrado.',
        ephemeral: true
      });
    }

    const mensagem = require('../embeds/blackpermMessage');

    const msg = await canal.send({ content: mensagem });

    try {
      await msg.pin();
    } catch (e) {}

    return interaction.reply({
      content: '✅ Mensagem de adeus publicada e fixada.',
      ephemeral: true
    });
  }
};
