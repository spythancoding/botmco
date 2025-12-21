const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Lista todos os comandos administrativos do bot'),

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
      .setTitle('🛠️ Painel Administrativo — MoChavãO')
      .setDescription(
        '**Comandos administrativos disponíveis**\n\n' +

        '👥 **Sistema de Gerenciamento**\n' +
        '`/familia adicionar` — Adiciona membro (**cargo obrigatório**)\n' +
        '`/familia atualizar` — Atualiza dados (cargo, whatsapp, **nome real**)\n' +
        '`/familia remover` — Remove membro da família\n' +
        '`/familia listar` — Listagem administrativa completa\n\n' +

        '⚠️ **Sistema de Advertências**\n' +
        '`/adv aplicar <usuário> <motivo> <provas>` — Aplica advertência\n' +
        '`/adv retirar <usuário>` — Remove última advertência\n' +
        '• Ao atingir **3 advertências**, exige decisão administrativa\n\n' +

        '⛔ **Sistema de Blacklist**\n' +
        '`/blacklist <usuário> <motivo> <provas>` — Blacklist temporária\n' +
        '`/blackperm <usuário> <motivo> <provas>` — Blacklist permanente\n' +
        '`/rblacklist <usuário>` — Remove blacklist\n\n' +

        '📝 **Sistema de Inscrição**\n' +
        '`/inscrever` — Candidato se inscreve\n' +
        '`/verinscricao` — Ver inscrições pendentes\n' +
        '`/inscricao aprovar <usuário>` — Aprova inscrição\n' +
        '`/inscricao reprovar <usuário> <motivo>` — Reprova inscrição\n\n' +

        '🧪 **Sistema de Teste**\n' +
        '`/verteste` — Ver membros em teste\n' +
        '`/teste aprovar <usuário>` — Aprova teste\n' +
        '`/teste reprovar <usuário> <motivo>` — Reprova teste\n\n' +

        '🌐 **Comandos Gerais**\n' +
        '`/ping` — Status do bot\n' +
        '`/regras` — Regras oficiais da família\n'
      )
      .setFooter({
        text: 'Sistema Oficial da Família MoChavãO • n2tzz'
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  }
};
