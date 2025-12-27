const { SlashCommandBuilder } = require('discord.js');

const {
  lerBlacklist,
  salvarBlacklist,
  temBlacklistAtiva,
  lerMembros,
  salvarMembros
} = require('../utils/dataManager');

const {
  embedErroBlacklist,
  embedDmBlacklistPerm,
  embedLogAplicacao,
  embedAvisoFamiliaBlacklist,
  embedConfirmacao
} = require('../embeds/blacklistEmbeds');

const { isFounder, isOwner } = require('../utils/permissions');

const BLACKPERM_ROLE_ID = '1451676459545661602';
const CANAL_AVISOS_FAMILIA = '1454489826748535061';
const LOG_BLACKLIST_CHANNEL_ID = '1313574376729350225';

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
        .setDescription('Provas (link)')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!isFounder(interaction.member) && !isOwner(interaction.member)) {
      return interaction.reply({
        embeds: [embedErroBlacklist({ mensagem: 'Acesso restrito.' })],
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const user = interaction.options.getUser('usuario');
    const motivo = interaction.options.getString('motivo');
    const provasInput = interaction.options.getString('provas');
    const provas = provasInput || 'Não informadas';

    if (provasInput && !isLinkValido(provasInput)) {
      return interaction.editReply({
        embeds: [embedErroBlacklist({ mensagem: 'Provas devem ser links válidos.' })]
      });
    }

    if (temBlacklistAtiva(user.id)) {
      return interaction.editReply({
        embeds: [embedErroBlacklist({ mensagem: 'Este usuário já possui blacklist ativa.' })]
      });
    }

    // ☠️ REGISTRO DEFINITIVO
    const blacklist = lerBlacklist();
    const agora = new Date();

    blacklist[user.id] = {
      id: user.id,
      tipo: 'PERM',
      motivo,
      provas,
      aplicadoPor: interaction.user.id,
      dataAplicacao: agora.toISOString(),
      ativa: true,
      origem: 'MANUAL',

      dias: null,
      inicio: null,
      fim: null,

      removidaPor: null,
      dataRemocao: null
    };

    salvarBlacklist(blacklist);

    // ❌ Remove da família
    const membros = lerMembros();
    if (membros[user.id]) {
      delete membros[user.id];
      salvarMembros(membros);
    }

    // 🎭 Cargos
    const guildMember = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (guildMember) {
      const cargosRemover = guildMember.roles.cache.filter(
        r => r.id !== interaction.guild.id && !r.managed
      );

      await guildMember.roles.remove(cargosRemover);
      await guildMember.roles.add(BLACKPERM_ROLE_ID);
    }

    // 📩 DM
    await user.send({
      embeds: [embedDmBlacklistPerm({ motivo })]
    }).catch(() => {});

    // 📢 Aviso à família
    const canalFamilia = interaction.guild.channels.cache.get(CANAL_AVISOS_FAMILIA);
    if (canalFamilia) {
      canalFamilia.send({
        embeds: [
          embedAvisoFamiliaBlacklist({
            usuarioId: user.id,
            tipo: 'PERM'
          })
        ]
      });
    }

    // 📢 Log administrativo
    const logChannel = interaction.guild.channels.cache.get(LOG_BLACKLIST_CHANNEL_ID);
    if (logChannel) {
      logChannel.send({
        embeds: [
          embedLogAplicacao({
            usuarioId: user.id,
            tipo: 'PERM',
            motivo,
            provas,
            executorId: interaction.user.id
          })
        ]
      });
    }

    // ✅ Confirmação
    return interaction.editReply({
      embeds: [
        embedConfirmacao({
          titulo: '☠️ Blacklist Permanente Aplicada',
          descricao: `O usuário <@${user.id}> foi **removido definitivamente** da família.`
        })
      ]
    });
  }
};
