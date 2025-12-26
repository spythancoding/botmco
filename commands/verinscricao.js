const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getInscricao } = require('../utils/dataManager');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verinscricao')
    .setDescription('Ver inscrição detalhada de um usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário que está inscrito')
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
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }

    const usuario = interaction.options.getUser('usuario');

    const inscricao = getInscricao(usuario.id);

    if (!inscricao || inscricao.status !== 'pendente_inscricao') {
      return interaction.reply({
        content: '📭 Este usuário não possui inscrição ativa.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
  .setColor(0x8e44ad) // roxo elegante
  .setTitle('📋 Inscrição — Família MoChavãO')
  .setDescription(
    `👤 **Candidato:** <@${usuario.id}>\n` +
    `🆔 **ID:** \`${usuario.id}\``
  )
  .addFields(
    {
      name: '🎮 Dados do Jogo',
      value:
        `**Nick:** ${inscricao.nick || '—'}\n` +
        `**Nível:** ${inscricao.nivelConta || '—'}\n` +
        `**Horas RG:** ${inscricao.horasRG || '—'}`,
      inline: true
    },
    {
      name: '🧑 Dados Pessoais',
      value:
        `**Nome:** ${inscricao.nome || '—'}\n` +
        `**Idade:** ${inscricao.idade || '—'}`,
      inline: true
    },
    {
      name: '🎧 Comunicação',
      value:
        `🎤 **Microfone:** ${inscricao.microfone || '—'}\n` +
        `📞 **Call:** ${inscricao.call || '—'}`,
      inline: true
    },
    {
      name: '🛡️ Organização',
      value:
        `**Líder de Org:** ${inscricao.liderOrg || '—'}\n` +
        `⏰ **Horário:** ${inscricao.horario || '—'}`,
      inline: true
    },
    {
      name: '📝 Observações do Candidato',
      value:
        inscricao.observacoes?.trim()
          ? `> ${inscricao.observacoes}`
          : '_Nenhuma observação informada._',
      inline: false
    }
  )
  .setFooter({
    text: 'Status: Inscrição Pendente • Sistema MoChavãO'
  })
  .setTimestamp(new Date(inscricao.dataInscricao));


    return interaction.reply({ embeds: [embed] });
  }
};
