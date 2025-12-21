const fs = require('fs');
const path = require('path');
const blacklistPath = path.join(__dirname, '../data/blacklist.json');


// ==========================
// CAMINHOS DOS ARQUIVOS
// ==========================
const inscritosPath = path.join(__dirname, '../data/inscritos.json');
const testePath = path.join(__dirname, '../data/teste.json');
const membrosPath = path.join(__dirname, '../data/membros.json');
const historicoPath = path.join(__dirname, '../data/historico.json');

// ==========================
// FUNÇÕES GENÉRICAS
// ==========================
function garantirArquivo(caminho, valorInicial) {
  if (!fs.existsSync(caminho)) {
    fs.writeFileSync(caminho, JSON.stringify(valorInicial, null, 2));
  }
}

function lerJSON(caminho, valorInicial) {
  garantirArquivo(caminho, valorInicial);
  try {
    const data = fs.readFileSync(caminho, 'utf8');
    return data ? JSON.parse(data) : valorInicial;
  } catch (err) {
    console.error(`❌ Erro ao ler ${caminho}`, err);
    return valorInicial;
  }
}

function salvarJSON(caminho, conteudo) {
  fs.writeFileSync(caminho, JSON.stringify(conteudo, null, 2));
}

// ==========================
// 📜 HISTÓRICO
// ==========================
function lerHistorico() {
  return lerJSON(historicoPath, []);
}

function adicionarHistorico(acao) {
  const historico = lerHistorico();

  historico.push({
    id: Date.now(),
    data: new Date().toISOString(),
    ...acao
  });

  salvarJSON(historicoPath, historico);
}

// ==========================
// 👥 MEMBROS
// ==========================
function lerMembros() {
  return lerJSON(membrosPath, {});
}

function salvarMembros(membros) {
  salvarJSON(membrosPath, membros);
}

// ==========================
// 📝 INSCRIÇÕES
// ==========================
function lerInscritos() {
  return lerJSON(inscritosPath, {});
}

function salvarInscritos(inscritos) {
  salvarJSON(inscritosPath, inscritos);
}

function criarInscricao(userId, dados) {
  const inscritos = lerInscritos();

  inscritos[userId] = {
    userId,
    ...dados,
    status: 'pendente_inscricao',
    dataInscricao: new Date().toISOString()
  };

  salvarInscritos(inscritos);
}

function getInscricao(userId) {
  const inscritos = lerInscritos();
  return inscritos[userId] || null;
}

// ==========================
// 🧪 TESTE (5 DIAS)
// ==========================
function lerTeste() {
  return lerJSON(testePath, {});
}

function salvarTeste(testes) {
  salvarJSON(testePath, testes);
}

function removerTeste(userId) {
  const testes = lerTeste();
  delete testes[userId];
  salvarTeste(testes);
}

function atualizarInscricao(userId, novosDados) {
  const inscritos = lerInscritos();

  if (!inscritos[userId]) return false;

  inscritos[userId] = {
    ...inscritos[userId],
    ...novosDados
  };

  salvarInscritos(inscritos);
  return true;
}

// ==========================
// ⛔ BLACKLIST
// ==========================
function lerBlacklist() {
  return lerJSON(blacklistPath, {});
}

function salvarBlacklist(blacklist) {
  salvarJSON(blacklistPath, blacklist);
}


function aprovarInscricao(userId, aprovadoPor) {
  const inscritos = lerInscritos();
  const testes = lerTeste();

  if (!inscritos[userId]) return false;

  const inicio = new Date();
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 5);

  testes[userId] = {
    ...inscritos[userId],
    status: 'em_teste',
    inicioTeste: inicio.toISOString(),
    fimTeste: fim.toISOString(),
    aprovadoPor
  };

  delete inscritos[userId];

  salvarInscritos(inscritos);
  salvarTeste(testes);

  return true;
}

function listarEmTeste() {
  const testes = lerTeste();
  return Object.values(testes);
}

// ==========================
// EXPORTS
// ==========================
module.exports = {
  // Inscrições
  lerInscritos,
  salvarInscritos,
  criarInscricao,
  getInscricao,
  aprovarInscricao,
  atualizarInscricao,
  
  // Teste
  lerTeste,
  salvarTeste,
  removerTeste,
  listarEmTeste,

  // Membros
  lerMembros,
  salvarMembros,

    // Blacklist
  lerBlacklist,
  salvarBlacklist,

  // Histórico
  lerHistorico,
  adicionarHistorico
};
