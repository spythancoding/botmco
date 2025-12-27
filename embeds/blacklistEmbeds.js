const { EmbedBuilder } = require('discord.js');

// =====================================================
// ❌ ERRO VISUAL PADRÃO
// =====================================================
function embedErroBlacklist({ mensagem }) {
  return new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('❌ Ação não permitida')
    .setDescription(mensagem)
    .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' });
}

// =====================================================
// ⛔ DM — BLACKLIST TEMPORÁRIA
// =====================================================
function embedDmBlacklistTemp({ dias, motivo }) {
  return new EmbedBuilder()
    .setColor(0xc0392b)
    .setTitle('⛔ Blacklist Temporária')
    .setDescription(
      `Você foi **afastado temporariamente** da Família MoChavãO.\n\n` +
      `Durante este período, você **não poderá participar das atividades da família**.`
    )
    .addFields(
      { name: '⏳ Duração', value: `${dias} dias`, inline: true },
      { name: '📌 Motivo', value: motivo, inline: false }
    )
    .setFooter({ text: 'Administração da Família MoChavãO' })
    .setTimestamp();
}

// =====================================================
// ☠️ DM — BLACKLIST PERMANENTE
// =====================================================
function embedDmBlacklistPerm({ motivo }) {
  return new EmbedBuilder()
    .setColor(0x000000)
    .setTitle('☠️ BLACKLIST PERMANENTE')
    .setDescription(
      `Você foi **REMOVIDO DEFINITIVAMENTE** da Família MoChavãO.\n\n` +
      `Esta decisão é **IRREVERSÍVEL**.\n` +
      `Não haverá revisão ou recurso.`
    )
    .addFields(
      { name: '📌 Motivo', value: motivo }
    )
    .setFooter({ text: 'Administração da Família MoChavãO' })
    .setTimestamp();
}

// =====================================================
// 📢 LOG ADMIN — APLICAÇÃO (TEMP / PERM)
// =====================================================
function embedLogAplicacao({ usuarioId, tipo, dias, motivo, provas, executorId }) {
  return new EmbedBuilder()
    .setColor(tipo === 'PERM' ? 0x000000 : 0xc0392b)
    .setTitle(tipo === 'PERM'
      ? '☠️ Blacklist Permanente Aplicada'
      : '⛔ Blacklist Temporária Aplicada'
    )
    .addFields(
      { name: '👤 Usuário', value: `<@${usuarioId}>`, inline: true },
      { name: '🛡️ Aplicado por', value: `<@${executorId}>`, inline: true },
      tipo === 'TEMP'
        ? { name: '⏳ Duração', value: `${dias} dias`, inline: true }
        : null,
      { name: '📌 Motivo', value: motivo },
      { name: '🔗 Provas', value: provas || 'Não informadas' }
    )
    .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
    .setTimestamp();
}

// =====================================================
// 📣 AVISO PÚBLICO À FAMÍLIA — BLACKLIST
// =====================================================
function embedAvisoFamiliaBlacklist({ usuarioId, tipo, dias }) {
  return new EmbedBuilder()
    .setColor(tipo === 'PERM' ? 0x000000 : 0xc0392b)
    .setTitle('📣 Aviso à Família MoChavãO')
    .setDescription(
      `Um membro da família foi **punido disciplinarmente**.\n\n` +
      `👤 **Usuário:** <@${usuarioId}>\n` +
      `⛔ **Punição:** Blacklist ${tipo === 'PERM' ? 'PERMANENTE' : 'TEMPORÁRIA'}${
        tipo === 'TEMP' ? ` (${dias} dias)` : ''
      }\n\n` +
      `⚠️ Reforçamos que **regras existem para serem cumpridas**.\n` +
      `Postura, respeito e disciplina são pilares da família.`
    )
    .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
    .setTimestamp();
}

// =====================================================
// 🔓 DM — REMOÇÃO DE BLACKLIST
// =====================================================
function embedDmRemocaoBlacklist() {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('✅ Afastamento Encerrado')
    .setDescription(
      `Seu **afastamento foi encerrado**.\n\n` +
      `Você foi **reintegrado** e deve manter uma postura adequada para evitar novas punições.`
    )
    .setFooter({ text: 'Administração da Família MoChavãO' })
    .setTimestamp();
}

// =====================================================
// 📢 AVISO ADMIN — FIM DE BLACKLIST TEMP
// =====================================================
function embedAvisoFimBlacklist({ usuarioId, motivo, fim }) {
  return new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('🔓 Blacklist Temporária Encerrada')
    .setDescription(
      `Uma blacklist temporária foi **encerrada automaticamente pelo sistema**.\n\n` +
      `👤 **Usuário:** <@${usuarioId}>\n` +
      `📌 **Motivo:** ${motivo}\n` +
      `⏳ **Fim previsto:** ${new Date(fim).toLocaleString('pt-BR')}`
    )
    .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
    .setTimestamp();
}


// =====================================================
// 📢 LOG ADMIN — REMOÇÃO
// =====================================================
function embedLogRemocao({ usuarioId, tipo, executorId }) {
  return new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle('🔓 Blacklist Encerrada')
    .addFields(
      { name: '👤 Usuário', value: `<@${usuarioId}>`, inline: true },
      { name: '📌 Tipo', value: tipo, inline: true },
      { name: '🛡️ Liberado por', value: `<@${executorId}>`, inline: true }
    )
    .setFooter({ text: 'Sistema Disciplinar • Família MoChavãO' })
    .setTimestamp();
}

// =====================================================
// ✅ CONFIRMAÇÃO AO EXECUTOR
// =====================================================
function embedConfirmacao({ titulo, descricao }) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle(titulo)
    .setDescription(descricao)
    .setTimestamp();
}

module.exports = {
  embedErroBlacklist,
  embedDmBlacklistTemp,
  embedDmBlacklistPerm,
  embedLogAplicacao,
  embedDmRemocaoBlacklist,
  embedLogRemocao,
  embedConfirmacao,
  embedAvisoFamiliaBlacklist,
  embedAvisoFimBlacklist
};
