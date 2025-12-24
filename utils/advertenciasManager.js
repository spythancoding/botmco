// utils/advertenciasManager.js

const { salvarMembros } = require('./dataManager');
const { isBlacklisted } = require('./blacklistManager');

const DIAS_EXPIRACAO_ADVERTENCIA = 30;

/**
 * Retorna advertências ativas
 */
function getAdvertenciasAtivas(membro) {
  if (!membro?.advertencias) return [];
  return membro.advertencias.filter(a => a.status === 'ativa');
}

/**
 * Verifica se o membro pode receber advertência
 */
function podeReceberAdvertencia(membro, userId) {
  if (!membro) {
    return { permitido: false, erro: 'Usuário não pertence à família.' };
  }

  if (isBlacklisted(userId)) {
    return {
      permitido: false,
      erro: 'Usuário está em blacklist ativa e não pode receber advertências.'
    };
  }

  return { permitido: true };
}

/**
 * Aplica advertência
 */
function aplicarAdvertencia({ membros, userId, motivo, provas, aplicadaPor }) {
  const membro = membros[userId];

  const validacao = podeReceberAdvertencia(membro, userId);
  if (!validacao.permitido) {
    return { sucesso: false, erro: validacao.erro };
  }

  if (!membro.advertencias) membro.advertencias = [];

  membro.advertencias.push({
    motivo,
    provas,
    aplicadaPor,
    dataAplicacao: new Date().toISOString(),
    status: 'ativa'
  });

  salvarMembros(membros);

  const totalAtivas = getAdvertenciasAtivas(membro).length;

  return {
    sucesso: true,
    totalAtivas,
    atingiuLimite: totalAtivas >= 3
  };
}

/**
 * Remove a última advertência ativa
 */
function removerAdvertencia({ membros, userId, removidaPor }) {
  const membro = membros[userId];
  if (!membro || !Array.isArray(membro.advertencias)) {
    return { sucesso: false, erro: 'Usuário não possui advertências.' };
  }

  const ativas = getAdvertenciasAtivas(membro);
  if (ativas.length === 0) {
    return { sucesso: false, erro: 'Usuário não possui advertências ativas.' };
  }

  const ultima = ativas[ativas.length - 1];
  ultima.status = 'removida';
  ultima.observacaoStatus = 'Removida manualmente pela administração';
  ultima.removidaPor = removidaPor;
  ultima.dataRemocao = new Date().toISOString();

  salvarMembros(membros);

  return {
    sucesso: true,
    advertenciasAtivas: getAdvertenciasAtivas(membro).length,
    removida: ultima
  };
}

/**
 * Zera advertências após blacklist automática
 */
function zerarAdvertenciasAposBlacklist(membro) {
  if (!membro?.advertencias) return;

  for (const adv of membro.advertencias) {
    if (adv.status === 'ativa') {
      adv.status = 'cumprida';
      adv.observacaoStatus = 'Cumprida após blacklist automática (3 advertências)';
      adv.dataConclusao = new Date().toISOString();
    }
  }
}

/**
 * 🔁 Processa expiração automática de advertências (30 dias)
 */
function processarExpiracaoAdvertencias(membros) {
  const agora = Date.now();
  let alteracoes = 0;
  const usuariosAfetados = [];

  for (const [userId, membro] of Object.entries(membros)) {
    if (!Array.isArray(membro.advertencias)) continue;

    let expirouAlguma = false;

    for (const adv of membro.advertencias) {
      if (adv.status !== 'ativa') continue;

      const dataAplicacao = new Date(adv.dataAplicacao).getTime();
      const diasPassados = (agora - dataAplicacao) / (1000 * 60 * 60 * 24);

      if (diasPassados >= DIAS_EXPIRACAO_ADVERTENCIA) {
        adv.status = 'cumprida';
        adv.observacaoStatus = 'Expirada automaticamente após 30 dias';
        adv.dataConclusao = new Date().toISOString();
        expirouAlguma = true;
        alteracoes++;
      }
    }

    if (expirouAlguma) {
      usuariosAfetados.push(userId);
    }
  }

  if (alteracoes > 0) {
    salvarMembros(membros);
  }

  return {
    alteracoes,
    usuariosAfetados
  };
}

module.exports = {
  aplicarAdvertencia,
  removerAdvertencia,
  getAdvertenciasAtivas,
  zerarAdvertenciasAposBlacklist,
  podeReceberAdvertencia,
  processarExpiracaoAdvertencias
};
