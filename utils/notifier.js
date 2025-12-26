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
      .setColor('#e67e22')
      .setTitle('📥 Nova Inscrição Recebida')
      .setDescription(
        `Uma nova inscrição foi enviada para a **Família MoChavãO**.\n\n` +
        `👤 **Candidato:** <@${userId}>\n` +
        `⏳ **Status:** Aguardando análise`
      )
      .addFields(
        {
          name: '🎮 Nick',
          value: dados.nick?.trim() || '—',
          inline: true
        },
        {
          name: '🎂 Idade',
          value: dados.idade?.toString() || '—',
          inline: true
        },
        {
          name: '⭐ Nível',
          value: (dados.nivelConta || dados.nivel)?.toString() || '—',
          inline: true
        },
        {
          name: '🛡️ Líder de Organização',
          value: dados.liderOrg || '—',
          inline: true
        },
        {
          name: '🎧 Comunicação',
          value:
            `🎤 Microfone: ${dados.microfone || '—'}\n` +
            `📞 Call: ${dados.call || '—'}`,
          inline: true
        },
        {
          name: '⏰ Disponibilidade',
          value: dados.horario || '—',
          inline: true
        },
        {
          name: '📝 Observações',
          value:
            dados.observacoes && dados.observacoes.trim() !== ''
              ? dados.observacoes
              : '_Nenhuma observação informada._',
          inline: false
        }
      )
      .setFooter({
        text: 'Sistema de Inscrições • Família MoChavãO'
      })
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
