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
      .setColor('#9b59b6')
      .setTitle('🛠️ Painel Administrativo — Família MoChavãO')
      .setDescription(
        '**Comandos administrativos disponíveis**\n\n' +

        '👥 **Gerenciamento da Família**\n' +
        '`/familia adicionar` — Adiciona membro à família\n' +
        '`/familia remover` — Remove membro da família\n' +
        '`/familia listar` — Painel completo de membros\n\n' +

        '⚠️ **Sistema de Advertências**\n' +
        '`/adv aplicar <usuário> <motivo> [provas]` — Aplica advertência\n' +
        '`/adv retirar <usuário>` — Remove última advertência ativa\n' +
        '• **3 advertências ⇒ blacklist automática de 5 dias**\n\n' +

        '⛔ **Sistema de Blacklist**\n' +
        '`/blacklist <usuário> <dias> <motivo> [provas]` — Blacklist temporária\n' +
        '`/blackperm <usuário> <motivo> <provas>` — Blacklist permanente\n' +
        '`/rblacklist <usuário>` — Remove blacklist (restrições aplicáveis)\n\n' +

        '📝 **Sistema de Inscrições**\n' +
        '`/inscrever` — Candidato se inscreve\n' +
        '`/verinscricao` — Visualizar inscrições pendentes\n' +
        '`/inscricao aprovar <usuário>` — Aprovar inscrição\n' +
        '`/inscricao reprovar <usuário> <motivo>` — Reprovar inscrição\n\n' +

        '🧪 **Sistema de Teste**\n' +
        '`/verteste` — Ver membros em período de teste\n' +
        '`/teste aprovar <usuário>` — Aprovar teste\n' +
        '`/teste reprovar <usuário> <motivo>` — Reprovar teste\n\n' +

        '🚧 **Sistemas em Desenvolvimento**\n' +
        '• Automação de advertências (expiração em 30 dias)\n' +
        '• Fim automático de blacklist\n' +
        '• Sistema de histórico disciplinar avançado\n' +
        '• Economia interna (multas, recompensas, VIPs)\n'
      )
      .setFooter({
        text: 'Sistema Oficial da Família MoChavãO • n2tzz'
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
