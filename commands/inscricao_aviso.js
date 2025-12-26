const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

const CANAL_INSCRICOES = '1450516667397439670';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscricao_aviso')
    .setDescription('Envia o aviso oficial e requisitos para inscrição'),

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 PERMISSÃO
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

    // 🧾 EMBED OFICIAL DE INSCRIÇÃO
    const avisoInscricaoEmbed = new EmbedBuilder()
      .setColor(0x8b0000) // vermelho escuro (autoridade)
      .setTitle('📝 Inscrição — Família MoChavãO')
      .setDescription(
        '**LEIA COM ATENÇÃO**\n\n' +
        'A **Família MoChavãO** é uma organização séria, baseada em **disciplina, respeito e compromisso coletivo**.\n\n' +
        'Buscamos pessoas que desejam **somar**, crescer junto à família e manter uma postura adequada dentro e fora do servidor.\n\n' +
        'Ao se inscrever, o candidato passará por um **período de teste de 5 dias**, onde será avaliado.'
      )
      .addFields(
        {
          name: '🩸 Durante o Período de Teste',
          value:
            '• Atividade constante\n' +
            '• Compromisso com a família\n' +
            '• Participação em call no Discord\n' +
            '• Boa convivência com os membros\n' +
            '• Respeito à hierarquia e organização'
        },
        {
          name: '✅ Pré-requisitos',
          value:
            '• Ser ativo\n' +
            '• Possuir Discord funcional\n' +
            '• Ter no mínimo **14 anos**\n' +
            '• Estar disposto a seguir regras e orientações'
        },
        {
          name: '🚫 Não Aceitamos',
          value:
            '• Líderes de outras famílias\n' +
            '• Membros em blacklist\n' +
            '• Pessoas envolvidas em conflitos externos\n' +
            '• Falta de respeito ou má conduta'
        },
        {
          name: '📌 Como se Inscrever',
          value:
            'Utilize o comando **/inscrever** neste servidor.\n' +
            'Preencha todas as informações com atenção.\n\n' +
            '**Boa sorte.** A decisão será baseada exclusivamente em sua postura.'
        }
      )
      .setFooter({
        text: 'Família MoChavãO • Organização, respeito e compromisso'
      })
      .setTimestamp();

    // 📢 ENVIO NO CANAL DE INSCRIÇÕES
    const canal = interaction.guild.channels.cache.get(CANAL_INSCRICOES);

    if (!canal) {
      return interaction.reply({
        content: '❌ Canal de inscrições não encontrado.',
        ephemeral: true
      });
    }

    await canal.send({ embeds: [avisoInscricaoEmbed] });

    // 🤫 Confirmação invisível
    return interaction.reply({
      content: '✅ Aviso de inscrição enviado com sucesso.',
      ephemeral: true
    });
  }
};
