const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlockchat')
    .setDescription('Desbloqueia o chat para um usuário')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário que será desbloqueado')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 Permissão
    if (
      !isFounder(member) &&
      !isOwner(member) &&
      !isSubOwner(member)
    ) {
      return interaction.reply({
        content: '❌ Você não tem permissão.',
        ephemeral: true
      });
    }

    const usuario = interaction.options.getUser('usuario');
    const canal = interaction.channel;

    // 🔓 Remove overwrite
    await canal.permissionOverwrites.delete(usuario.id).catch(() => {});

    const embed = new EmbedBuilder()
      .setColor(0x2ecc71)
      .setTitle('🔓 Chat Desbloqueado')
      .setDescription(
        `O usuário <@${usuario.id}> teve o chat **liberado neste canal**.`
      )
      .addFields(
        { name: '👮 Ação por', value: interaction.user.tag, inline: true },
        { name: '📍 Canal', value: canal.name, inline: true }
      )
      .setFooter({
        text: 'Sistema Disciplinar • Família MoChavãO'
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
