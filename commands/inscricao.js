const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const {
  getInscricao,
  aprovarInscricao,
  atualizarInscricao,
  lerInscritos,
  removerInscricao
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

    // ======================
    // APROVAR
    // ======================
    .addSubcommand(sub =>
      sub.setName('aprovar')
        .setDescription('Aprovar inscrição')
        .addUserOption(opt =>
          opt.setName('usuario')
            .setDescription('Usuário inscrito')
            .setRequired(true)
        )
    )

    // ======================
    // REPROVAR (INDIVIDUAL)
    // ======================
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
    )

    // ======================
    // REPROVAR TODOS
    // ======================
    .addSubcommand(sub =>
      sub.setName('reprovartodos')
        .setDescription('Reprovar todas as inscrições pendentes')
    ),

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 PERMISSÃO
    if (
      !isFounder(member) &&
      !isOwner(member) &&
      !isSubOwner(member)
    ) {
      return interaction.reply('❌ Você não tem permissão para usar este comando.');
    }

    const sub = interaction.options.getSubcommand();
    const canalAdm = interaction.guild.channels.cache.get(CANAL_ADM);

    // =====================================================
    // APROVAR
    // =====================================================
    if (sub === 'aprovar') {
      const usuario = interaction.options.getUser('usuario');
      if (!usuario) {
        return interaction.reply('❌ Você precisa informar um usuário.');
      }

      const inscricao = getInscricao(usuario.id);
      if (!inscricao) {
        return interaction.reply('❌ Inscrição não encontrada.');
      }

      const sucesso = aprovarInscricao(usuario.id, interaction.user.id);
      if (!sucesso) {
        return interaction.reply('❌ Erro ao aprovar inscrição.');
      }

      const membroGuild = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

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

    // =====================================================
    // REPROVAR (INDIVIDUAL)
    // =====================================================
    if (sub === 'reprovar') {
      const usuario = interaction.options.getUser('usuario');
      const motivo = interaction.options.getString('motivo');

      if (!usuario) {
        return interaction.reply('❌ Você precisa informar um usuário.');
      }

      const inscricao = getInscricao(usuario.id);
      if (!inscricao) {
        return interaction.reply('❌ Inscrição não encontrada.');
      }

      atualizarInscricao(usuario.id, {
        status: 'reprovado_inscricao'
      });

      removerInscricao(usuario.id);

      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Inscrição Reprovada')
        .setDescription(`📝 **Motivo:** ${motivo}`)
        .setFooter({ text: 'Família MoChavãO' });

      await usuario.send({ embeds: [embed] }).catch(() => {});
      canalAdm?.send(
        `🔴 **${usuario.tag}** reprovado por **${interaction.user.tag}**\n📝 ${motivo}`
      );

      return interaction.reply('❌ Inscrição reprovada.');
    }

    // =====================================================
    // REPROVAR TODOS
    // =====================================================
    if (sub === 'reprovartodos') {
      const inscritos = lerInscritos();
      const ids = Object.keys(inscritos);

      if (!ids.length) {
        return interaction.reply('📭 Não há inscrições pendentes.');
      }

      let total = 0;

      for (const userId of ids) {
        atualizarInscricao(userId, {
          status: 'reprovado_inscricao'
        });

        removerInscricao(userId);
        total++;
      }

      const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Inscrições Reprovadas em Massa')
        .setDescription('Todas as inscrições pendentes foram reprovadas.')
        .addFields(
          { name: '📊 Total', value: `${total}`, inline: true },
          { name: '👮 Ação por', value: interaction.user.tag, inline: true }
        )
        .setFooter({ text: 'Sistema de Inscrições • Família MoChavãO' })
        .setTimestamp();

      canalAdm?.send({ embeds: [embed] });

      return interaction.reply(
        `❌ **${total} inscrições** foram reprovadas com sucesso.`
      );
    }
  }
};
