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
  isFounder,
  isOwner,
  isSubOwner,
  canAddMember
} = require('../utils/permissions');

const PAGE_SIZE = 10;

// 🎭 Cargos da Família
const CARGOS_FAMILIA = {
  'Membro': '1313574261041926225',
  'Membro +': '1445295441481564256',
  'Legacy': '1313574259779571845'
};

const CARGOS_FAMILIA_IDS = Object.values(CARGOS_FAMILIA);

// ❌ Cargos removidos ao entrar
const CARGOS_REMOVER_ADICAO = [
  '1449426346823389327', // Amigo
  '1439059436789305395'  // Visitante
];

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
  if (!canAddMember(interaction.member)) {
    return interaction.reply({
      content: '❌ Sem permissão.',
      ephemeral: true
    });
  }

  const usuario = interaction.options.getUser('usuario');
  const cargoEscolhido = interaction.options.getString('cargo');
  const whatsapp = interaction.options.getString('whatsapp') ?? 'Não informado';

  const membros = lerMembros();

  // 🔎 Validação no sistema interno
  if (membros[usuario.id]) {
    return interaction.reply({
      content: '⚠️ Usuário já é membro da família.',
      ephemeral: true
    });
  }

  // 🔎 Validação do cargo
  const cargoId = CARGOS_FAMILIA[cargoEscolhido];
  if (!cargoId) {
    return interaction.reply({
      content: '❌ Cargo inválido.',
      ephemeral: true
    });
  }

  // 👤 Tenta buscar no servidor (pode não estar mais lá)
  const guildMember = await interaction.guild.members
    .fetch(usuario.id)
    .catch(() => null);

  // 🎭 Atualização de cargos (somente se estiver no servidor)
  if (guildMember) {
    try {
      // ❌ Remove Amigo / Visitante se tiver
      const cargosParaRemover = CARGOS_REMOVER_ADICAO.filter(cargoId =>
        guildMember.roles.cache.has(cargoId)
      );

      if (cargosParaRemover.length > 0) {
        await guildMember.roles.remove(cargosParaRemover);
      }

      // ➕ Aplica cargo da família
      if (!guildMember.roles.cache.has(cargoId)) {
        await guildMember.roles.add(cargoId);
      }
    } catch (err) {
      console.warn('Erro ao atualizar cargos do novo membro:', err);
    }
  }

  // 💾 Salva no sistema interno (SEMPRE)
  membros[usuario.id] = {
    nomeDiscord: usuario.username,
    cargo: cargoEscolhido,
    whatsapp,
    dataEntrada: new Date().toISOString(),
    adicionadoPor: interaction.user.id
  };

  salvarMembros(membros);

  // 📜 Histórico administrativo
  adicionarHistorico({
    acao: 'ADICIONAR_MEMBRO',
    executor: interaction.user.id,
    alvo: usuario.id
  });

  // 📩 DM DE BOAS-VINDAS (não trava se DM fechada)
  try {
  const embedBoasVindas = new EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle('🏴 Bem-vindo à Família MoChavãO')
    .setDescription(
      `Você foi **adicionado oficialmente** à família.\n\n` +
      `A partir deste momento, você passa a representar o nome **MoChavãO** dentro e fora do servidor.`
    )
    .addFields(
      {
        name: '🏷️ Cargo atribuído',
        value: cargoEscolhido,
        inline: true
      },
      {
        name: '📜 Orientações',
        value:
          '• Respeite a hierarquia\n' +
          '• Siga as regras da família\n' +
          '• Honre o nome que você carrega',
        inline: false
      }
    )
    .setFooter({ text: 'Administração da Família MoChavãO' })
    .setTimestamp();

  await usuario.send({ embeds: [embedBoasVindas] });
} catch {
  // DM fechada → ignora
}


  // 📢 Confirmação ao administrador
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor('#27ae60')
        .setTitle('✅ Membro adicionado à família')
        .addFields(
          {
            name: '👤 Usuário',
            value: `<@${usuario.id}> (${usuario.username})`,
            inline: false
          },
          {
            name: '🏷️ Cargo',
            value: cargoEscolhido,
            inline: true
          },
          {
            name: '👮 Adicionado por',
            value: `<@${interaction.user.id}>`,
            inline: true
          },
          {
            name: '📌 Situação no servidor',
            value: guildMember
              ? 'Cargos atualizados com sucesso.'
              : 'Usuário não está no servidor. Registro salvo no sistema.',
            inline: false
          }
        )
        .setFooter({ text: 'Sistema Oficial da Família MoChavãO • n2tzz' })
        .setTimestamp()
    ]
  });
}


    // =====================================================
    // ================= /familia listar ===================
    // =====================================================
    if (sub === 'listar') {
      const membros = lerMembros();
      const lista = Object.entries(membros);

      if (!lista.length) {
        return interaction.reply({ content: '⚠️ Nenhum membro cadastrado.' });
      }

      const porCargo = {
        Dono: [],
        'Sub Dono': [],
        Diretor: [],
        Suporte: [],
        'Membro +': [],
        Membro: [],
        Legacy: []
      };

      for (const [id, dados] of lista) {
        if (porCargo[dados.cargo]) porCargo[dados.cargo].push(id);
      }

      let visualizacao = 'dashboard';
      let pagina = { membro: 0, membro_plus: 0, legacy: 0 };

      const gerarDashboard = () =>
        new EmbedBuilder()
          .setColor('#9b59b6')
          .setTitle('🏴 Família MoChavãO — Painel Geral')
          .setDescription(
            `👑 Dono: **${porCargo.Dono.length}**\n` +
            `🟣 Sub Dono: **${porCargo['Sub Dono'].length}**\n` +
            `🎯 Diretor: **${porCargo.Diretor.length}**\n` +
            `🛠️ Suporte: **${porCargo.Suporte.length}**\n\n` +
            `⭐ Membro +: **${porCargo['Membro +'].length}**\n` +
            `👤 Membro: **${porCargo.Membro.length}**\n\n` +
            `🕯️ Legacy: **${porCargo.Legacy.length}**`
          )
          .setFooter({ text: `Total de membros: ${lista.length}` })
          .setTimestamp();

      const gerarLista = (titulo, cor, ids, paginaAtual) => {
        const total = Math.ceil(ids.length / PAGE_SIZE) || 1;
        const inicio = paginaAtual * PAGE_SIZE;
        const fim = inicio + PAGE_SIZE;

        return new EmbedBuilder()
          .setColor(cor)
          .setTitle(`${titulo} — Página ${paginaAtual + 1}/${total}`)
          .setDescription(ids.slice(inicio, fim).map(id => `👤 <@${id}>`).join('\n'))
          .setTimestamp();
      };

      const botoesDashboard = (noPainel = false) =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('dash').setLabel('📊 Painel').setStyle(ButtonStyle.Primary).setDisabled(noPainel),
          new ButtonBuilder().setCustomId('lideranca').setLabel('👑 Liderança').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('membro_plus').setLabel('⭐ Membro +').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('membro').setLabel('👤 Membro').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('legacy').setLabel('🕯️ Legacy').setStyle(ButtonStyle.Secondary)
        );

      const botoesPag = (paginaAtual, total) =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('voltar').setLabel('⬅️ Voltar').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary).setDisabled(paginaAtual === 0),
          new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary).setDisabled(paginaAtual >= total - 1)
        );

      const msg = await interaction.reply({
        embeds: [gerarDashboard()],
        components: [botoesDashboard(true)],
        fetchReply: true
      });

      const collector = msg.createMessageComponentCollector({ time: 300000 });

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: '❌ Apenas quem executou pode usar.', ephemeral: true });
        }

        let embed, components;

        if (i.customId === 'dash' || i.customId === 'voltar') {
          visualizacao = 'dashboard';
          embed = gerarDashboard();
          components = [botoesDashboard(true)];
        }

        if (i.customId === 'lideranca') {
          visualizacao = 'lideranca';
          embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('👑 Liderança')
            .setDescription(
              [...porCargo.Dono, ...porCargo['Sub Dono'], ...porCargo.Diretor, ...porCargo.Suporte]
                .map(id => `👤 <@${id}>`).join('\n') || 'Nenhum membro.'
            );
          components = [botoesDashboard(false)];
        }

        if (i.customId === 'membro_plus') {
          visualizacao = 'membro_plus';
          embed = gerarLista('⭐ Membro +', '#2ecc71', porCargo['Membro +'], pagina.membro_plus);
          components = [
            botoesDashboard(false),
            botoesPag(pagina.membro_plus, Math.ceil(porCargo['Membro +'].length / PAGE_SIZE))
          ];
        }

        if (i.customId === 'membro') {
          visualizacao = 'membro';
          embed = gerarLista('👤 Membro', '#95a5a6', porCargo.Membro, pagina.membro);
          components = [
            botoesDashboard(false),
            botoesPag(pagina.membro, Math.ceil(porCargo.Membro.length / PAGE_SIZE))
          ];
        }

        if (i.customId === 'legacy') {
          visualizacao = 'legacy';
          embed = gerarLista('🕯️ Legacy', '#bdc3c7', porCargo.Legacy, pagina.legacy);
          components = [
            botoesDashboard(false),
            botoesPag(pagina.legacy, Math.ceil(porCargo.Legacy.length / PAGE_SIZE))
          ];
        }

        if (i.customId === 'prev' || i.customId === 'next') {
          const dir = i.customId === 'next' ? 1 : -1;
          pagina[visualizacao] += dir;

          if (visualizacao === 'membro') embed = gerarLista('👤 Membro', '#95a5a6', porCargo.Membro, pagina.membro);
          if (visualizacao === 'membro_plus') embed = gerarLista('⭐ Membro +', '#2ecc71', porCargo['Membro +'], pagina.membro_plus);
          if (visualizacao === 'legacy') embed = gerarLista('🕯️ Legacy', '#bdc3c7', porCargo.Legacy, pagina.legacy);

          components = [
            botoesDashboard(false),
            botoesPag(pagina[visualizacao], Math.ceil(porCargo[visualizacao === 'membro_plus' ? 'Membro +' : visualizacao.charAt(0).toUpperCase() + visualizacao.slice(1)]?.length / PAGE_SIZE))
          ];
        }

        await i.update({ embeds: [embed], components });
      });
    }

    // =====================================================
