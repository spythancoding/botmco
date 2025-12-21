const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerBlacklist, salvarBlacklist } = require('../utils/dataManager');
const { isFounder, isOwner } = require('../utils/permissions');

const DEV_ID = '353946672549724161';

const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';
const BLACKPERM_ROLE_ID = '1451676459545661602';
const POS_BLACKLIST_ROLE_ID = '1439059436789305395';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rblacklist')
    .setDescription('Remove blacklist (temporária ou permanente)')
    .addUserOption(o =>
      o.setName('usuario')
        .setDescription('Usuário a ser liberado')
        .setRequired(true)
    ),

  async execute(interaction) {
    // 🔐 Permissão base
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({
        content: '❌ Acesso restrito.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('usuario');
    const blacklist = lerBlacklist();
    const registro = blacklist[user.id];

    // ❌ Não está em blacklist
    if (!registro) {
      return interaction.reply({
        content: '⚠️ Este usuário não possui blacklist ativa.',
        ephemeral: true
      });
    }

    // ⛔ BLOQUEIO TOTAL DE BLACKPERM
    if (registro.tipo === 'PERMANENTE' && interaction.user.id !== DEV_ID) {
      return interaction.reply({
        content:
          '⛔ **BLACKLIST PERMANENTE DETECTADA**\n\n' +
          'Esta punição é **irreversível** para a administração.\n' +
          'Somente o **DESENVOLVEDOR DO SISTEMA** pode removê-la.',
        ephemeral: true
      });
    }

    // 🧹 REMOVE DO blacklist.json
    delete blacklist[user.id];
    salvarBlacklist(blacklist);

    // 👤 Atualiza cargos (se estiver no servidor)
    try {
      const guildMember = await interaction.guild.members.fetch(user.id);

      if (guildMember.roles.cache.has(BLACKLIST_TEMP_ROLE_ID)) {
        await guildMember.roles.remove(BLACKLIST_TEMP_ROLE_ID);
      }

      if (guildMember.roles.cache.has(BLACKPERM_ROLE_ID)) {
        await guildMember.roles.remove(BLACKPERM_ROLE_ID);
      }

      if (!guildMember.roles.cache.has(POS_BLACKLIST_ROLE_ID)) {
        await guildMember.roles.add(POS_BLACKLIST_ROLE_ID);
      }
    } catch {
      // Usuário fora do servidor — registro já foi limpo
    }

    // 📩 DM FRIA
    try {
      await user.send(
        `Sua situação administrativa foi **reavaliada**.\n\n` +
        `A blacklist foi removida.\n\n` +
        `O seu comportamento seguirá sendo observado.`
      );
    } catch {}

    // ✅ CONFIRMAÇÃO
    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('✅ Blacklist Removida')
      .setDescription(
        `O usuário <@${user.id}> foi **liberado do sistema de blacklist**.`
      )
      .addFields({
        name: 'Executado por',
        value: `<@${interaction.user.id}>`
      })
      .setFooter({ text: 'Sistema Oficial da Família MoChavãO' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
