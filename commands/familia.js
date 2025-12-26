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

const { definirCargoFamilia } = require('../utils/familiaRoles');

const {
  isFounder,
  isOwner,
  isSubOwner,
  canAddMember
} = require('../utils/permissions');

const PAGE_SIZE = 10;

// 🎭 Cargos disponíveis
const CARGOS_FAMILIA = {
  'Legacy': '1313574259779571845',
  'Membro +': '1445295441481564256',
  'Membro': '1313574261041926225'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('familia')
    .setDescription('Gerenciamento da Família MoChavãO')

    .addSubcommand(sub =>
      sub.setName('adicionar')
        .setDescription('Adicionar um novo membro')
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

    .addSubcommand(sub =>
      sub.setName('listar')
        .setDescription('Listar membros da família')
    )

    .addSubcommand(sub =>
      sub.setName('remover')
        .setDescription('Remover membro')
        .addUserOption(opt =>
          opt.setName('membro').setDescription('Membro').setRequired(true)
        )
    ),

  async execute(interaction) {
    const member = interaction.member;

    if (!isFounder(member) && !isOwner(member) && !isSubOwner(member)) {
      return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    // =====================================================
    // /familia adicionar
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
        return interaction.reply({ content: '⚠️ Usuário já é membro.', ephemeral: true });
      }

      const cargoId = CARGOS_FAMILIA[cargoEscolhido];
      const guildMember = await interaction.guild.members.fetch(usuario.id).catch(() => null);

      if (guildMember) {
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
      adicionarHistorico({ acao: 'ADICIONAR_MEMBRO', executor: interaction.user.id, alvo: usuario.id });

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle('✅ Membro adicionado')
            .addFields(
              { name: 'Usuário', value: `<@${usuario.id}>` },
              { name: 'Cargo', value: cargoEscolhido }
            )
            .setTimestamp()
        ]
      });
    }

    // =====================================================
    // /familia remover
    // =====================================================
    if (sub === 'remover') {
      if (!canAddMember(member)) {
        return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
      }

      const usuario = interaction.options.getUser('membro');
      const membros = lerMembros();

      if (!membros[usuario.id]) {
        return interaction.reply({ content: '⚠️ Não é membro.', ephemeral: true });
      }

      const guildMember = await interaction.guild.members.fetch(usuario.id).catch(() => null);
      if (guildMember) {
        await definirCargoFamilia(guildMember, null, true);
      }

      delete membros[usuario.id];
      salvarMembros(membros);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xe74c3c)
            .setTitle('🗑️ Membro removido')
            .addFields({ name: 'Usuário', value: `<@${usuario.id}>` })
            .setTimestamp()
        ]
      });
    }

    // ================= /familia listar =================
