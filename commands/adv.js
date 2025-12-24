const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const {
  lerMembros,
  salvarMembros,
  lerBlacklist,
  salvarBlacklist
} = require('../utils/dataManager');

const {
  aplicarAdvertencia,
  removerAdvertencia,
  zerarAdvertenciasAposBlacklist,
  podeReceberAdvertencia
} = require('../utils/advertenciasManager');

const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

const CANAL_PUNICOES_ID = '1313574369980715131';
const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';

// 🎭 Cargos de advertência
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
            .setDescription('Provas (opcional)')
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
    // 🔐 Permissão
    if (
      !isFounder(interaction.member) &&
      !isOwner(interaction.member) &&
      !isSubOwner(interaction.member)
    ) {
      return interaction.reply({
        content: '❌ Sem permissão.',
        ephemeral: true
      });
    }

    // ⏳ SEGURA A INTERACTION (OBRIGATÓRIO)
    await interaction.deferReply();

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

      const validacao = podeReceberAdvertencia(membro, user.id);
      if (!validacao.permitido) {
        return interaction.editReply({
          content: `❌ ${validacao.erro}`
        });
      }

      const resultado = aplicarAdvertencia({
        membros,
        userId: user.id,
        motivo,
        provas,
        aplicadaPor: interaction.user.tag
      });

      if (!resultado.sucesso) {
        return interaction.editReply({
          content: `❌ ${resultado.erro}`
        });
      }

      const total = resultado.totalAtivas;
      const guildMember = await interaction.guild.members
        .fetch(user.id)
        .catch(() => null);

      // 🎭 Atualiza cargos de advertência
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

      // ================= 📢 EMBED PÚBLICO =================
      const canal = interaction.guild.channels.cache.get(CANAL_PUNICOES_ID);
      if (canal) {
        canal.send({
          embeds: [
            new EmbedBuilder()
              .setColor(
                total === 1 ? '#f1c40f' :
                total === 2 ? '#e67e22' :
                '#c0392b'
              )
              .setTitle(
                total === 1
                  ? '⚠️ Advertência Aplicada'
                  : total === 2
                  ? '🚨 Advertência Reincidente'
                  : '⛔ Limite de Advertências Atingido'
              )
              .addFields(
                { name: '👤 Membro', value: `<@${user.id}>` },
                { name: '📄 Motivo', value: motivo },
                { name: '📊 Advertências ativas', value: `${total} / 3` }
              )
              .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
              .setTimestamp()
          ]
        });
      }

      // ================= 📩 DM PROGRESSIVA =================
      try {
        let embedDM;

        if (total === 1) {
          embedDM = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('⚠️ Advertência Registrada')
            .setDescription(
              `📌 **Motivo:**\n${motivo}\n\n` +
              `Este aviso tem caráter **preventivo**.`
            );
        }

        if (total === 2) {
          embedDM = new EmbedBuilder()
            .setColor('#e67e22')
            .setTitle('🚨 Segunda Advertência')
            .setDescription(
              `📌 **Motivo:**\n${motivo}\n\n` +
              `⚠️ Próxima infração resultará em **afastamento automático**.`
            );
        }

        if (total >= 3) {
          embedDM = new EmbedBuilder()
            .setColor('#c0392b')
            .setTitle('🚫 Afastamento Temporário Aplicado')
            .setDescription(
              `Você atingiu o limite de advertências.\n\n` +
              `⏳ Afastamento automático de **5 dias** aplicado.`
            );
        }

        embedDM
          .setFooter({ text: 'Administração da Família MoChavãO' })
          .setTimestamp();

        await user.send({ embeds: [embedDM] });
      } catch {}

      // ================= 🚫 BLACKLIST AUTOMÁTICA =================
      if (total >= 3 && guildMember) {
        // Zera advertências
        zerarAdvertenciasAposBlacklist(membro);
        salvarMembros(membros);

        // Registra blacklist oficial
        const blacklist = lerBlacklist();
        blacklist[user.id] = {
          userId: user.id,
          tipo: 'TEMP',
          dias: 5,
          inicio: new Date().toISOString(),
          fim: dataMaisDias(5).toISOString(),
          motivo: 'Limite de 3 advertências atingido',
          provas: 'Sistema automático',
          aplicadoPor: 'SISTEMA (/adv)',
          ativa: true,
          origem: 'AUTO'
        };
        salvarBlacklist(blacklist);

        // Remove cargos e aplica blacklist
        const cargosRemover = guildMember.roles.cache.filter(
          r => r.id !== interaction.guild.id && !r.managed
        );

        await guildMember.roles.remove(cargosRemover);
        await guildMember.roles.add(BLACKLIST_TEMP_ROLE_ID);
      }

      // ================= ✅ RESPOSTA FINAL =================
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✅ Advertência aplicada com sucesso')
            .setDescription(`O membro <@${user.id}> recebeu a advertência.`)
            .setTimestamp()
        ]
      });
    }

    // =====================================================
    // ================= RETIRAR ADVERTÊNCIA ===============
    // =====================================================
    if (sub === 'retirar') {
      const user = interaction.options.getUser('usuario');

      const resultado = removerAdvertencia({
        membros,
        userId: user.id,
        removidaPor: interaction.user.tag
      });

      if (!resultado.sucesso) {
        return interaction.editReply({
          content: `❌ ${resultado.erro}`
        });
      }

      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle('✅ Advertência Removida')
            .addFields(
              { name: '👤 Membro', value: `<@${user.id}>` },
              { name: '📊 Advertências ativas', value: String(resultado.advertenciasAtivas) }
            )
            .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
            .setTimestamp()
        ]
      });
    }
  }
};
