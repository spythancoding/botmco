const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const {
  lerMembros,
  salvarMembros
} = require('../utils/dataManager');

const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

const CANAL_PUNICOES_ID = '1313574369980715131';
const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';

const CARGOS_ADV = {
  1: '1436542860408389672',
  2: '1313574318017482774',
  3: '1313574321456939139'
};

function dataMaisDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adv')
    .setDescription('Sistema de advertências da família')

    // ================= APLICAR =================
    .addSubcommand(sub =>
      sub
        .setName('aplicar')
        .setDescription('Aplica uma advertência')
        .addUserOption(o =>
          o.setName('usuario')
            .setDescription('Usuário')
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName('motivo')
            .setDescription('Motivo da advertência')
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName('provas')
            .setDescription('Link de provas (opcional)')
            .setRequired(false)
        )
    )

    // ================= RETIRAR =================
    .addSubcommand(sub =>
      sub
        .setName('retirar')
        .setDescription('Remove a última advertência ativa')
        .addUserOption(o =>
          o.setName('usuario')
            .setDescription('Usuário')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (
      !isFounder(interaction.member) &&
      !isOwner(interaction.member) &&
      !isSubOwner(interaction.member)
    ) {
      return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const membros = lerMembros();

    // =====================================================
    // ================= APLICAR ADVERTÊNCIA ===============
    // =====================================================
    if (sub === 'aplicar') {
      const user = interaction.options.getUser('usuario');
      const motivo = interaction.options.getString('motivo');
      const provas = interaction.options.getString('provas') || 'Não informadas';

      const membro = membros[user.id];
      if (!membro) {
        return interaction.reply({
          content: '❌ Usuário não pertence à família.',
          ephemeral: true
        });
      }

      if (!membro.advertencias) membro.advertencias = [];

      membro.advertencias.push({
        motivo,
        provas,
        aplicadaPor: interaction.user.tag,
        dataAplicacao: new Date().toISOString(),
        status: 'ativa'
      });

      const advertenciasAtivas = membro.advertencias.filter(a => a.status === 'ativa');
      const total = advertenciasAtivas.length;

      salvarMembros(membros);

      const guildMember = await interaction.guild.members.fetch(user.id).catch(() => null);

      // 🎭 CARGOS DE ADVERTÊNCIA
      if (guildMember) {
        for (const id of Object.values(CARGOS_ADV)) {
          if (guildMember.roles.cache.has(id)) {
            await guildMember.roles.remove(id);
          }
        }

        for (let i = 1; i <= Math.min(total, 3); i++) {
          await guildMember.roles.add(CARGOS_ADV[i]);
        }
      }

      // 📢 EMBED PÚBLICO
      const canal = interaction.guild.channels.cache.get(CANAL_PUNICOES_ID);
      if (canal) {
        const tituloPublico =
          total === 1
            ? '⚠️ Advertência Aplicada (1ª)'
            : total === 2
            ? '🚨 Advertência Reincidente (2ª)'
            : '⛔ Limite de Advertências Atingido';

        const embedPublico = new EmbedBuilder()
          .setColor(total === 1 ? '#f1c40f' : total === 2 ? '#e67e22' : '#c0392b')
          .setTitle(tituloPublico)
          .addFields(
            { name: '👤 Usuário', value: `<@${user.id}>` },
            { name: '📄 Motivo', value: motivo },
            { name: '📊 Advertências ativas', value: `${total}` }
          )
          .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
          .setTimestamp();

        canal.send({ embeds: [embedPublico] });
      }

      // 📩 DM PROGRESSIVA
      try {
        let embedDM;

        if (total === 1) {
          embedDM = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('⚠️ Advertência Registrada')
            .setDescription(
              `Esta é uma **advertência formal** aplicada ao seu histórico.\n\n` +
              `📌 Motivo:\n${motivo}\n\n` +
              `Este aviso tem caráter **preventivo**. Reincidências podem gerar punições mais severas.`
            );
        }

        if (total === 2) {
          embedDM = new EmbedBuilder()
            .setColor('#e67e22')
            .setTitle('🚨 Segunda Advertência')
            .setDescription(
              `Esta é a **segunda advertência ativa** em seu histórico.\n\n` +
              `📌 Motivo:\n${motivo}\n\n` +
              `⚠️ **Qualquer nova infração resultará em afastamento automático da família.**`
            );
        }

        if (total >= 3) {
          const fim = dataMaisDias(5);

          embedDM = new EmbedBuilder()
            .setColor('#7b0d0d')
            .setTitle('🚫 RESTRIÇÃO TEMPORÁRIA APLICADA')
            .setDescription(
              `Você atingiu o limite máximo de advertências permitidas.\n\n` +
              `Como consequência, foi aplicado um **afastamento automático de 5 dias**.\n\n` +
              `📅 Retorno previsto: **${fim.toLocaleDateString('pt-BR')}**`
            );
        }

        embedDM
          .setFooter({ text: 'Administração da Família MoChavãO' })
          .setTimestamp();

        await user.send({ embeds: [embedDM] });
      } catch {}

      // 🚫 BLACKLIST AUTOMÁTICA
      if (total >= 3 && guildMember) {
        for (const adv of membro.advertencias) {
          if (adv.status === 'ativa') {
            adv.status = 'cumprida';
            adv.observacaoStatus = 'Cumprida após blacklist automática (5 dias)';
          }
        }

        salvarMembros(membros);

        const cargosRemover = guildMember.roles.cache.filter(r =>
          r.id !== interaction.guild.id && !r.managed
        );

        await guildMember.roles.remove(cargosRemover);
        await guildMember.roles.add(BLACKLIST_TEMP_ROLE_ID);
      }

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✅ Advertência aplicada')
            .setDescription(`Advertência registrada para <@${user.id}>`)
            .setTimestamp()
        ]
      });
    }

    // =====================================================
    // ================= RETIRAR ADVERTÊNCIA ===============
    // =====================================================
  
