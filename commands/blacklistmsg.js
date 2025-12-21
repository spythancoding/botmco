const { SlashCommandBuilder } = require('discord.js');
const { isFounder, isOwner } = require('../utils/permissions');

const BLACKLIST_CHANNEL_ID = '1451677241011605636';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklistmsg')
    .setDescription('Publica a mensagem institucional da blacklist'),

  async execute(interaction) {
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({ content: 'Acesso negado.', ephemeral: true });
    }

    const canal = interaction.guild.channels.cache.get(BLACKLIST_CHANNEL_ID);
    if (!canal) {
      return interaction.reply({
        content: 'Canal de blacklist não encontrado.',
        ephemeral: true
      });
    }

    const mensagem = require('../embeds/blacklistMessage');

    const msg = await canal.send({ content: mensagem });

    try {
      await msg.pin();
    } catch (e) {}

    return interaction.reply({
      content: 'Mensagem publicada e fixada.',
      ephemeral: true
    });
  }
};
