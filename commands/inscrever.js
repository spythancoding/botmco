const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

const { lerMembros } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscrever')
    .setDescription('Inscrição para a família MoChavãO'),

  async execute(interaction) {

    // ======================
    // 🔒 BLOQUEIO: JÁ É MEMBRO
    // ======================
    const membros = lerMembros();

    if (membros[interaction.user.id]) {
      return interaction.reply({
        content: '❌ Você já faz parte da Família **MoChavãO** e não pode criar uma nova inscrição.',
        ephemeral: true
      });
    }

    // ======================
    // 📋 MODAL DE INSCRIÇÃO
    // ======================
    const modal = new ModalBuilder()
      .setCustomId('modal_inscricao')
      .setTitle('Inscrição - Família MoChavãO');

    const nick = new TextInputBuilder()
      .setCustomId('nick')
      .setLabel('Nick (in-game)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const nivel = new TextInputBuilder()
      .setCustomId('nivel')
      .setLabel('Nível')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const idade = new TextInputBuilder()
      .setCustomId('idade')
      .setLabel('Idade')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const liderOrg = new TextInputBuilder()
      .setCustomId('lider_org')
      .setLabel('É líder de org? (sim/não + qual)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const indicacao = new TextInputBuilder()
      .setCustomId('indicacao')
      .setLabel('Indicação? (nome ou não)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nick),
      new ActionRowBuilder().addComponents(nivel),
      new ActionRowBuilder().addComponents(idade),
      new ActionRowBuilder().addComponents(liderOrg),
      new ActionRowBuilder().addComponents(indicacao),
    );

    await interaction.showModal(modal);
  }
};
