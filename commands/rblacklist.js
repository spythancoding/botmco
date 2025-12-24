const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerBlacklist, salvarBlacklist } = require('../utils/dataManager');
const { isFounder, isOwner } = require('../utils/permissions');

const DEV_ID = '353946672549724161';

const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';
const BLACKPERM_ROLE_ID = '1451676459545661602';
const CARGO_MEMBRO = '1439059436789305395'; // membro comum
const LOG_ADMIN_CHANNEL_ID = '1313574358459093044';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rblacklist')
    .setDescription('Encerra afastamento por blacklist temporária')
    .addUserOption(o =>
      o.setName('usuario')
        .setDescription('Usuário a ser reintegrado')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({
        content: '❌ Acesso restrito.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('usuario');
    const blacklist = lerBlacklist();
    const registro = blacklist[user.id];

    if (!registro) {
      return interaction.reply({
        content: '⚠️ Este usuário não possui blacklist ativa.',
        ephemeral: true
      });
    }

    // ⛔ BLACKLIST PERMANENTE (bloqueio total)
    if (registro.tipo === 'PERM' && interaction.user.id !== DEV_ID) {
      return interaction.reply({
        content:
          '⛔ **BLACKLIST PERMANENTE**\n\n' +
          'Esta punição é **irreversível**.\n' +
          'Somente o **DESENVOLVEDOR DO SISTEMA** pode removê-la.',
        ephemeral: true
      });
    }

    // 🧹 Remove registro
    delete blacklist[user.id];
    salvarBlacklist(blacklist);

    // 👤 Atualiza cargos (se estiver no servidor)
    let guildMember = null;
    try {
      guildMember = await interaction.guild.members.fetch(user.id);

      if (guildMember.roles.cache.has(BLACKLIST_TEMP_ROLE_ID)) {
        await guildMember.roles.remove(BLACKLIST_TEMP_ROLE_ID);
      }

      if (guildMember.roles.cache.has(BLACKPERM_ROLE_ID)) {
        await guildMember.roles.remove(BLACKPERM_ROLE_ID);
      }

      // ➕ Retorno como MEMBRO COMUM
      if (!guildMember.roles.cache.has(CARGO_MEMBRO)) {
        await guildMember.roles.add(CARGO_MEMBRO);
      }
    } catch {
      // usuário fora do servidor
    }

    // 📩 DM AO USUÁRIO
    try {
      await user.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✅ Retorno Liberado')
            .setDescription(
              `Seu **afastamento temporário** foi encerrado.\n\n` +
              `Você retornou à Família MoChavãO como **membro comum**.\n\n` +
              `⚠️ Mantenha uma postura adequada para evitar novas punições.`
            )
            .setFooter({ text: 'Administração da Família MoChavãO' })
            .setTimestamp()
        ]
      });
    } catch {}

    // 📢 LOG ADMINISTRATIVO (RETORNO)
    const logChannel = interaction.guild.channels.cache.get(LOG_ADMIN_CHANNEL_ID);
    if (logChannel && registro.tipo === 'TEMP') {
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🔓 Retorno de Blacklist Temporária')
            .addFields(
              { name: '👤 Usuário', value: `<@${user.id}>` },
              { name: '📌 Motivo original', value: registro.motivo || 'Não informado' },
              { name: '🛡️ Liberado por', value: `<@${interaction.user.id}>` }
            )
            .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
            .setTimestamp()
        ]
      });
    }

    // ✅ CONFIRMAÇÃO AO EXECUTOR
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('✅ Blacklist Encerrada')
          .setDescription(
            `O usuário <@${user.id}> foi **reintegrado como membro comum**.`
          )
          .setTimestamp()
      ]
    });
  }
};
