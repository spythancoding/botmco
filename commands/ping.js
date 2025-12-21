const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Verifica se o bot está online'),

  async execute(interaction) {
    await interaction.reply('Ao vivo e a CORES!');
  },
};