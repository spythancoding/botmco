const { SlashCommandBuilder } = require('discord.js');
const { lerMembros, salvarMembros } = require('../utils/dataManager');
const { isFounder, isOwner, isSubOwner } = require('../utils/permissions');

const DEV_ID = '353946672549724161';

const cargosOrdem = [
  { nome: 'Dono', peso: 6 },
  { nome: 'Sub Dono', peso: 5 },
  { nome: 'Diretor', peso: 4 },
  { nome: 'Suporte', peso: 3 },
  { nome: 'Membro +', peso: 2 },
  { nome: 'Membro', peso: 1 }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('atualizar')
    .setDescription('Atualiza dados de um membro da família')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Usuário a ser atualizado')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('cargo')
        .setDescription('Novo cargo')
        .addChoices(...cargosOrdem.map(c => ({ name: c.nome, value: c.nome })))
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

    // 🔐 PERMISSÃO
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
        content: '❌ Este usuário não está registrado.',
        ephemeral: true
      });
    }

    const novoCargo = interaction.options.getString('cargo');

    // ⚖️ CONTROLE DE HIERARQUIA (IGNORADO PELO DEV)
    if (novoCargo && autorId !== DEV_ID) {
      const cargoAutor = cargosOrdem.find(
        c => c.nome === membros[autorId]?.cargo
      );
      const cargoNovo = cargosOrdem.find(c => c.nome === novoCargo);

      if (!cargoAutor || !cargoNovo || cargoNovo.peso >= cargoAutor.peso) {
        return interaction.reply({
          content: '❌ Você não pode atribuir um cargo igual ou superior ao seu.',
          ephemeral: true
        });
      }

      membro.cargo = novoCargo;
    }

    if (novoCargo && autorId === DEV_ID) {
      membro.cargo = novoCargo;
    }

    // ✍️ OUTROS CAMPOS
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

    await interaction.reply({
      content: `✅ Dados de <@${user.id}> atualizados com sucesso.`,
      
    });
  }
};
