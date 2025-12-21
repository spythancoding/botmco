const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerBlacklist, salvarBlacklist } = require('../utils/dataManager');
const { isFounder, isOwner } = require('../utils/permissions');

const BLACKPERM_ROLE_ID = '1451676459545661602';

function isLinkValido(texto) {
  return /^https?:\/\/\S+/i.test(texto);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackperm')
    .setDescription('Aplica blacklist permanente (irreversível)')
    .addUserOption(o =>
      o.setName('usuario').setDescription('Usuário').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('motivo').setDescription('Motivo').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('provas').setDescription('Links das provas').setRequired(true)
    ),

  async execute(interaction) {
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({ content: '❌ Acesso restrito.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo');
    const provas = interaction.options.getString('provas');

    if (!isLinkValido(provas)) {
      return interaction.reply({ content: '⚠️ Provas devem ser links válidos.', ephemeral: true });
    }

    const blacklist = lerBlacklist();

    if (blacklist[user.id]?.ativa) {
      return interaction.reply({
        content: '⚠️ Este usuário já possui blacklist ativa.',
        ephemeral: true
      });
    }

    // ☠️ REGISTRO DEFINITIVO
    blacklist[user.id] = {
      userId: user.id,
      tipo: 'PERM',
      motivo,
      provas,
      aplicadoPor: interaction.user.id,
      data: new Date().toISOString(),
      ativa: true
    };

    salvarBlacklist(blacklist);

    // 🎭 CARGOS (se estiver no servidor)
    const guildMember = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (guildMember) {
      const cargosRemover = guildMember.roles.cache.filter(r =>
        r.id !== interaction.guild.id && !r.managed
      );
      await guildMember.roles.remove(cargosRemover);
      await guildMember.roles.add(BLACKPERM_ROLE_ID);
    }

    // ☠️ DM FINAL (SEM PROVAS)
    try {
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#000000')
            .setTitle('🚫 BLACKLIST PERMANENTE')
            .setDescription(
              `Você foi **REMOVIDO DEFINITIVAMENTE** da Família MoChavãO.\n\n` +
              `Esta decisão é **IRREVERSÍVEL**.\n` +
              `Não haverá revisão ou recurso.`
            )
            .addFields({ name: '📌 Motivo', value: motivo })
            .setTimestamp()
        ]
      });
    } catch {}

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#000000')
          .setTitle('☠️ Blacklist Permanente Aplicada')
          .setDescription(`O usuário <@${user.id}> foi removido definitivamente.`)
      ]
    });
  }
};
