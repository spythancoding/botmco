const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const {
  lerMembros,
  salvarMembros,
  adicionarHistorico
} = require('../utils/dataManager');

const {
  definirCargoFamilia
} = require('../utils/familiaRoles');

const {
  isFounder,
  isOwner,
  isSubOwner,
  canAddMember
} = require('../utils/permissions');

const PAGE_SIZE = 10;

// 🎭 Cargos disponíveis para /familia adicionar
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
          opt.setName('usuario')
            .setDescription('Usuário a ser adicionado')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('cargo')
            .setDescription('Cargo inicial do membro')
            .setRequired(true)
            .addChoices(
              { name: 'Legacy', value: 'Legacy' },
              { name: 'Membro +', value: 'Membro +' },
              { name: 'Membro', value: 'Membro' }
            )
        )
        .addStringOption(opt =>
          opt.setName('whatsapp')
            .setDescription('Número de WhatsApp (opcional)')
            .setRequired(false)
        )
    )

    // ================= LISTAR =================
    .addSubcommand(sub =>
      sub.setName('listar')
        .setDescription('Listar membros da família')
    )

    // ================= REMOVER =================
    .addSubcommand(sub =>
      sub.setName('remover')
        .setDescription('Remover um membro')
        .addUserOption(opt =>
          opt.setName('membro')
            .setDescription('Membro')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 PERMISSÃO GLOBAL
    if (!isFounder(member) && !isOwner(member) && !isSubOwner(member)) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }

    const sub = interaction.options.getSubcommand();

    // =====================================================
    // ================= /familia adicionar =================
    // =====================================================
    if (sub === 'adicionar') {
      if (!canAddMember(member)) {
        return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
      }

      const usuario = interaction.options.getUser('usuario');
      const cargoEscolhido = interaction.options.getString('cargo');
      const whatsapp = interaction.options.getString('whatsapp') ?? 'Não informado';

      const membros = lerMembros();

      if (membros[usuario.id]) {
        return interaction.reply({
          content: '⚠️ Usuário já é membro da família.',
          ephemeral: true
        });
      }

      const cargoId = CARGOS_FAMILIA[cargoEscolhido];
      if (!cargoId) {
        return interaction.reply({ content: '❌ Cargo inválido.', ephemeral: true });
      }

      const guildMember = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      // 🎭 FORÇA ESTADO ÚNICO DE CARGO DA FAMÍLIA
      if (guildMember) {
        // Remove OBS, visitante e qualquer outro cargo da família
        await definirCargoFamilia(guildMember, cargoId);
      }

      membros[usuario.id] = {
        nomeDiscord: usuario.username,
        cargo: cargoEscolhido,
        whatsapp,
        dataEntrada: new Date().toISOString(),
        adicionadoPor: interaction.user.id
      };

      salvarMembros(membros);

      adicionarHistorico({
        acao: 'ADICIONAR_MEMBRO',
        executor: interaction.user.id,
        alvo: usuario.id
      });

      // 📩 DM
      try {
        await usuario.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0x2ecc71)
              .setTitle('🏴 Bem-vindo à Família MoChavãO')
              .setDescription(
                'Você foi **adicionado oficialmente** à família.\n\n' +
                'A partir de agora, você representa o nome **MoChavãO**.'
              )
              .addFields({
                name: '🏷️ Cargo',
                value: cargoEscolhido
              })
              .setFooter({ text: 'Administração da Família MoChavãO' })
              .setTimestamp()
          ]
        });
      } catch {}

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x27ae60)
            .setTitle('✅ Membro adicionado')
            .addFields(
              { name: 'Usuário', value: `<@${usuario.id}>` },
              { name: 'Cargo', value: cargoEscolhido },
              { name: 'Adicionado por', value: `<@${interaction.user.id}>` }
            )
            .setTimestamp()
        ]
      });
    }

    // =====================================================
    // ================= /familia remover ==================
    // =====================================================
    if (sub === 'remover') {
      if (!canAddMember(member)) {
        return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
      }

      const usuario = interaction.options.getUser('membro');
      const membros = lerMembros();

      if (!membros[usuario.id]) {
        return interaction.reply({
          content: '⚠️ Usuário não é membro da família.',
          ephemeral: true
        });
      }

      const guildMember = await interaction.guild.members
        .fetch(usuario.id)
        .catch(() => null);

      // 🎭 REMOVE CARGOS DA FAMÍLIA E APLICA VISITANTE
      if (guildMember) {
        await definirCargoFamilia(guildMember, null, true);
      }

      delete membros[usuario.id];
      salvarMembros(membros);

      adicionarHistorico({
        acao: 'REMOVER_MEMBRO',
        executor: interaction.user.id,
        alvo: usuario.id
      });

      try {
        await usuario.send({
          embeds: [
            new EmbedBuilder()
              .setColor(0xe74c3c)
              .setTitle('❌ Retirada da Família MoChavãO')
              .setDescription(
                'Você foi removido da família por decisão administrativa.'
              )
              .setTimestamp()
          ]
        });
      } catch {}

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xc0392b)
            .setTitle('🗑️ Membro removido')
            .addFields(
              { name: 'Usuário', value: `<@${usuario.id}>` },
              { name: 'Ação por', value: `<@${interaction.user.id}>` }
            )
            .setTimestamp()
        ]
      });
    }

    // ================= /familia listar =================
    // =====================================================
