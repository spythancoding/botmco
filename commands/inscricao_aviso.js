const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

const CANAL_INSCRICOES = '1450516667397439670';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inscricao_aviso')
    .setDescription('Envia a embed de aviso e requisitos para novos inscritos'),

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

    // 📝 EMBED
    const avisoInscricaoEmbed = new EmbedBuilder()
      .setTitle('📝 Inscrição MoChavãO')
      .setColor(0x9b59b6)
      .setThumbnail('https://i.imgur.com/PDJRqCR.png')
      .setDescription(
        '**LER COM ATENÇÃO**\n\n' +
        'A MoChavãO é mais que uma equipe — é união, respeito e vontade de crescer juntos. Buscamos pessoas comprometidas, humildes e prontas para somar.\n\n' +
        'Para entrar na família, o candidato passará por um teste de 5 dias, onde será avaliado em:\n' +
        '• Atividade\n' +
        '• Compromisso com a família\n' +
        '• Participação em call no Discord da família\n' +
        '• Interação com os membros\n' +
        '• Ajuda na organização da família\n\n' +
        '✅ **Pré-requisitos para participar:**\n' +
        '• Ser ativo\n' +
        '• Ter Discord\n' +
        '• Ter no mínimo 14 anos\n\n' +
        'OBS: Não acolhemos em nossa família outros líderes (principalmente rivais), membros em blacklist.\n\n' +
        '# Realize o teste utilizando /inscrever. BOA SORTE!'
      )
      .setFooter({ text: 'Família MoChavãO © 2025' })
      .setTimestamp();

    // 📢 ENVIO NO CANAL
    const canal = interaction.guild.channels.cache.get(CANAL_INSCRICOES);

    if (!canal) {
      return interaction.reply({
        content: '❌ Canal de inscrições não encontrado.',
        ephemeral: true
      });
    }

    await canal.send({ embeds: [avisoInscricaoEmbed] });

    return interaction.reply({
      content: '✅ Embed de aviso enviada com sucesso no canal de inscrições.',
      ephemeral: true
    });
  }
};
