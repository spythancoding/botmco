const express = require('express');
const router = express.Router();
const { getInscricao } = require('../utils/dataManager');

const {
  lerInscritos,
  criarInscricao,
  lerMembros
} = require('../utils/dataManager');

// ID FIXO DO SERVIDOR
const GUILD_ID = '1313568206132220034';

// ===============================
// 📥 POST /api/inscricao
// ===============================
router.post('/inscricao', async (req, res) => {
  try {
    const { userId, dados } = req.body;

    // 🔴 Validação básica
    if (!userId || !dados) {
      return res.status(400).json({
        error: 'Dados inválidos ou incompletos.'
      });
    }

    // 🔒 Já é membro?
    const membros = lerMembros();
    if (membros[userId]) {
      return res.status(403).json({
        error: 'Usuário já é membro da família.'
      });
    }

    // 🔒 Já possui inscrição ativa?
    const inscritos = lerInscritos();
    if (inscritos[userId]) {
      return res.status(409).json({
        error: 'Usuário já possui inscrição ativa.'
      });
    }
    
    if (getInscricao(userId)) {
        return res.status(400).json({
            error: 'Você já possui uma inscrição em andamento.'
        });
        }

    // ✅ Criar inscrição
    criarInscricao(userId, dados);

    return res.json({ success: true });

  } catch (err) {
    console.error('❌ Erro na API de inscrição:', err);
    return res.status(500).json({
      error: 'Erro interno no servidor.'
    });
  }
});

module.exports = router;
