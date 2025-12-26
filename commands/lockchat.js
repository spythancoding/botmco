const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');

const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lockchat')
    .setDescription('Bloqueia o chat para um usuário específico')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário que será bloqueado')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('motivo')
        .setDescription('Motivo do bloqueio')
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
    const motivo = interaction.options.getString('motivo');
    const canal = interaction.channel;

    // 🔒 Bloqueio direto no canal
    await canal.permissionOverwrites.edit(usuario.id, {
      SendMessages: false,
      AddReactions: false
    });

    const embed = new EmbedBuilder()
      .setColor(0xe67e22)
      .setTitle('🔒 Chat Bloqueado')
      .setDescription(
        `O usuário <@${usuario.id}> teve o envio de mensagens **bloqueado neste canal**.`
      )
      .addFields(
        { name: '📝 Motivo', value: motivo },
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
