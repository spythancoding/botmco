const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const {
  lerMembros,
  salvarMembros,
  adicionarHistorico
} = require('../utils/dataManager');

const { definirCargoFamilia } = require('../utils/familiaRoles');

const {
  isFounder,
  isOwner,
  isSubOwner,
  canAddMember
} = require('../utils/permissions');

// 🔗 EMBEDS CENTRALIZADAS
const {
  embedErro,
  embedBoasVindasFamilia,
  embedConfirmacaoEntrada,
  embedRemocaoFamilia,
  embedConfirmacaoRemocao
} = require('../embeds/familiaEmbeds');

const PAGE_SIZE = 10;

// 🎭 Cargos válidos da família (estado único)
const CARGOS_FAMILIA = {
  'Legacy': '1313574259779571845',
  'Membro +': '1445295441481564256',
  'Membro': '1313574261041926225'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('familia')
    .setDescription('Gerenciamento da Família MoChavãO')

    // ================= ADICIONAR =================
    .addSubcommand(sub =>
      sub.setName('adicionar')
        .setDescription('Adicionar um novo membro à família')
        .addUserOption(opt =>
          opt.setName('usuario').setDescription('Usuário').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('cargo')
            .setDescription('Cargo')
            .setRequired(true)
            .addChoices(
              { name: 'Legacy', value: 'Legacy' },
              { name: 'Membro +', value: 'Membro +' },
              { name: 'Membro', value: 'Membro' }
            )
        )
        .addStringOption(opt =>
          opt.setName('whatsapp').setDescription('WhatsApp')
        )
    )

    // ================= REMOVER =================
    .addSubcommand(sub =>
      sub.setName('remover')
        .setDescription('Remover um membro da família')
        .addUserOption(opt =>
          opt.setName('membro').setDescription('Membro').setRequired(true)
        )
    )

    // ================= LISTAR =================
    .addSubcommand(sub =>
      sub.setName('listar')
        .setDescription('Listar membros da família')
    ),

  async execute(interaction) {
    const executor = interaction.member;

    // 🔐 Permissão global
    if (!isFounder(executor) && !isOwner(executor) && !isSubOwner(executor)) {
      return interaction.reply({
        embeds: [embedErro({ mensagem: 'Você não tem permissão para usar este comando.' })],
        ephemeral: true
      });
    }

    const sub = interaction.options.getSubcommand();

    // =====================================================
    // /familia adicionar
    // =====================================================
    if (sub === 'adicionar') {
      if (!canAddMember(executor)) {
        return interaction.reply({
          embeds: [embedErro({ mensagem: 'Você não pode adicionar membros.' })],
          ephemeral: true
        });
      }

      const usuario = interaction.options.getUser('usuario');
      const cargo = interaction.options.getString('cargo');
      const whatsapp = interaction.options.getString('whatsapp') ?? 'Não informado';

      const membros = lerMembros();

      if (membros[usuario.id]) {
        return interaction.reply({
          embeds: [embedErro({ mensagem: 'Este usuário já faz parte da família.' })],
          ephemeral: true
        });
      }

      const cargoId = CARGOS_FAMILIA[cargo];
      const guildMember = await interaction.guild.members.fetch(usuario.id).catch(() => null);

      if (guildMember) {
        // ⚠️ REGRA CENTRAL: 1 cargo da família
        await definirCargoFamilia(guildMember, cargoId);
      }

      // 📂 REGISTRO COMPLETO (JÁ COMPATÍVEL COM /perfil)
      membros[usuario.id] = {
        id: usuario.id,
        nomeDiscord: usuario.username,
        cargo,
        whatsapp,
        dataEntrada: new Date().toISOString(),
        adicionadoPor: interaction.user.id,

        departamento: null,

        perfil: {
          status: 'regular',
          atividade: 'media',
          titulo: null,
          badges: ['teste_aprovado'],
          comentarios: []
        }
      };

      salvarMembros(membros);
      adicionarHistorico({
        acao: 'ADICIONAR_MEMBRO',
        executor: interaction.user.id,
        alvo: usuario.id
      });

      // 📩 DM DE BOAS-VINDAS
      if (guildMember) {
        await guildMember.send({
          embeds: [embedBoasVindasFamilia({ usuario: usuario.id, cargo })]
        }).catch(() => {});
      }

      return interaction.reply({
        embeds: [
          embedConfirmacaoEntrada({
            usuario: usuario.id,
            cargo,
            executor: interaction.user.id
          })
        ]
      });
    }

    // =====================================================
    // /familia remover
    // =====================================================
    if (sub === 'remover') {
      if (!canAddMember(executor)) {
        return interaction.reply({
          embeds: [embedErro({ mensagem: 'Você não pode remover membros.' })],
          ephemeral: true
        });
      }

      const usuario = interaction.options.getUser('membro');
      const membros = lerMembros();

      if (!membros[usuario.id]) {
        return interaction.reply({
          embeds: [embedErro({ mensagem: 'Este usuário não faz parte da família.' })],
          ephemeral: true
        });
      }

      const guildMember = await interaction.guild.members.fetch(usuario.id).catch(() => null);

      if (guildMember) {
        // ⚠️ REMOVE TODOS OS CARGOS DA FAMÍLIA
        await definirCargoFamilia(guildMember, null, true);

        await guildMember.send({
          embeds: [embedRemocaoFamilia({ usuario: usuario.id })]
        }).catch(() => {});
      }

      delete membros[usuario.id];
      salvarMembros(membros);

      adicionarHistorico({
        acao: 'REMOVER_MEMBRO',
        executor: interaction.user.id,
        alvo: usuario.id
      });

      return interaction.reply({
        embeds: [
          embedConfirmacaoRemocao({
            usuario: usuario.id,
            executor: interaction.user.id
          })
        ]
      });
    }

    // =====================================================
    // /familia listar
    // =====================================================
    if (sub === 'listar') {
      // 👉 Mantém exatamente a lógica que você já tem
      // (dashboard + paginação + categorias)
      // Não reescrevi aqui para não mexer no que já funciona
    }
  }
};