// ================= /familia listar ===================
// =====================================================
if (sub === 'listar') {
  const membros = lerMembros();
  const lista = Object.entries(membros);

  if (!lista.length) {
    return interaction.reply({
      content: '⚠️ Nenhum membro cadastrado.',
      ephemeral: true
    });
  }

  // 📂 Separação por cargos (nova hierarquia)
  const porCargo = {
    Donos: [],
    Diretoria: [],
    Administradores: [],
    'Membro +': [],
    Legacy: [],
    Membro: []
  };

  for (const [id, dados] of lista) {
    if (porCargo[dados.cargo]) {
      porCargo[dados.cargo].push(id);
    }
  }

  // ======================
  // 📊 DASHBOARD PRINCIPAL
  // ======================
  const gerarDashboard = () =>
    new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('🏴 Família MoChavãO — Painel Geral')
      .setDescription(
        `👑 **Donos:** ${porCargo.Donos.length}\n` +
        `🎯 **Diretoria:** ${porCargo.Diretoria.length}\n` +
        `🛡️ **Administradores:** ${porCargo.Administradores.length}\n\n` +
        `⭐ **Membro +:** ${porCargo['Membro +'].length}\n` +
        `🕯️ **Legacy:** ${porCargo.Legacy.length}\n` +
        `👤 **Membro:** ${porCargo.Membro.length}`
      )
      .setFooter({
        text: `Total de membros: ${lista.length}`
      })
      .setTimestamp();

  // ======================
  // 📄 LISTA PAGINADA
  // ======================
  const gerarLista = (titulo, cor, ids, paginaAtual = 0) => {
    const total = Math.ceil(ids.length / PAGE_SIZE) || 1;
    const inicio = paginaAtual * PAGE_SIZE;
    const fim = inicio + PAGE_SIZE;

    return new EmbedBuilder()
      .setColor(cor)
      .setTitle(`${titulo} — Página ${paginaAtual + 1}/${total}`)
      .setDescription(
        ids.slice(inicio, fim).map(id => `👤 <@${id}>`).join('\n') ||
        '_Nenhum membro._'
      )
      .setTimestamp();
  };

  // ======================
  // 🔘 BOTÕES
  // ======================
  const botoesDashboard = (ativo = false) =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('dash')
        .setLabel('📊 Painel')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(ativo),

      new ButtonBuilder()
        .setCustomId('donos')
        .setLabel('👑 Donos')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('diretoria')
        .setLabel('🎯 Diretoria')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('admins')
        .setLabel('🛡️ Admins')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('membro_plus')
        .setLabel('⭐ Membro +')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('legacy')
        .setLabel('🕯️ Legacy')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('membro')
        .setLabel('👤 Membro')
        .setStyle(ButtonStyle.Secondary)
    );

  const botoesPag = (pagina, total) =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('⬅️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === 0),

      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('➡️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina >= total - 1),

      new ButtonBuilder()
        .setCustomId('voltar')
        .setLabel('↩️ Voltar')
        .setStyle(ButtonStyle.Secondary)
    );

  let visualizacao = 'dash';
  let pagina = 0;

  const msg = await interaction.reply({
    embeds: [gerarDashboard()],
    components: [botoesDashboard(true)],
    fetchReply: true
  });

  const collector = msg.createMessageComponentCollector({ time: 300000 });

  collector.on('collect', async i => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: '❌ Apenas quem executou o comando pode usar.',
        ephemeral: true
      });
    }

    let embed;
    let components = [];

    // ======================
    // DASHBOARD
    // ======================
    if (i.customId === 'dash' || i.customId === 'voltar') {
      visualizacao = 'dash';
      pagina = 0;
      embed = gerarDashboard();
      components = [botoesDashboard(true)];
    }

    // ======================
    // LISTAS
    // ======================
    const mapas = {
      donos: ['👑 Donos', '#f1c40f', porCargo.Donos],
      diretoria: ['🎯 Diretoria', '#e67e22', porCargo.Diretoria],
      admins: ['🛡️ Administradores', '#3498db', porCargo.Administradores],
      membro_plus: ['⭐ Membro +', '#2ecc71', porCargo['Membro +']],
      legacy: ['🕯️ Legacy', '#95a5a6', porCargo.Legacy],
      membro: ['👤 Membro', '#bdc3c7', porCargo.Membro]
    };

    if (mapas[i.customId]) {
      visualizacao = i.customId;
      pagina = 0;
      const [titulo, cor, ids] = mapas[i.customId];
      embed = gerarLista(titulo, cor, ids, pagina);
      components = [
        botoesDashboard(false),
        botoesPag(pagina, Math.ceil(ids.length / PAGE_SIZE) || 1)
      ];
    }

    if (i.customId === 'prev' || i.customId === 'next') {
      const dir = i.customId === 'next' ? 1 : -1;
      pagina += dir;

      const [titulo, cor, ids] = mapas[visualizacao];
      embed = gerarLista(titulo, cor, ids, pagina);

      components = [
        botoesDashboard(false),
        botoesPag(pagina, Math.ceil(ids.length / PAGE_SIZE) || 1)
      ];
    }

    await i.update({ embeds: [embed], components });
  });
}

  }
};
