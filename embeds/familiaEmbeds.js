const { EmbedBuilder } = require('discord.js');

// =====================================================
// ❌ ERRO VISUAL PADRÃO
// =====================================================
function embedErro({ titulo = 'Ação não permitida', mensagem }) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle(`❌ ${titulo}`)
    .setDescription(mensagem)
    .setFooter({ text: 'Família MoChavãO' });
}

// =====================================================
// 📥 BOAS-VINDAS À FAMÍLIA (DM)
// =====================================================
function embedBoasVindasFamilia({ usuario, cargo }) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('📥 Bem-vindo à Família MoChavãO')
    .setDescription(
      `Você foi **adicionado oficialmente à Família MoChavãO**.\n\n` +
      `A partir deste momento, você passa a **representar o nome MoChavãO** ` +
      `dentro e fora do servidor.`
    )
    .addFields(
      {
        name: '👤 Membro',
        value: `<@${usuario}>`,
        inline: true
      },
      {
        name: '🏷️ Cargo atribuído',
        value: cargo,
        inline: true
      },
      {
        name: '📌 Orientações importantes',
        value:
          '• Respeite rigorosamente a hierarquia\n' +
          '• Siga todas as regras da família\n' +
          '• Mantenha postura e respeito\n' +
          '• Honre o nome que você carrega'
      }
    )
    .setFooter({
      text: `Administração da Família MoChavãO • ${new Date().toLocaleString('pt-BR')}`
    });
}

// =====================================================
// ✅ CONFIRMAÇÃO DE ENTRADA (CANAL)
// =====================================================
function embedConfirmacaoEntrada({ usuario, cargo, executor }) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('✅ Membro adicionado à Família')
    .addFields(
      { name: '👤 Usuário', value: `<@${usuario}>`, inline: true },
      { name: '🏷️ Cargo', value: cargo, inline: true },
      { name: '👮 Adicionado por', value: `<@${executor}>`, inline: false }
    )
    .setTimestamp();
}

// =====================================================
// ❌ REMOÇÃO DA FAMÍLIA (DM)
// =====================================================
function embedRemocaoFamilia({ usuario }) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('❌ Retirada da Família MoChavãO')
    .setDescription(
      `Você foi **removido da Família MoChavãO** por decisão administrativa.\n\n` +
      `Neste momento, você **não possui mais vínculo com a família**.`
    )
    .addFields({
      name: '📌 Informações importantes',
      value:
        '• Todos os cargos da família foram removidos\n' +
        '• O cargo padrão foi aplicado, se aplicável\n' +
        '• Para esclarecimentos, procure a liderança'
    })
    .setFooter({
      text: `Administração da Família MoChavãO • ${new Date().toLocaleString('pt-BR')}`
    });
}

// =====================================================
// 🗑️ CONFIRMAÇÃO DE REMOÇÃO (CANAL)
// =====================================================
function embedConfirmacaoRemocao({ usuario, executor }) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🗑️ Membro removido da Família')
    .addFields(
      { name: '👤 Usuário', value: `<@${usuario}>`, inline: true },
      { name: '👮 Removido por', value: `<@${executor}>`, inline: true }
    )
    .setTimestamp();
}

module.exports = {
  embedErro,
  embedBoasVindasFamilia,
  embedConfirmacaoEntrada,
  embedRemocaoFamilia,
  embedConfirmacaoRemocao
};
