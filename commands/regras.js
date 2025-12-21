const { SlashCommandBuilder } = require('discord.js');
const { regrasEmbed } = require('../embeds/regrasEmbed'); // Importa o embed
const cooldowns = new Map(); // Armazena o tempo do último envio por servidor

module.exports = {
  data: new SlashCommandBuilder()
    .setName('regras')
    .setDescription('Mostra as regras da comunidade'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const agora = Date.now();

    // Se já houver cooldown
    if (cooldowns.has(guildId)) {
      const ultimoEnvio = cooldowns.get(guildId);
      const diff = agora - ultimoEnvio;

      // 60 minutos = 3600000 ms
      if (diff < 3600000) {
        const restante = Math.ceil((3600000 - diff) / 60000);
        return interaction.reply({
          content: `⏳ As regras já foram enviadas recentemente. Aguarde ${restante} minuto(s).`,
          ephemeral: true
        });
      }
    }

    // Envia o embed
    await interaction.reply({ embeds: [regrasEmbed] });

    // Atualiza o cooldown
    cooldowns.set(guildId, agora);
  }
};
