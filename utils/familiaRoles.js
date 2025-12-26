// utils/familiaRoles.js

// ⚠️ SUBSTITUA PELOS IDS REAIS
const CARGOS_FAMILIA = [
  '1313574259779571845',
  '1445295441481564256',
  '1313574261041926225',
  '1367402086119243797'
];

const CARGO_VISITANTE = '1439059436789305395';

/**
 * Remove todos os cargos da família
 */
async function removerCargosFamilia(member) {
  if (!member) return;

  const remover = member.roles.cache
    .filter(role => CARGOS_FAMILIA.includes(role.id))
    .map(role => role.id);

  if (remover.length > 0) {
    await member.roles.remove(remover).catch(() => {});
  }
}

/**
 * Define o estado do membro na família
 * @param member GuildMember
 * @param cargoId ID do cargo a aplicar (ou null)
 * @param aplicarVisitante boolean
 */
async function definirCargoFamilia(member, cargoId, aplicarVisitante = false) {
  if (!member) return;

  // 1️⃣ Remove tudo da família
  await removerCargosFamilia(member);

  // 2️⃣ Remove visitante (se existir)
  if (member.roles.cache.has(CARGO_VISITANTE)) {
    await member.roles.remove(CARGO_VISITANTE).catch(() => {});
  }

  // 3️⃣ Aplica cargo solicitado
  if (cargoId) {
    await member.roles.add(cargoId).catch(() => {});
  }

  // 4️⃣ Se for remoção total, aplica visitante
  if (!cargoId && aplicarVisitante) {
    await member.roles.add(CARGO_VISITANTE).catch(() => {});
  }
}

module.exports = {
  definirCargoFamilia,
  removerCargosFamilia,
  CARGOS_FAMILIA,
  CARGO_VISITANTE
};
