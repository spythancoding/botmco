const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getInscricao } = require('../utils/dataManager');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

const safe = v => v ? String(v) : 'Não informado';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verinscricao')
    .setDescription('Ver inscrição detalhada de um usuário')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário inscrito')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;

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
    const inscricao = getInscricao(usuario.id);

    if (!inscricao || inscricao.status !== 'pendente_inscricao') {
      return interaction.reply({
        content: '❌ Inscrição pendente não encontrada para este usuário.',
        ephemeral: true
      });
    }

    const d = inscricao.dados;

    const embed = new EmbedBuilder()
      .setColor('#e74c3c')
      .setTitle('📥 Nova Inscrição Recebida')
      .setDescription(
        'Uma nova candidatura foi enviada para a **Família MoChavãO**.\n' +
        'Analise os dados abaixo com atenção.'
      )
      .addFields(
        { name: '🆔 Discord ID', value: usuario.id },

        { name: '👤 Identificação', value:
          `**Nick:** ${safe(d.nick)}\n` +
          `**Nome:** ${safe(d.nome)}\n` +
          `**Idade:** ${safe(d.idade)}`
        },

        { name: '🎮 Conta no Servidor', value:
          `**Nível:** ${safe(d.nivelConta)}\n` +
          `**Horas no /RG:** ${safe(d.horasRG)}\n` +
          `**Liderança:** ${safe(d.liderOrg)}`
        },

        { name: '🎙️ Comunicação', value:
          `**Microfone:** ${safe(d.microfone)}\n` +
          `**Call:** ${safe(d.call)}`
        },

        { name: '⏰ Disponibilidade', value: safe(d.horario) },

        { name: '📝 Observações', value: safe(d.observacoes) }
      )
      .setFooter({ text: 'Sistema de Inscrição • Família MoChavãO' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
