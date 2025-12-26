const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerMembros, salvarMembros } = require('../utils/dataManager');
const { isFounder, isOwner, isSubOwner } = require('../utils/permissions');
const { definirCargoFamilia } = require('../utils/familiaRoles');

const DEV_ID = '353946672549724161';

// ==========================
// 📊 HIERARQUIA OFICIAL
// ==========================
const cargosOrdem = [
  { nome: 'Donos', peso: 6 },
  { nome: 'Diretoria', peso: 5 },
  { nome: 'Administradores', peso: 4 },
  { nome: 'Membro +', peso: 3 },
  { nome: 'Legacy', peso: 2 },
  { nome: 'Membro', peso: 1 }
];


// ==========================
// 🎭 MAPA NOME → ROLE ID
// ==========================
const MAPA_CARGOS = {
  'Donos': '1313574253492306030',
  'Diretoria': '1313574255861956619',
  'Administradores': '1432101877205569556',
  'Membro +': '1445295441481564256',
  'Legacy': '1313574259779571845',
  'Membro': '1313574261041926225'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('atualizar')
    .setDescription('Atualiza dados e cargo de um membro da família')

    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário a ser atualizado')
        .setRequired(true)
    )

    .addStringOption(opt =>
      opt.setName('cargo')
        .setDescription('Novo cargo')
        .addChoices(
          ...cargosOrdem.map(c => ({
            name: c.nome,
            value: c.nome
          }))
        )
    )

    .addStringOption(opt =>
      opt.setName('nome_real')
        .setDescription('Nome real')
    )
    .addStringOption(opt =>
      opt.setName('nick_game')
        .setDescription('Nick in-game')
    )
    .addStringOption(opt =>
      opt.setName('idade')
        .setDescription('Idade')
    )
    .addStringOption(opt =>
      opt.setName('whatsapp')
        .setDescription('WhatsApp')
    ),

  async execute(interaction) {
    const autor = interaction.member;
    const autorId = interaction.user.id;

    // ======================
    // 🔐 PERMISSÃO
    // ======================
    if (
      autorId !== DEV_ID &&
      !isFounder(autor) &&
      !isOwner(autor) &&
      !isSubOwner(autor)
    ) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }

    const user = interaction.options.getUser('usuario');
    const membros = lerMembros();
    const membro = membros[user.id];

    if (!membro) {
      return interaction.reply({
        content: '❌ Este usuário não está registrado na família.',
        ephemeral: true
      });
    }

    const novoCargo = interaction.options.getString('cargo');

    // ======================
    // ⚖️ CONTROLE DE HIERARQUIA
    // ======================
    if (novoCargo && autorId !== DEV_ID) {
      const cargoAutor = cargosOrdem.find(
        c => c.nome === membros[autorId]?.cargo
      );
      const cargoNovo = cargosOrdem.find(
        c => c.nome === novoCargo
      );

      if (!cargoAutor || !cargoNovo || cargoNovo.peso >= cargoAutor.peso) {
        return interaction.reply({
          content: '❌ Você não pode atribuir um cargo igual ou superior ao seu.',
          ephemeral: true
        });
      }
    }

    // ======================
    // 🎭 ATUALIZA CARGO
    // ======================
    if (novoCargo) {
      const guildMember = await interaction.guild.members
        .fetch(user.id)
        .catch(() => null);

      const cargoId = MAPA_CARGOS[novoCargo];

      if (guildMember && cargoId) {
        await definirCargoFamilia(guildMember, cargoId);
      }

      membro.cargo = novoCargo;
    }

    // ======================
    // ✍️ OUTROS CAMPOS
    // ======================
    const campos = [
      ['nome_real', 'nomeReal'],
      ['nick_game', 'nickGame'],
      ['idade', 'idade'],
      ['whatsapp', 'whatsapp']
    ];

    for (const [opt, campo] of campos) {
      const valor = interaction.options.getString(opt);
      if (valor) membro[campo] = valor;
    }

    salvarMembros(membros);

    // ======================
    // ✅ CONFIRMAÇÃO
    // ======================
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('#2ecc71')
          .setTitle('✅ Membro atualizado com sucesso')
          .addFields(
            { name: '👤 Usuário', value: `<@${user.id}>`, inline: true },
            {
              name: '🏷️ Cargo',
              value: novoCargo ?? 'Sem alteração',
              inline: true
            }
          )
          .setFooter({ text: 'Sistema Oficial da Família MoChavãO' })
          .setTimestamp()
      ]
    });
  }
};
