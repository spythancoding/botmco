const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../data/advertencias.json');

function garantirArquivo() {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify({}, null, 2));
  }
}

function lerAdvertencias() {
  garantirArquivo();
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function salvarAdvertencias(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ==========================
// 📌 APLICAR ADVERTÊNCIA
// ==========================
function aplicarAdvertencia(userId, dados) {
  const advertencias = lerAdvertencias();

  if (!advertencias[userId]) {
    advertencias[userId] = [];
  }

  advertencias[userId].push({
    ...dados,
    data: new Date().toISOString()
  });

  salvarAdvertencias(advertencias);
  return advertencias[userId].length;
}

// ==========================
// 📌 REMOVER ÚLTIMA
// ==========================
function removerAdvertencia(userId) {
  const advertencias = lerAdvertencias();

  if (!advertencias[userId] || advertencias[userId].length === 0) {
    return null;
  }

  const removida = advertencias[userId].pop();
  salvarAdvertencias(advertencias);

  return removida;
}

// ==========================
// 🧹 LIMPAR TODAS
// ==========================
function limparAdvertencias(userId) {
  const advertencias = lerAdvertencias();
  delete advertencias[userId];
  salvarAdvertencias(advertencias);
}

// ==========================
// 📊 TOTAL
// ==========================
function totalAdvertencias(userId) {
  const advertencias = lerAdvertencias();
  return advertencias[userId]?.length || 0;
}

module.exports = {
  lerAdvertencias,
  salvarAdvertencias,
  aplicarAdvertencia,
  removerAdvertencia,
  limparAdvertencias,
  totalAdvertencias
};
