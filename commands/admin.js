const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Painel administrativo da Família MoChavãO'),

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

    const embed = new EmbedBuilder()
      .setColor(0x8b0000) // vermelho escuro (autoridade)
      .setTitle('🛠️ Painel Administrativo — Família MoChavãO')
      .setDescription(
        'Este painel reúne os **principais comandos administrativos** disponíveis.\n' +
        'Utilize com responsabilidade e sempre respeitando a hierarquia da família.'
      )

      // ======================
      // FAMÍLIA
      // ======================
      .addFields(
        {
          name: '👥 Gerenciamento da Família',
          value:
            '`/familia adicionar <usuário> <cargo>` — Adiciona membro à família\n' +
            '`/familia remover <usuário>` — Remove membro da família\n' +
            '`/familia listar` — Lista completa de membros'
        },

        // ======================
        // INSCRIÇÕES
        // ======================
        {
          name: '📝 Sistema de Inscrições (Site Oficial)',
          value:
            '• Inscrições realizadas **exclusivamente pelo site**\n\n' +
            '`/inscricoes` — Lista inscrições pendentes\n' +
            '`/verinscricao <usuário>` — Ver detalhes da inscrição\n' +
            '`/inscricao aprovar <usuário>` — Aprovar inscrição\n' +
            '`/inscricao reprovar <usuário> <motivo>` — Reprovar inscrição\n' +
            '`/inscricao reprovartodos` — Reprovar todas as inscrições pendentes'
        },

        // ======================
        // TESTE
        // ======================
        {
          name: '🧪 Sistema de Teste',
          value:
            '`/verteste` — Ver membros em período de teste\n' +
            '`/teste aprovar <usuário>` — Aprovar período de teste\n' +
            '`/teste reprovar <usuário> <motivo>` — Reprovar período de teste'
        },

        // ======================
        // DISCIPLINA
        // ======================
        {
          name: '⚠️ Sistema Disciplinar',
          value:
            '`/adv aplicar <usuário> <motivo> [provas]` — Aplicar advertência\n' +
            '`/adv retirar <usuário>` — Retirar última advertência\n' +
            '• **3 advertências ⇒ blacklist automática (5 dias)**'
        },

        // ======================
        // BLACKLIST
        // ======================
        {
          name: '⛔ Sistema de Blacklist',
          value:
            '`/blacklist <usuário> <dias> <motivo> [provas]` — Blacklist temporária\n' +
            '`/blackperm <usuário> <motivo> <provas>` — Blacklist permanente\n' +
            '`/rblacklist <usuário>` — Remover blacklist'
        },

        // ======================
        // MODERAÇÃO
        // ======================
        {
          name: '🧹 Moderação & Controle',
          value:
            '`/limparchat <quantidade>` — Apaga mensagens do canal\n' +
            '`/lockchat <usuário> <motivo>` — Bloqueia o chat para um usuário\n' +
            '`/unlockchat <usuário>` — Libera o chat do usuário'
        },

        // ======================
        // INFORMAÇÃO
        // ======================
        {
          name: '📢 Comunicação & Informação',
          value:
            '`/infofamilia` — Envia informações oficiais da família\n' +
            '`/inscricao_aviso` — Envia aviso e requisitos de inscrição'
        },

        // ======================
        // DESENVOLVIMENTO
        // ======================
        {
          name: '🚧 Sistemas em Evolução',
          value:
            '• Normalização avançada de cargos\n' +
            '• Histórico completo de ações administrativas\n' +
            '• Sistema disciplinar aprimorado\n' +
            '• Onboarding interativo pós-aprovação'
        }
      )
      .setFooter({
        text: 'Sistema Administrativo • Família MoChavãO'
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
