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
      o.setName('usuario').setDescription('Usuário').setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName('dias')
        .setDescription('Duração (1 a 30 dias)')
        .setMinValue(1)
        .setMaxValue(30)
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('motivo').setDescription('Motivo').setRequired(true)
    )
    .addStringOption(o =>
      o.setName('provas').setDescription('Provas (link)').setRequired(true)
    ),

  async execute(interaction) {
    if (!isFounder(interaction.member) && !isOwner(interaction.member) && !isSubOwner(interaction.member)) {
      return interaction.reply({ content: '❌ Acesso negado.', ephemeral: true });
    }

    const user = interaction.options.getUser('usuario');
    const dias = interaction.options.getInteger('dias');
    const motivo = interaction.options.getString('motivo');
    const provas = interaction.options.getString('provas');

    if (!isLinkValido(provas)) {
      return interaction.reply({ content: '⚠️ Provas devem ser links.', ephemeral: true });
    }

    const blacklist = lerBlacklist();

    if (blacklist[user.id]?.ativa) {
      return interaction.reply({
        content: '⚠️ Este usuário já possui blacklist ativa.',
        ephemeral: true
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
      await guildMember.roles.add(BLACKLIST_TEMP_ROLE_ID);
    }

    // 📢 LOG
    const logChannel = interaction.guild.channels.cache.get(LOG_BLACKLIST_CHANNEL_ID);
    if (logChannel) {
      logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#c0392b')
            .setTitle('⛔ Blacklist Temporária')
            .addFields(
              { name: 'Usuário', value: `<@${user.id}>` },
              { name: 'Duração', value: `${dias} dias` },
              { name: 'Motivo', value: motivo },
              { name: 'Provas', value: provas }
            )
            .setTimestamp()
        ]
      });
    }

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#c0392b')
          .setTitle('⛔ Blacklist Aplicada')
          .setDescription(`Usuário <@${user.id}> punido por ${dias} dias.`)
      ]
    });
  }
};