if (sub === 'listar') {
  const membros = lerMembros();
  const lista = Object.entries(membros);

  if (!lista.length) {
    return interaction.reply({
      content: '⚠️ Nenhum membro cadastrado.',
      ephemeral: true
    });
  }

  const PAGE_SIZE = 10;

  // ======================
  // 📂 ORGANIZAÇÃO POR CARGO (PRESTÍGIO)
  // ======================
  const donos = [];
  const diretores = [];
  const administradores = [];
  const membroPlus = [];
  const legacy = [];
  const membrosNormais = [];

  for (const [id, dados] of lista) {
    switch (dados.cargo) {
      case 'Dono':
        donos.push(id);
        break;
      case 'Diretor':
        diretores.push(id);
        break;
      case 'Administrador':
        administradores.push(id);
        break;
      case 'Membro +':
        membroPlus.push(id);
        break;
      case 'Legacy':
        legacy.push(id);
        break;
      case 'Membro':
        membrosNormais.push(id);
        break;
      default:
        break;
    }
  }

  let pagina = 0;
  let visualizacao = 'dashboard';

  // ======================
  // 📊 DASHBOARD
  // ======================
  const dashboardEmbed = () =>
    new EmbedBuilder()
      .setColor(0x8b0000)
      .setTitle('🏴 Família MoChavãO — Estrutura')
      .setDescription(
        `👑 **Donos:** ${donos.length}\n` +
        `🎯 **Diretoria:** ${diretores.length}\n` +
        `🛡️ **Administradores:** ${administradores.length}\n\n` +
        `⭐ **Membro +:** ${membroPlus.length}\n` +
        `🕯️ **Legacy:** ${legacy.length}\n` +
        `👤 **Membro:** ${membrosNormais.length}`
      )
      .setFooter({ text: `Total de membros: ${lista.length}` })
      .setTimestamp();

  // ======================
  // 📄 LISTA COM PAGINAÇÃO
  // ======================
  const gerarLista = (titulo, cor, ids) => {
    const totalPaginas = Math.max(1, Math.ceil(ids.length / PAGE_SIZE));
    const inicio = pagina * PAGE_SIZE;
    const fim = inicio + PAGE_SIZE;

    return new EmbedBuilder()
      .setColor(cor)
      .setTitle(`${titulo} — Página ${pagina + 1}/${totalPaginas}`)
      .setDescription(
        ids.slice(inicio, fim).map(id => `• <@${id}>`).join('\n') ||
        '_Nenhum membro._'
      )
      .setTimestamp();
  };

  // ======================
  // 🔘 BOTÕES (CATEGORIAS)
  // ======================
  const rowCategorias = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('dashboard').setLabel('📊 Geral').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('admin').setLabel('👑 Administração').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('membro_plus').setLabel('⭐ Membro +').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('legacy').setLabel('🕯️ Legacy').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('membro').setLabel('👤 Membro').setStyle(ButtonStyle.Secondary)
  );

  // ======================
  // 🔁 BOTÕES (PAGINAÇÃO)
  // ======================
  const rowPaginacao = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('prev')
      .setLabel('⬅️ Anterior')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('next')
      .setLabel('➡️ Próxima')
      .setStyle(ButtonStyle.Secondary)
  );

  const msg = await interaction.reply({
    embeds: [dashboardEmbed()],
    components: [rowCategorias],
    fetchReply: true
  });

  const collector = msg.createMessageComponentCollector({ time: 300000 });

  collector.on('collect', async i => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({ content: '❌ Apenas quem executou pode usar.', ephemeral: true });
    }

    let embed;
    let listaAtual = [];

    if (i.customId === 'dashboard') {
      pagina = 0;
      visualizacao = 'dashboard';
      embed = dashboardEmbed();
      return i.update({ embeds: [embed], components: [rowCategorias] });
    }

    if (i.customId === 'admin') {
      visualizacao = 'admin';
      listaAtual = [...donos, ...diretores, ...administradores];
      pagina = 0;
      embed = gerarLista('👑 Administração', 0xf1c40f, listaAtual);
    }

    if (i.customId === 'membro_plus') {
      visualizacao = 'membro_plus';
      listaAtual = membroPlus;
      pagina = 0;
      embed = gerarLista('⭐ Membro +', 0x2ecc71, listaAtual);
    }

    if (i.customId === 'legacy') {
      visualizacao = 'legacy';
      listaAtual = legacy;
      pagina = 0;
      embed = gerarLista('🕯️ Legacy', 0x95a5a6, listaAtual);
    }

    if (i.customId === 'membro') {
      visualizacao = 'membro';
      listaAtual = membrosNormais;
      pagina = 0;
      embed = gerarLista('👤 Membro', 0xbdc3c7, listaAtual);
    }

    if (i.customId === 'prev' || i.customId === 'next') {
      const listas = {
        admin: [...donos, ...diretores, ...administradores],
        membro_plus: membroPlus,
        legacy: legacy,
        membro: membrosNormais
      };

      listaAtual = listas[visualizacao] || [];
      const totalPaginas = Math.max(1, Math.ceil(listaAtual.length / PAGE_SIZE));

      if (i.customId === 'prev' && pagina > 0) pagina--;
      if (i.customId === 'next' && pagina < totalPaginas - 1) pagina++;

      embed = gerarLista(
        visualizacao === 'admin' ? '👑 Administração' :
        visualizacao === 'membro_plus' ? '⭐ Membro +' :
        visualizacao === 'legacy' ? '🕯️ Legacy' : '👤 Membro',
        0x8b0000,
        listaAtual
      );
    }

    await i.update({
      embeds: [embed],
      components: [rowCategorias, rowPaginacao]
    });
  });
}

  }
};  