// ================= /familia remover ==================
// =====================================================
if (sub === 'remover') {
  if (!canAddMember(interaction.member)) {
    return interaction.reply({
      content: '❌ Sem permissão.',
      ephemeral: true
    });
  }

  const usuario = interaction.options.getUser('membro');
  const membros = lerMembros();

  // 🔎 Validação no sistema interno
  if (!membros[usuario.id]) {
    return interaction.reply({
      content: '⚠️ Usuário não é membro da família.',
      ephemeral: true
    });
  }

  // 👤 Tenta buscar no servidor (pode não existir mais)
  const guildMember = await interaction.guild.members
    .fetch(usuario.id)
    .catch(() => null);

  // 🎭 Atualização de cargos (somente se estiver no servidor)
  if (guildMember) {
    try {
      // ❌ Remove TODOS os cargos da família
      const cargosParaRemover = CARGOS_FAMILIA_IDS.filter(cargoId =>
        guildMember.roles.cache.has(cargoId)
      );

      if (cargosParaRemover.length > 0) {
        await guildMember.roles.remove(cargosParaRemover);
      }

      // ➕ Aplica cargo Amigo
      const CARGO_AMIGO = '1449426346823389327';
      if (!guildMember.roles.cache.has(CARGO_AMIGO)) {
        await guildMember.roles.add(CARGO_AMIGO);
      }
    } catch (err) {
      console.warn('Erro ao atualizar cargos do usuário removido:', err);
    }
  }

  // 🗑️ Remove do sistema interno (SEMPRE)
  delete membros[usuario.id];
  salvarMembros(membros);

  // 📜 Histórico administrativo
  adicionarHistorico({
    acao: 'REMOVER_MEMBRO',
    executor: interaction.user.id,
    alvo: usuario.id
  });

  // 📩 DM DE RETIRADA (não trava se DM fechada)
  try {
  const embedRemocao = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle('❌ Retirada da Família MoChavãO')
    .setDescription(
      `Você foi **removido da Família MoChavãO** por decisão administrativa.\n\n` +
      `Neste momento, você não possui mais vínculo com a família.`
    )
    .addFields(
      {
        name: '📌 Informações importantes',
        value:
          '• Seus cargos da família foram removidos\n' +
          '• O cargo padrão foi aplicado, se aplicável\n' +
          '• Caso queira esclarecimentos, procure a liderança',
        inline: false
      }
    )
    .setFooter({ text: 'Administração da Família MoChavãO' })
    .setTimestamp();

  await usuario.send({ embeds: [embedRemocao] });
} catch {
  // DM fechada → ignora
}

  // 📢 Confirmação ao administrador
  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor('#c0392b')
        .setTitle('🗑️ Membro removido da família')
        .addFields(
          {
            name: '👤 Usuário',
            value: `<@${usuario.id}> (${usuario.username})`,
            inline: false
          },
          {
            name: '👮 Removido por',
            value: `<@${interaction.user.id}>`,
            inline: false
          },
          {
            name: '📌 Ação',
            value: guildMember
              ? 'Cargos removidos e cargo **Amigo** aplicado.'
              : 'Usuário já havia saído do servidor. Registro removido do sistema.',
            inline: false
          }
        )
        .setFooter({ text: 'Sistema Oficial da Família MoChavãO • n2tzz' })
        .setTimestamp()
    ]
  });
}

  }
};
