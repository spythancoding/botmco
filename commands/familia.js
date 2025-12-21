const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
  lerMembros,
  salvarMembros,
  adicionarHistorico,
  lerTestes
} = require('../utils/dataManager');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

// 🎭 Cargos da Família (MAPA para adição)
const CARGOS_FAMILIA = {
  'Membro': '1313574261041926225',
  'Membro +': '1445295441481564256',
  'Legacy': '1313574259779571845'
};

// 🎭 Lista de cargos da família (ARRAY para remoção)
const CARGOS_FAMILIA_IDS = Object.values(CARGOS_FAMILIA);

// ❌ Cargos removidos ao entrar na família
const CARGOS_REMOVER_ADICAO = [
  '1449426346823389327', // Amigo
  '1439059436789305395'  // Visitante
];

const {
  canAddMember,
  canUpdateMember
} = require('../utils/permissions');

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

    // ================= /familia adicionar =================
if (sub === 'adicionar') {
  if (!canAddMember(interaction.member)) {
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

  // 🔎 Validação do cargo
  const cargoId = CARGOS_FAMILIA[cargoEscolhido];
  if (!cargoId) {
    return interaction.reply({
      content: '❌ Cargo inválido.',
      ephemeral: true
    });
  }

  // 👤 Busca o membro no servidor
  const guildMember = await interaction.guild.members.fetch(usuario.id).catch(() => null);

  // 🔄 Atualização de cargos no Discord
  if (guildMember) {
    try {
      // Remove Amigo e Visitante SE TIVER
      const cargosParaRemover = CARGOS_REMOVER_ADICAO.filter(cargoId =>
        guildMember.roles.cache.has(cargoId)
      );

      if (cargosParaRemover.length > 0) {
        await guildMember.roles.remove(cargosParaRemover);
      }

      // Adiciona o cargo da família
      if (!guildMember.roles.cache.has(cargoId)) {
        await guildMember.roles.add(cargoId);
      }

    } catch (err) {
      console.error('Erro ao atualizar cargos:', err);
    }
  }

  // 💾 Salva no sistema
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

  // 📩 EMBED DM PARA O USUÁRIO
  const embedDM = new EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle('🏴 Bem-vindo à Família MoChavãO')
    .setDescription(
      `Olá, <@${usuario.id}>!\n\n` +
      `Você foi **adicionado oficialmente** à **Família MoChavãO**.`
    )
    .addFields(
      {
        name: '🏷️ Cargo atribuído',
        value: cargoEscolhido,
        inline: true
      },
      {
        name: '📜 Informações',
        value: 'Seus cargos anteriores foram removidos automaticamente.',
        inline: false
      }
    )
    .setFooter({ text: 'Família MoChavãO • Sistema Oficial' })
    .setTimestamp();

  try {
    await usuario.send({ embeds: [embedDM] });
  } catch (err) {
    console.warn(`DM fechada para ${usuario.username}`);
  }

  // 📢 EMBED PARA O ADMINISTRADOR
  const embedAdmin = new EmbedBuilder()
    .setColor('#27ae60')
    .setTitle('✅ Membro adicionado à família')
    .addFields(
      {
        name: '👤 Novo membro',
        value: `<@${usuario.id}> (${usuario.username})`,
        inline: false
      },
      {
        name: '🏷️ Cargo aplicado',
        value: cargoEscolhido,
        inline: true
      },
      {
        name: '👮 Adicionado por',
        value: `<@${interaction.user.id}>`,
        inline: true
      }
    )
    .setFooter({ text: 'Sistema Oficial da Família MoChavãO • n2tzz' })
    .setTimestamp();

  return interaction.reply({ embeds: [embedAdmin] });
}


    // ================= /familia listar =================
    if (sub === 'listar') {
  if (!canAddMember(interaction.member)) {
    return interaction.reply({ content: '❌ Sem permissão.' });
  }

  const membros = lerMembros();
  const lista = Object.entries(membros);

  if (lista.length === 0) {
    return interaction.reply({ content: '⚠️ Nenhum membro cadastrado.' });
  }

  const cargosOrdem = [
    { nome: 'Dono', emoji: '👑' },
    { nome: 'Sub Dono', emoji: '🟣' },
    { nome: 'Diretor', emoji: '🎯' },
    { nome: 'Suporte', emoji: '🛠️' },
    { nome: 'Membro +', emoji: '⭐' },
    { nome: 'Membro', emoji: '👤' }
  ];

  const embed = new EmbedBuilder()
    .setColor('#9b59b6')
    .setTitle('🏴 Família MoChavãO — Listagem Administrativa')
    .setDescription('📋 **Dados completos de todos os membros registrados**')
    .setFooter({
      text: `Total de membros: ${lista.length} • Sistema criado por n2tzz`
    })
    .setTimestamp();

  for (const cargo of cargosOrdem) {
    const membrosDoCargo = lista.filter(([, m]) => m.cargo === cargo.nome);

    if (membrosDoCargo.length === 0) continue;

    let texto = '';

    for (const [id, dados] of membrosDoCargo) {
      const data = new Date(dados.dataEntrada).toLocaleDateString('pt-BR');

      texto +=
        `👤 <@${id}> (${dados.nomeDiscord})\n` +
        `🪪 Nome real: ${dados.nomeReal ?? 'Não informado'}\n` +
        `📱 WhatsApp: ${dados.whatsapp ?? 'Não informado'}\n` +
        `📅 Entrada: ${data}\n` +
        `➕ Adicionado por: <@${dados.adicionadoPor}>\n\n`;

    }

    embed.addFields({
      name: `${cargo.emoji} ${cargo.nome} (${membrosDoCargo.length})`,
      value: texto.slice(0, 1024),
      inline: false
    });
  }

  return interaction.reply({ embeds: [embed] });
}
    
    // ================= /familia remover =================
if (sub === 'remover') {
  if (!canAddMember(interaction.member)) {
    return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
  }

  const usuario = interaction.options.getUser('membro');
  const membros = lerMembros();

  if (!membros[usuario.id]) {
    return interaction.reply({ content: '⚠️ Usuário não é membro da família.', ephemeral: true });
  }

  const guildMember = await interaction.guild.members.fetch(usuario.id).catch(() => null);

  // 🔄 Atualização de cargos
if (guildMember) {
  try {
    // 🔍 Filtra apenas os cargos da família que o usuário REALMENTE tem
    const cargosParaRemover = CARGOS_FAMILIA_IDS.filter(cargoId =>
      guildMember.roles.cache.has(cargoId)
    );


    // ❌ Remove todos os cargos de família que ele possuir (1, 2 ou 3)
    if (cargosParaRemover.length > 0) {
      await guildMember.roles.remove(cargosParaRemover);
    }

    // ➕ Aplica o cargo Amigo
    // ➕ Aplica o cargo Amigo
      const CARGO_AMIGO = '1449426346823389327';

      if (!guildMember.roles.cache.has(CARGO_AMIGO)) {
        await guildMember.roles.add(CARGO_AMIGO);
      }


    } catch (err) {
      console.error('Erro ao atualizar cargos:', err);
    }
  }


  // 🗑️ Remove do sistema
  delete membros[usuario.id];
  salvarMembros(membros);

  adicionarHistorico({
    acao: 'REMOVER_MEMBRO',
    executor: interaction.user.id,
    alvo: usuario.id
  });

  // 📩 EMBED PARA O USUÁRIO (DM)
  const embedDM = new EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle('❌ Remoção da Família MoChavãO')
    .setDescription(
      `Olá, <@${usuario.id}>.\n\n` +
      `Você foi **removido da Família MoChavãO** por decisão administrativa.`
    )
    .addFields(
      {
        name: '🔄 Atualização de cargos',
        value: 'Seus cargos de família foram removidos e o cargo **Amigo** foi aplicado.',
        inline: false
      },
      {
        name: '📞 Dúvidas',
        value: 'Caso queira conversar, procure a liderança da família.',
        inline: false
      }
    )
    .setFooter({ text: 'Família MoChavãO • Sistema Oficial' })
    .setTimestamp();

  try {
    await usuario.send({ embeds: [embedDM] });
  } catch (err) {
    console.warn(`DM fechada para ${usuario.username}`);
  }

  // 📢 EMBED PARA O ADMINISTRADOR
  const embedAdmin = new EmbedBuilder()
    .setColor('#c0392b')
    .setTitle('🗑️ Membro removido da família')
    .addFields(
      {
        name: '👤 Usuário removido',
        value: `<@${usuario.id}> (${usuario.username})`,
        inline: false
      },
      {
        name: '👮 Removido por',
        value: `<@${interaction.user.id}>`,
        inline: false
      },
      {
        name: '📌 Ação realizada',
        value: 'Cargos de família removidos e cargo **Amigo** aplicado.',
        inline: false
      }
    )
    .setFooter({ text: 'Sistema Oficial da Família MoChavãO • n2tzz' })
    .setTimestamp();

  return interaction.reply({ embeds: [embedAdmin] });
}


  }
};
