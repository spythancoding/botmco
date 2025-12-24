const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/blacklist.json');

/**
 * ===============================
 * 📦 UTILIDADES INTERNAS
 * ===============================
 */
function lerArquivo() {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function salvarArquivo(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/**
 * ===============================
 * 🔍 CONSULTAS
 * ===============================
 */

/**
 * Verifica se o usuário possui blacklist ativa
 */
function isBlacklisted(userId) {
  const blacklist = lerArquivo();
  return Boolean(blacklist[userId]?.ativa === true);
}

/**
 * Retorna o registro completo da blacklist do usuário
 */
function getBlacklist(userId) {
  const blacklist = lerArquivo();
  return blacklist[userId] || null;
}

/**
 * ===============================
 * 🚫 APLICAÇÕES
 * ===============================
 */

/**
 * Aplica blacklist temporária
 */
function aplicarBlacklistTemp({
  userId,
  dias,
  motivo,
  provas,
  aplicadoPor,
  origem = 'MANUAL'
}) {
  const blacklist = lerArquivo();

  if (blacklist[userId]?.ativa) {
    return { sucesso: false, erro: 'Usuário já possui blacklist ativa.' };
  }

  const inicio = new Date();
  const fim = new Date();
  fim.setDate(fim.getDate() + dias);

  blacklist[userId] = {
    userId,
    tipo: 'TEMP',
    dias,
    inicio: inicio.toISOString(),
    fim: fim.toISOString(),
    motivo,
    provas,
    aplicadoPor,
    origem,
    ativa: true
  };

  salvarArquivo(blacklist);
  return { sucesso: true, fim };
}

/**
 * Aplica blacklist permanente
 */
function aplicarBlacklistPerm({
  userId,
  motivo,
  provas,
  aplicadoPor
}) {
  const blacklist = lerArquivo();

  if (blacklist[userId]?.ativa) {
    return { sucesso: false, erro: 'Usuário já possui blacklist ativa.' };
  }

  blacklist[userId] = {
    userId,
    tipo: 'PERM',
    motivo,
    provas,
    aplicadoPor,
    data: new Date().toISOString(),
    ativa: true
  };

  salvarArquivo(blacklist);
  return { sucesso: true };
}

/**
 * ===============================
 * 🔓 REMOÇÃO
 * ===============================
 */

/**
 * Remove blacklist (TEMP ou PERM)
 * ⚠️ Cabe ao comando validar permissão para PERM
 */
function removerBlacklist({ userId, removidoPor }) {
  const blacklist = lerArquivo();

  if (!blacklist[userId]?.ativa) {
    return { sucesso: false, erro: 'Usuário não possui blacklist ativa.' };
  }

  blacklist[userId].ativa = false;
  blacklist[userId].removidoPor = removidoPor;
  blacklist[userId].dataRemocao = new Date().toISOString();

  salvarArquivo(blacklist);
  return { sucesso: true };
}

/**
 * ===============================
 * ⏳ AUTOMAÇÃO (FUTURO)
 * ===============================
 */

/**
 * Retorna todas as blacklists temporárias expiradas
 */
function getBlacklistsTemporariasExpiradas() {
  const blacklist = lerArquivo();
  const agora = new Date();

  return Object.values(blacklist).filter(registro =>
    registro.ativa === true &&
    registro.tipo === 'TEMP' &&
    registro.fim &&
    new Date(registro.fim) <= agora
  );
}

module.exports = {
  // consultas
  isBlacklisted,
  getBlacklist,

  // aplicações
  aplicarBlacklistTemp,
  aplicarBlacklistPerm,

  // remoção
  removerBlacklist,

  // automação
  getBlacklistsTemporariasExpiradas
};
