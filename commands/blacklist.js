const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerBlacklist, salvarBlacklist } = require('../utils/dataManager');
const { isFounder, isOwner, isSubOwner } = require('../utils/permissions');

const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';
const LOG_BLACKLIST_CHANNEL_ID = '1313574376729350225';

function isLinkValido(texto) {
  return /^https?:\/\/\S+/i.test(texto);
}

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
        .setDescription('Provas (link) – opcional')
        .setRequired(false)
    ),

  async execute(interaction) {
    if (
      !isFounder(interaction.member) &&
      !isOwner(interaction.member) &&
      !isSubOwner(interaction.member)
    ) {
      return interaction.reply({
        content: '❌ Acesso negado.',
        ephemeral: true
      });
    }

    // ⏳ Segura interaction (pode envolver cargos)
    await interaction.deferReply();

    const user = interaction.options.getUser('usuario');
    const dias = interaction.options.getInteger('dias');
    const motivo = interaction.options.getString('motivo');
    const provasInput = interaction.options.getString('provas');
    const provas = provasInput || 'Não informadas';

    // 🔎 Validação SOMENTE se provas forem informadas
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

    const inicio = new Date();
    const fim = calcularFim(dias);

    blacklist[user.id] = {
      userId: user.id,
      tipo: 'TEMP',
      dias,
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      motivo,
      provas,
      aplicadoPor: interaction.user.id,
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
      await guildMember.roles.add(BLACKLIST_TEMP_ROLE_ID);
    }

    // 📢 LOG ADMINISTRATIVO
    const logChannel = interaction.guild.channels.cache.get(LOG_BLACKLIST_CHANNEL_ID);
    if (logChannel) {
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#c0392b')
            .setTitle('⛔ Blacklist Temporária Aplicada')
            .addFields(
              { name: '👤 Usuário', value: `<@${user.id}>` },
              { name: '⏳ Duração', value: `${dias} dias` },
              { name: '📌 Motivo', value: motivo },
              { name: '🔗 Provas', value: provas }
            )
            .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
            .setTimestamp()
        ]
      });
    }

    // ✅ CONFIRMAÇÃO
    return interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor('#c0392b')
          .setTitle('⛔ Blacklist Aplicada')
          .setDescription(
            `O usuário <@${user.id}> foi **afastado por ${dias} dias**.`
          )
          .setTimestamp()
      ]
    });
  }
};