if (sub === 'retirar') {
  const user = interaction.options.getUser('usuario');
  const membro = membros[user.id];

  if (!membro || !Array.isArray(membro.advertencias)) {
    return interaction.reply({
      content: '❌ Este usuário não possui advertências registradas.',
      ephemeral: true
    });
  }

  // Apenas advertências ativas
  const advertenciasAtivas = membro.advertencias.filter(a => a.status === 'ativa');

  if (advertenciasAtivas.length === 0) {
    return interaction.reply({
      content: '❌ Este usuário não possui advertências ativas.',
      ephemeral: true
    });
  }

  // Remove a ÚLTIMA advertência ativa
  const removida = advertenciasAtivas[advertenciasAtivas.length - 1];

  removida.status = 'removida';
  removida.observacaoStatus = 'Removida manualmente pela administração';
  removida.dataRemocao = new Date().toISOString();

  salvarMembros(membros);

  const totalAtivas = membro.advertencias.filter(a => a.status === 'ativa').length;

  // 🎭 Atualiza cargos no Discord
  const guildMember = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (guildMember) {
    // Remove todos os cargos de advertência
    for (const id of Object.values(CARGOS_ADV)) {
      if (guildMember.roles.cache.has(id)) {
        await guildMember.roles.remove(id);
      }
    }

    // Reaplica conforme quantidade restante
    for (let i = 1; i <= Math.min(totalAtivas, 3); i++) {
      await guildMember.roles.add(CARGOS_ADV[i]);
    }
  }

  // 🧾 Blindagem TOTAL do embed
  const motivoRemovido = removida.motivo || 'Motivo não registrado';

  const embed = new EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle('✅ Advertência Removida')
    .addFields(
      { name: '👤 Usuário', value: `<@${user.id}>`, inline: false },
      { name: '📄 Motivo removido', value: motivoRemovido, inline: false },
      { name: '📊 Advertências ativas', value: String(totalAtivas), inline: false }
    )
    .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}

  }
};
