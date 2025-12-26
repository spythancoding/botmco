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
      .setColor(0x8b0000) // vermelho escuro — autoridade
      .setTitle('🛠️ Painel Administrativo — Família MoChavãO')
      .setDescription(
        'Este painel reúne os **comandos administrativos oficiais** da Família **MoChavãO**.\n' +
        'Utilize com responsabilidade, sempre respeitando a **hierarquia, disciplina e postura**.'
      )

      // ======================
      // FAMÍLIA
      // ======================
      .addFields(
        {
          name: '👥 Gerenciamento da Família',
          value:
            '`/familia adicionar <usuário> <cargo>` — Adicionar membro\n' +
            '`/familia remover <usuário>` — Remover membro\n' +
            '`/familia listar` — Listagem geral da família'
        },

        // ======================
        // INSCRIÇÕES
        // ======================
        {
          name: '📝 Sistema de Inscrições',
          value:
            '• Inscrições realizadas **exclusivamente pelo site oficial**\n\n' +
            '`/inscricoes` — Listar inscrições pendentes\n' +
            '`/verinscricao <usuário>` — Ver detalhes da inscrição\n' +
            '`/inscricao aprovar <usuário>` — Aprovar inscrição\n' +
            '`/inscricao reprovar <usuário> <motivo>` — Reprovar inscrição\n' +
            '`/inscricao reprovartodos` — Reprovar todas as inscrições'
        },

        // ======================
        // TESTE
        // ======================
        {
          name: '🧪 Período de Teste',
          value:
            '`/verteste` — Ver membros em teste\n' +
            '`/teste aprovar <usuário>` — Aprovar teste\n' +
            '`/teste reprovar <usuário> <motivo>` — Reprovar teste'
        },

        // ======================
        // DISCIPLINA
        // ======================
        {
          name: '⚠️ Sistema Disciplinar',
          value:
            '`/adv aplicar <usuário> <motivo> [provas]` — Aplicar advertência\n' +
            '`/adv retirar <usuário>` — Remover advertência\n' +
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
            '`/limparchat <quantidade>` — Limpeza de mensagens\n' +
            '`/lockchat <usuário> <motivo>` — Bloqueio disciplinar de chat\n' +
            '`/unlockchat <usuário>` — Liberação de chat'
        },

        // ======================
        // COMUNICAÇÃO
        // ======================
        {
          name: '📢 Comunicação & Informação',
          value:
            '`/infofamilia` — Informações oficiais da família\n' +
            '`/inscricao_aviso` — Aviso e requisitos de inscrição'
        },

        // ======================
        // EVOLUÇÃO
        // ======================
        {
          name: '🚧 Sistemas em Evolução',
          value:
            '• Normalização avançada de cargos\n' +
            '• Histórico administrativo completo\n' +
            '• Sistema disciplinar aprimorado\n' +
            '• Onboarding interativo pós-aprovação'
        }
      )
      .setFooter({
        text: 'Sistema Administrativo Oficial • Família MoChavãO'
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  }
};
