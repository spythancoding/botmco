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
  removerTeste,
  lerMembros,
  salvarMembros
} = require('../utils/dataManager');

const {
  definirCargoFamilia,
  CARGO_VISITANTE,
  CARGOS_FAMILIA
} = require('../utils/familiaRoles');

// 🎭 Cargos finais
const CARGO_MEMBRO = '1313574261041926225';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('teste')
    .setDescription('Gerenciar resultado do período de teste')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

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
            .setDescription('❗ Motivo da reprovação')
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
    const teste = testes[usuario.id];

    if (!teste) {
      return interaction.reply({
        content: '⚠️ Este usuário não está em teste.'
      });
    }

    const membroGuild = await interaction.guild.members
      .fetch(usuario.id)
      .catch(() => null);

    // =====================
    // ✅ APROVAR TESTE
    // =====================
    if (sub === 'aprovar') {

      if (membroGuild) {
        // 🔒 ESTADO FINAL → MEMBRO
        await definirCargoFamilia(membroGuild, CARGO_MEMBRO);
      }

      // 💾 Salva no sistema interno
      const membros = lerMembros();

      membros[usuario.id] = {
        nomeDiscord: usuario.username,
        cargo: 'Membro',
        adicionadoPor: interaction.user.id,
        dataEntrada: new Date().toISOString()
      };

      salvarMembros(membros);

      // ❌ Remove do teste.json
      removerTeste(usuario.id);

      // 📩 DM
      const embedDM = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('🏆 Teste Aprovado — Família MoChavãO')
        .setDescription(
          'Parabéns!\n\n' +
          'Você foi **aprovado definitivamente** e agora é um **Membro oficial da Família MoChavãO**.'
        )
        .setFooter({ text: 'Família MoChavãO • Sistema de Teste' })
        .setTimestamp();

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      return interaction.reply(`🏆 **${usuario.tag}** aprovado e integrado à família.`);
    }

    // =====================
    // ❌ REPROVAR TESTE
    // =====================
    if (sub === 'reprovar') {
      const motivo = interaction.options.getString('motivo');

      if (membroGuild) {
        // 🔒 VOLTA AO ESTADO BASE
        await definirCargoFamilia(membroGuild, CARGO_VISITANTE);
      }

      // ❌ Remove do teste.json
      removerTeste(usuario.id);

      const embedDM = new EmbedBuilder()
        .setColor(0xc0392b)
        .setTitle('❌ Teste Reprovado — Família MoChavãO')
        .addFields({
          name: '📝 Motivo',
          value: motivo
        })
        .setFooter({ text: 'Família MoChavãO • Sistema de Teste' })
        .setTimestamp();

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      return interaction.reply(`❌ **${usuario.tag}** foi reprovado no período de teste.`);
    }
  }
};
