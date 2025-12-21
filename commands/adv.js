const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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

function isLinkValido(texto) {
  return /^https?:\/\/\S+/i.test(texto);
}

const CARGOS_ADV = {
  1: '1436542860408389672',
  2: '1313574318017482774',
  3: '1313574321456939139'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adv')
    .setDescription('Sistema de advertências da família')
    .addSubcommand(sub =>
      sub
        .setName('aplicar')
        .setDescription('Aplica uma advertência')
        .addUserOption(o =>
          o.setName('usuario').setDescription('Usuário').setRequired(true)
        )
        .addStringOption(o =>
          o.setName('motivo').setDescription('Motivo').setRequired(true)
        )
        .addStringOption(o =>
          o.setName('provas').setDescription('Link de provas').setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName('retirar')
        .setDescription('Remove a última advertência')
        .addUserOption(o =>
          o.setName('usuario').setDescription('Usuário').setRequired(true)
        )
    ),

  async execute(interaction) {
    // 🔐 Permissão
    if (
      !isFounder(interaction.member) &&
      !isOwner(interaction.member) &&
      !isSubOwner(interaction.member)
    ) {
      return interaction.reply({ content: '❌ Sem permissão.', ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const membros = lerMembros();

    // ===============================
    // 📌 APLICAR ADVERTÊNCIA
    // ===============================
    if (sub === 'aplicar') {
      const user = interaction.options.getUser('usuario');
      const motivo = interaction.options.getString('motivo');
      const provas = interaction.options.getString('provas');

      if (!isLinkValido(provas)) {
        return interaction.reply({ content: '❌ Provas devem ser link.', ephemeral: true });
      }

      const membro = membros[user.id];
      if (!membro) {
        return interaction.reply({ content: '❌ Usuário não pertence à família.', ephemeral: true });
      }

      if (!membro.advertencias) membro.advertencias = [];

      membro.advertencias.push({
        motivo,
        provas,
        por: interaction.user.tag,
        data: new Date().toLocaleString('pt-BR')
      });

      salvarMembros(membros);

      const total = membro.advertencias.length;
      const guildMember = await interaction.guild.members.fetch(user.id);

      // Remove cargos antigos
      for (const id of Object.values(CARGOS_ADV)) {
        if (guildMember.roles.cache.has(id)) {
          await guildMember.roles.remove(id);
        }
      }

      // Aplica cargos até o nível atual
      for (let i = 1; i <= Math.min(total, 3); i++) {
        await guildMember.roles.add(CARGOS_ADV[i]);
      }

      // 🚨 Terceira advertência
      if (total === 3) {
        const embed = new EmbedBuilder()
          .setColor('#c0392b')
          .setTitle('🚨 LIMITE DE ADVERTÊNCIAS')
          .setDescription(`O membro <@${user.id}> atingiu **3 advertências**.`)
          .addFields(
            { name: '📄 Motivo', value: motivo },
            { name: '📎 Provas', value: provas }
          )
          .setFooter({ text: 'Escolha a ação administrativa' })
          .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`adv_punir_${user.id}`)
            .setLabel('Punir')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId(`adv_livrar_${user.id}`)
            .setLabel('Livrar')
            .setStyle(ButtonStyle.Success)
        );

        return interaction.reply({ embeds: [embed], components: [row] });
      }

      const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('⚠️ Advertência Aplicada')
        .addFields(
          { name: '👤 Usuário', value: `<@${user.id}>` },
          { name: '📄 Motivo', value: motivo },
          { name: '📎 Provas', value: provas },
          { name: '📊 Total', value: `${total}` }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // ===============================
    // 📌 RETIRAR ADVERTÊNCIA
    // ===============================
    if (sub === 'retirar') {
      const user = interaction.options.getUser('usuario');
      const membro = membros[user.id];

      if (!membro || !membro.advertencias || membro.advertencias.length === 0) {
        return interaction.reply({
          content: '❌ Este usuário não possui advertências.',
          ephemeral: true
        });
      }

      const removida = membro.advertencias.pop();
      salvarMembros(membros);

      const total = membro.advertencias.length;
      const guildMember = await interaction.guild.members.fetch(user.id);

      for (const id of Object.values(CARGOS_ADV)) {
        if (guildMember.roles.cache.has(id)) {
          await guildMember.roles.remove(id);
        }
      }

      for (let i = 1; i <= Math.min(total, 3); i++) {
        await guildMember.roles.add(CARGOS_ADV[i]);
      }

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('✅ Advertência Removida')
        .addFields(
          { name: '📄 Motivo removido', value: removida.motivo },
          { name: '📊 Total atual', value: `${total}` }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  }
};
