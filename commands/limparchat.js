const {
  SlashCommandBuilder,
  EmbedBuilder
} = require('discord.js');

const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

const LIMITE_MAX = 30;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('limparchat')
    .setDescription('Apaga mensagens recentes do canal')
    .addIntegerOption(opt =>
      opt.setName('quantidade')
        .setDescription(`Quantidade de mensagens (máx ${LIMITE_MAX})`)
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 Permissão
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

    const quantidade = interaction.options.getInteger('quantidade');
    const canal = interaction.channel;

    if (quantidade < 1 || quantidade > LIMITE_MAX) {
      return interaction.reply({
        content: `❌ Informe um número entre **1** e **${LIMITE_MAX}**.`,
        ephemeral: true
      });
    }

    // 📥 Buscar mensagens
    const mensagens = await canal.messages.fetch({
      limit: quantidade
    });

    // 🧹 Apagar (ignora mensagens antigas)
    const apagadas = await canal.bulkDelete(mensagens, true);

    const embed = new EmbedBuilder()
      .setColor(0x3498db)
      .setTitle('🧹 Limpeza de Chat')
      .setDescription(
        `Foram apagadas **${apagadas.size} mensagens** neste canal.`
      )
      .addFields(
        {
          name: '👮 Ação por',
          value: interaction.user.tag,
          inline: true
        },
        {
          name: '📍 Canal',
          value: canal.name,
          inline: true
        }
      )
      .setFooter({
        text: 'Sistema Administrativo • Família MoChavãO'
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
