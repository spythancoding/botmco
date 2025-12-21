const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const {
  getInscricao,
  aprovarInscricao,
  atualizarInscricao
} = require('../utils/dataManager');

const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

const CANAL_ADM = '1440166535602770032';
const CARGO_TESTE = '1367402086119243797';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscricao')
    .setDescription('Gerenciar inscrições')
    .addSubcommand(sub =>
      sub.setName('aprovar')
        .setDescription('Aprovar inscrição')
        .addUserOption(opt =>
          opt.setName('usuario')
            .setDescription('Usuário inscrito')
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName('reprovar')
        .setDescription('Reprovar inscrição')
        .addUserOption(opt =>
          opt.setName('usuario')
            .setDescription('Usuário inscrito')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('motivo')
            .setDescription('Motivo da reprovação')
            .setRequired(true)
        )
    ),

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

    const sub = interaction.options.getSubcommand();
    const usuario = interaction.options.getUser('usuario');
    const canalAdm = interaction.guild.channels.cache.get(CANAL_ADM);
    const membroGuild = await interaction.guild.members.fetch(usuario.id).catch(() => null);

    const inscricao = getInscricao(usuario.id);
    if (!inscricao) {
      return interaction.reply({
        content: '❌ Inscrição não encontrada.',
        ephemeral: true
      });
    }

    // ======================
    // APROVAR
    // ======================
    if (sub === 'aprovar') {
      const sucesso = aprovarInscricao(usuario.id, interaction.user.id);
      if (!sucesso) {
        return interaction.reply({
          content: '❌ Erro ao aprovar inscrição.',
          ephemeral: true
        });
      }

      if (membroGuild) {
        await membroGuild.roles.add(CARGO_TESTE).catch(() => {});
      }

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('✅ Inscrição Aprovada')
        .setDescription(
          'Você foi aprovado para o **período de 5 dias de teste**.\n\n' +
          'Boa sorte e mantenha um bom comportamento.'
        )
        .setFooter({ text: 'Família MoChavãO' });

      await usuario.send({ embeds: [embed] }).catch(() => {});
      canalAdm?.send(`🟢 **${usuario.tag}** aprovado por **${interaction.user.tag}**`);

      return interaction.reply('✅ Inscrição aprovada com sucesso.');
    }

    // ======================
    // REPROVAR
    // ======================
    if (sub === 'reprovar') {
      const motivo = interaction.options.getString('motivo');

      atualizarInscricao(usuario.id, {
        status: 'reprovado_inscricao'
      });

      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Inscrição Reprovada')
        .setDescription(`📝 **Motivo:** ${motivo}`)
        .setFooter({ text: 'Família MoChavãO' });

      await usuario.send({ embeds: [embed] }).catch(() => {});
      canalAdm?.send(`🔴 **${usuario.tag}** reprovado por **${interaction.user.tag}**\n📝 ${motivo}`);

      return interaction.reply('❌ Inscrição reprovada.');
    }
  }
};
