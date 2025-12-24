const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { normalizarCargos } = require('../utils/cargosNormalizer');
const { isFounder, isOwner } = require('../utils/permissions');

const VISITANTE_ROLE_ID = '1439059436789305395';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('normalizar')
    .setDescription('Normaliza cargos do servidor (Visitante como base)'),

  async execute(interaction) {
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({
        content: '❌ Acesso restrito.',
        ephemeral: true
      });
    }

    await interaction.deferReply({ });

    const membros = await interaction.guild.members.fetch();
    let ajustados = 0;

    for (const membro of membros.values()) {
      const alterou = await normalizarCargos(
        membro,
        VISITANTE_ROLE_ID
      );
      if (alterou) ajustados++;
    }

    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('✅ Normalização concluída')
          .setDescription(
            `Cargos normalizados em **${ajustados} usuários**.\n\n` +
            `Visitante mantido como cargo base absoluto.`
          )
          .setFooter({ text: 'Sistema Administrativo • Família MoChavãO' })
          .setTimestamp()
      ]
    });
  }
};
