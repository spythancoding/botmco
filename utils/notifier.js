const { EmbedBuilder } = require('discord.js');

let clientRef = null;

const CANAL_ADM = '1440166535602770032';

function setClient(client) {
  clientRef = client;
}

// 🔔 NOVA VERSÃO EM EMBED
async function notificarNovaInscricaoEmbed(userId, dados = {}) {
  if (!clientRef) {
    console.warn('⚠️ Client do Discord não inicializado');
    return;
  }

  try {
    const channel = await clientRef.channels.fetch(CANAL_ADM);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('📥 Nova Inscrição')
      .setDescription(
        `O usuário <@${userId}> realizou uma inscrição e aguarda uma resposta.`
      )
      .addFields(
        {
          name: '🎮 Nick',
          value: dados.nick || 'Não informado',
          inline: true
        },
        {
          name: '🎂 Idade',
          value: dados.idade || 'Não informado',
          inline: true
        },
        {
          name: '⭐ Nível',
          value: dados.nivelConta || dados.nivel || 'Não informado',
          inline: true
        }
      )
      .setFooter({ text: 'Sistema de Inscrições • Família MoChavãO' })
      .setTimestamp();

    await channel.send({ embeds: [embed] });

  } catch (err) {
    console.error('❌ Erro ao notificar nova inscrição:', err.message);
  }
}

// 🔙 mantém a função antiga se quiser reaproveitar
async function notificarNovaInscricao(userId) {
  if (!clientRef) {
    console.warn('⚠️ Client do Discord não inicializado');
    return;
  }

  try {
    const channel = await clientRef.channels.fetch(CANAL_ADM);
    if (!channel) return;

    await channel.send(
      `📥 **Nova Inscrição**\n` +
      `O usuário <@${userId}> realizou uma inscrição e aguarda uma resposta.`
    );

  } catch (err) {
    console.error('❌ Erro ao notificar nova inscrição:', err.message);
  }
}

module.exports = {
  setClient,
  notificarNovaInscricao,
  notificarNovaInscricaoEmbed
};
