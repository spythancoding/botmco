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

// 📢 Canal público de resultados
const CANAL_RESULTADOS = '1453426415910523062';

// 🎓 Cargo de teste
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
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }

    const sub = interaction.options.getSubcommand();
    const canalResultados = interaction.guild.channels.cache.get(CANAL_RESULTADOS);

    // =====================================================
    // APROVAR
    // =====================================================
    if (sub === 'aprovar') {
      const usuario = interaction.options.getUser('usuario');

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

      // 📩 DM — APROVADO
      const embedDM = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('✅ Inscrição Aprovada — Família MoChavãO')
        .setDescription(
          `Parabéns, **${usuario.username}**.\n\n` +
          'Sua inscrição foi **aprovada** e você iniciou o **período de teste de 5 dias**.\n\n' +
          'Mantenha uma postura adequada, respeito e compromisso.'
        )
        .setFooter({ text: 'Família MoChavãO • Sistema de Inscrições' })
        .setTimestamp();

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      // 📢 RESULTADOS — APROVADO
      const embedResultado = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🟢 Inscrição Aprovada')
        .addFields(
          { name: '👤 Usuário', value: `<@${usuario.id}>`, inline: true },
          { name: '👮 Aprovado por', value: interaction.user.tag, inline: true }
        )
        .setFooter({ text: 'Sistema de Inscrições • Família MoChavãO' })
        .setTimestamp();

      canalResultados?.send({ embeds: [embedResultado] });

      return interaction.reply('✅ Inscrição aprovada com sucesso.');
    }

    // =====================================================
    // REPROVAR (INDIVIDUAL)
    // =====================================================
    if (sub === 'reprovar') {
      const usuario = interaction.options.getUser('usuario');
      const motivo = interaction.options.getString('motivo');

      const inscricao = getInscricao(usuario.id);
      if (!inscricao) {
        return interaction.reply('❌ Inscrição não encontrada.');
      }

      atualizarInscricao(usuario.id, { status: 'reprovado_inscricao' });
      removerInscricao(usuario.id);

      // 📩 DM — REPROVADO
      const embedDM = new EmbedBuilder()
        .setColor(0xc0392b)
        .setTitle('❌ Inscrição Reprovada — Família MoChavãO')
        .addFields(
          { name: '📝 Motivo', value: motivo },
          {
            name: 'ℹ️ Observação',
            value: 'Você poderá tentar novamente no futuro.'
          }
        )
        .setFooter({ text: 'Família MoChavãO • Sistema de Inscrições' })
        .setTimestamp();

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      // 📢 RESULTADOS — REPROVADO
      const embedResultado = new EmbedBuilder()
        .setColor(0xc0392b)
        .setTitle('🔴 Inscrição Reprovada')
        .addFields(
          { name: '👤 Usuário', value: `<@${usuario.id}>`, inline: true },
          { name: '👮 Ação por', value: interaction.user.tag, inline: true },
          { name: '📝 Motivo', value: motivo }
        )
        .setFooter({ text: 'Sistema de Inscrições • Família MoChavãO' })
        .setTimestamp();

      canalResultados?.send({ embeds: [embedResultado] });

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
        atualizarInscricao(userId, { status: 'reprovado_inscricao' });
        removerInscricao(userId);
        total++;
      }

      const embedResultado = new EmbedBuilder()
        .setColor(0xc0392b)
        .setTitle('❌ Inscrições Reprovadas em Massa')
        .addFields(
          { name: '📊 Total', value: `${total}`, inline: true },
          { name: '👮 Ação por', value: interaction.user.tag, inline: true }
        )
        .setFooter({ text: 'Sistema de Inscrições • Família MoChavãO' })
        .setTimestamp();

      canalResultados?.send({ embeds: [embedResultado] });

      return interaction.reply(`❌ **${total} inscrições** foram reprovadas.`);
    }
  }
};
