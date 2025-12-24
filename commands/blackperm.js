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
      o.setName('usuario')
        .setDescription('Usuário')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('motivo')
        .setDescription('Motivo')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('provas')
        .setDescription('Provas (link) – opcional')
        .setRequired(false)
    ),

  async execute(interaction) {
    // 🔐 Permissão
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({
        content: '❌ Acesso restrito.',
        ephemeral: true
      });
    }

    // ⏳ Segura a interaction (cargos + IO)
    await interaction.deferReply();

    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo');
    const provasInput = interaction.options.getString('provas');
    const provas = provasInput || 'Não informadas';

    // 🔎 Valida provas SOMENTE se informadas
    if (provasInput && !isLinkValido(provasInput)) {
      return interaction.editReply({
        content: '⚠️ Provas devem ser links válidos.'
      });
    }

    const blacklist = lerBlacklist();

    if (blacklist[user.id]?.ativa) {
      return interaction.editReply({
        content: '⚠️ Este usuário já possui blacklist ativa.'
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
      ativa: true,
      origem: 'MANUAL'
    };

    salvarBlacklist(blacklist);

    // 🎭 Atualização de cargos
    const guildMember = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (guildMember) {
      const cargosRemover = guildMember.roles.cache.filter(
        r => r.id !== interaction.guild.id && !r.managed
      );
      await guildMember.roles.remove(cargosRemover);
      await guildMember.roles.add(BLACKPERM_ROLE_ID);
    }

    // ☠️ DM FINAL (sem provas)
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
            .addFields(
              { name: '📌 Motivo', value: motivo }
            )
            .setFooter({ text: 'Administração da Família MoChavãO' })
            .setTimestamp()
        ]
      });
    } catch {}

    // ✅ CONFIRMAÇÃO AO ADMINISTRADOR
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#000000')
          .setTitle('☠️ Blacklist Permanente Aplicada')
          .setDescription(
            `O usuário <@${user.id}> foi **removido definitivamente** da família.`
          )
          .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
          .setTimestamp()
      ]
    });
  }
};
