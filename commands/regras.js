const { SlashCommandBuilder } = require('discord.js');
const { regrasEmbed } = require('../embeds/regrasEmbed');
const cooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regras')
    .setDescription('Mostra as regras da comunidade'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const agora = Date.now();

    // Cooldown por servidor
    if (cooldowns.has(guildId)) {
      const ultimoEnvio = cooldowns.get(guildId);
      const diff = agora - ultimoEnvio;

      if (diff < 3600000) {
        const restante = Math.ceil((3600000 - diff) / 60000);
        return interaction.reply({
          content: `⏳ As regras já foram enviadas recentemente. Aguarde ${restante} minuto(s).`,
          ephemeral: true
        });
      }
    }

    // Confirmação invisível (ninguém vê quem usou o comando)
    await interaction.reply({
      content: '📜 Regras enviadas com sucesso.',
      ephemeral: true
    });

    // Envia o embed diretamente no canal
    await interaction.channel.send({
      embeds: [regrasEmbed]
    });

    // Atualiza cooldown
    cooldowns.set(guildId, agora);
  }
};
