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

const CARGO_TESTE = '1367402086119243797';
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
        content: '⚠️ Este usuário não está em teste.',
      });
    }

    const membroGuild = await interaction.guild.members.fetch(usuario.id);

    // =====================
    // APROVAR TESTE
    // =====================
    if (sub === 'aprovar') {

      // ➖ Remove cargo de teste
      await membroGuild.roles.remove(CARGO_TESTE).catch(() => {});

      // ➕ Adiciona cargo de membro
      await membroGuild.roles.add(CARGO_MEMBRO).catch(() => {});

      // ➕ Adiciona no familia.json
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

      // 📩 DM EMBED
      const embedDM = new EmbedBuilder()
        .setColor('Green')
        .setTitle('🏆 Teste Aprovado')
        .setDescription(
          'Parabéns! Você foi **aprovado definitivamente** na Família **MoChavãO**.'
        )
        .setFooter({ text: 'Família MoChavãO' });

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      return interaction.reply(`🏆 **${usuario.tag}** aprovado e adicionado à família.`);
    }

    // =====================
    // REPROVAR TESTE
    // =====================
    if (sub === 'reprovar') {
      const motivo = interaction.options.getString('motivo');

      // ❌ Remove do teste
      removerTeste(usuario.id);

      // ➖ Remove cargo de teste
      await membroGuild.roles.remove(CARGO_TESTE).catch(() => {});

      const embedDM = new EmbedBuilder()
        .setColor('Red')
        .setTitle('❌ Teste Reprovado')
        .addFields({
          name: 'Motivo',
          value: motivo
        })
        .setFooter({ text: 'Família MoChavãO' });

      await usuario.send({ embeds: [embedDM] }).catch(() => {});

      return interaction.reply(`❌ **${usuario.tag}** foi reprovado no teste.`);
    }

  }
};
