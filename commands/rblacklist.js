const { SlashCommandBuilder } = require('discord.js');

const {
  lerBlacklist,
  salvarBlacklist,
  temBlacklistAtiva
} = require('../utils/dataManager');

const {
  embedErroBlacklist,
  embedConfirmacao,
  embedLogRemocao,
  embedDmFimBlacklist
} = require('../embeds/blacklistEmbeds');

const { isFounder, isOwner } = require('../utils/permissions');

const DEV_ID = '353946672549724161';

const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';
const BLACKPERM_ROLE_ID = '1451676459545661602';
const LOG_ADMIN_CHANNEL_ID = '1313574358459093044';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rblacklist')
    .setDescription('Encerra uma blacklist ativa')
    .addUserOption(o =>
      o.setName('usuario')
        .setDescription('Usuário')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({
        embeds: [embedErroBlacklist({ mensagem: 'Acesso restrito.' })],
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('usuario');

    if (!temBlacklistAtiva(user.id)) {
      return interaction.reply({
        embeds: [embedErroBlacklist({ mensagem: 'Este usuário não possui blacklist ativa.' })],
        ephemeral: true
      });
    }

    const blacklist = lerBlacklist();
    const registro = blacklist[user.id];

    // ⛔ BLOQUEIO DE PERMANENTE
    if (registro.tipo === 'PERM' && interaction.user.id !== DEV_ID) {
      return interaction.reply({
        embeds: [
          embedErroBlacklist({
            mensagem:
              'Blacklist permanente é irreversível.\nSomente o desenvolvedor do sistema pode removê-la.'
          })
        ],
        ephemeral: true
      });
    }

    // 🔓 ENCERRAR BLACKLIST
    registro.ativa = false;
    registro.removidaPor = interaction.user.id;
    registro.dataRemocao = new Date().toISOString();

    salvarBlacklist(blacklist);

    // 🎭 Atualiza cargos (remove punição)
    try {
      const guildMember = await interaction.guild.members.fetch(user.id);

      if (guildMember.roles.cache.has(BLACKLIST_TEMP_ROLE_ID)) {
        await guildMember.roles.remove(BLACKLIST_TEMP_ROLE_ID);
      }

      if (guildMember.roles.cache.has(BLACKPERM_ROLE_ID)) {
        await guildMember.roles.remove(BLACKPERM_ROLE_ID);
      }
    } catch {
      // usuário fora do servidor
    }

    // 📩 DM AO USUÁRIO
    await user.send({
      embeds: [
        embedDmFimBlacklist({
          tipo: registro.tipo
        })
      ]
    }).catch(() => {});

    // 📢 LOG ADMINISTRATIVO
    const logChannel = interaction.guild.channels.cache.get(LOG_ADMIN_CHANNEL_ID);
    if (logChannel) {
      logChannel.send({
        embeds: [
          embedLogRemocao({
            usuarioId: user.id,
            tipo: registro.tipo,
            executorId: interaction.user.id
          })
        ]
      });
    }

    // ✅ CONFIRMAÇÃO AO EXECUTOR
    return interaction.reply({
      embeds: [
        embedConfirmacao({
          titulo: '🔓 Blacklist Encerrada',
          descricao: `A blacklist de <@${user.id}> foi **encerrada com sucesso**.`
        })
      ]
    });
  }
};
