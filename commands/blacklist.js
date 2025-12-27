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
  embedDmBlacklistTemp,
  embedLogAplicacao,
  embedAvisoFamiliaBlacklist,
  embedConfirmacao
} = require('../embeds/blacklistEmbeds');

const { isFounder, isOwner, isSubOwner } = require('../utils/permissions');

const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';
const CANAL_AVISOS_FAMILIA = '1454489826748535061';
const LOG_BLACKLIST_CHANNEL_ID = '1313574376729350225';

function calcularFim(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d;
}



module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Aplica blacklist temporária')
    .addUserOption(o =>
      o.setName('usuario')
        .setDescription('Usuário')
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('dias')
        .setDescription('Duração (1 a 30 dias)')
        .setMinValue(1)
        .setMaxValue(30)
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
    if (
      !isFounder(interaction.member) &&
      !isOwner(interaction.member) &&
      !isSubOwner(interaction.member)
    ) {
      return interaction.reply({
        embeds: [embedErroBlacklist({ mensagem: 'Acesso restrito.' })],
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const user = interaction.options.getUser('usuario');
    const dias = interaction.options.getInteger('dias');
    const motivo = interaction.options.getString('motivo');
    const provasInput = interaction.options.getString('provas');
    const provas = provasInput || 'Não informadas';


    if (temBlacklistAtiva(user.id)) {
      return interaction.editReply({
        embeds: [embedErroBlacklist({ mensagem: 'Este usuário já possui blacklist ativa.' })]
      });
    }

    // 🧾 REGISTRO DA BLACKLIST
    const inicio = new Date();
    const fim = calcularFim(dias);
    const blacklist = lerBlacklist();

    blacklist[user.id] = {
      id: user.id,
      tipo: 'TEMP',
      dias,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      motivo,
      provas,
      aplicadoPor: interaction.user.id,
      dataAplicacao: inicio.toISOString(),
      ativa: true,
      origem: 'MANUAL',

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
      await guildMember.roles.add(BLACKLIST_TEMP_ROLE_ID);
    }

    // 📩 DM
    await user.send({
      embeds: [embedDmBlacklistTemp({ dias, motivo })]
    }).catch(() => {});

    // 📢 Aviso à família
    const canalFamilia = interaction.guild.channels.cache.get(CANAL_AVISOS_FAMILIA);
    if (canalFamilia) {
      canalFamilia.send({
        embeds: [
          embedAvisoFamiliaBlacklist({
            usuarioId: user.id,
            tipo: 'TEMP',
            dias
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
            tipo: 'TEMP',
            dias,
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
          titulo: '⛔ Blacklist Temporária Aplicada',
          descricao: `O usuário <@${user.id}> foi afastado por **${dias} dias**.`
        })
      ]
    });
  }
};
