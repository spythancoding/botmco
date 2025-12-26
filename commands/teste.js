const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');

const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

const {
  lerTeste,
  salvarTeste,
  removerTeste,
  lerMembros,
  salvarMembros
} = require('../utils/dataManager');

const {
  definirCargoFamilia,
  CARGO_VISITANTE
} = require('../utils/familiaRoles');

// 🎭 Cargos
const CARGO_TESTE = '1367402086119243797'; // OBS / Teste
const CARGO_MEMBRO = '1313574261041926225';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('teste')
    .setDescription('Gerenciar período de teste')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // ========= ADICIONAR =========
    .addSubcommand(sub =>
      sub
        .setName('adicionar')
        .setDescription('Adicionar usuário manualmente ao período de teste (5 dias)')
        .addUserOption(opt =>
          opt.setName('usuario')
            .setDescription('Usuário a ser colocado em teste')
            .setRequired(true)
        )
    )

    // ========= APROVAR =========
    .addSubcommand(sub =>
      sub
        .setName('aprovar')
        .setDescription('Aprovar membro após o teste')
        .addUserOption(opt =>
          opt.setName('usuario')
            .setDescription('Usuário em teste')
            .setRequired(true)
        )
    )

    // ========= REPROVAR =========
    .addSubcommand(sub =>
      sub
        .setName('reprovar')
        .setDescription('Reprovar membro em teste')
        .addUserOption(opt =>
          opt.setName('usuario')
            .setDescription('Usuário em teste')
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

    const testes = lerTeste();
    const membros = lerMembros();

    // =====================
    // ➕ ADICIONAR TESTE
    // =====================
    if (sub === 'adicionar') {

      if (testes[usuario.id]) {
        return interaction.reply({
          content: '⚠️ Este usuário já está em período de teste.',
          ephemeral: true
        });
      }

      if (membros[usuario.id]) {
        return interaction.reply({
          content: '⚠️ Este usuário já é membro da família.',
          ephemeral: true
        });
      }

      const guildMember = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      if (guildMember) {
        // 🔒 Estado único → TESTE
        await definirCargoFamilia(guildMember, CARGO_TESTE);
      }

      const inicio = new Date();
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + 5);

      testes[usuario.id] = {
        userId: usuario.id,
        nomeDiscord: usuario.username,
        status: 'em_teste',
        inicioTeste: inicio.toISOString(),
        fimTeste: fim.toISOString(),
        adicionadoPor: interaction.user.id
      };

      salvarTeste(testes);

      // 📩 DM
      const embedDM = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle('🧪 Início do Período de Teste — Família MoChavãO')
        .setDescription(
          'Você foi **adicionado manualmente** ao período de **teste de 5 dias**.\n\n' +
          'Durante este período, sua postura, respeito e compromisso serão avaliados.'
        )
        .addFields({
          name: '📅 Duração',
          value: '5 dias a partir de hoje'
        })
        .setFooter({ text: 'Família MoChavãO • Sistema de Teste' })
        .setTimestamp();

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      return interaction.reply({
        content: `🧪 **${usuario.tag}** foi adicionado ao período de teste (5 dias).`
      });
    }

    // =====================
    // ✅ APROVAR TESTE
    // =====================
    if (sub === 'aprovar') {
      if (!testes[usuario.id]) {
        return interaction.reply({ content: '⚠️ Usuário não está em teste.' });
      }

      const guildMember = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      if (guildMember) {
        await definirCargoFamilia(guildMember, CARGO_MEMBRO);
      }

      membros[usuario.id] = {
        nomeDiscord: usuario.username,
        cargo: 'Membro',
        adicionadoPor: interaction.user.id,
        dataEntrada: new Date().toISOString()
      };

      salvarMembros(membros);
      removerTeste(usuario.id);

      const embedDM = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🏆 Teste Aprovado — Família MoChavãO')
        .setDescription(
          'Parabéns!\n\nVocê foi **aprovado definitivamente** e agora é **Membro oficial** da família.'
        )
        .setFooter({ text: 'Família MoChavãO • Sistema de Teste' })
        .setTimestamp();

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      return interaction.reply(`🏆 **${usuario.tag}** aprovado com sucesso.`);
    }

    // =====================
    // ❌ REPROVAR TESTE
    // =====================
    if (sub === 'reprovar') {
      if (!testes[usuario.id]) {
        return interaction.reply({ content: '⚠️ Usuário não está em teste.' });
      }

      const motivo = interaction.options.getString('motivo');

      const guildMember = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      if (guildMember) {
        await definirCargoFamilia(guildMember, CARGO_VISITANTE);
      }

      removerTeste(usuario.id);

      const embedDM = new EmbedBuilder()
        .setColor(0xc0392b)
        .setTitle('❌ Teste Reprovado — Família MoChavãO')
        .addFields({ name: '📝 Motivo', value: motivo })
        .setFooter({ text: 'Família MoChavãO • Sistema de Teste' })
        .setTimestamp();

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      return interaction.reply(`❌ **${usuario.tag}** foi reprovado no teste.`);
    }
  }
};
