/**
 * Normaliza cargos de um membro da família MoChavãO
 *
 * Regras:
 * - O membro pode ter APENAS 1 cargo de membro
 * - Sempre mantém o cargo de maior hierarquia
 * - Remove cargos inferiores do grupo
 * - Não afeta cargos administrativos
 * - Visitante continua como base
 *
 * NÃO é automático
 * NÃO é punição
 */

const CARGOS_MEMBRO_IDS = [
  '1313574259779571845',
  '1445295441481564256',
  '1313574261041926225',
  '1367402086119243797'
];

async function normalizarCargos(member, visitanteRoleId) {
  if (!member || member.user.bot) return false;

  const visitanteRole = member.guild.roles.cache.get(visitanteRoleId);
  if (!visitanteRole) {
    console.warn('⚠️ Cargo Visitante não encontrado.');
    return false;
  }

  const roles = member.roles.cache;
  let alterou = false;

  // ==========================
  // 1️⃣ NORMALIZA CARGOS DA FAMÍLIA
  // ==========================
  const cargosMembro = roles.filter(r =>
    CARGOS_MEMBRO_IDS.includes(r.id)
  );

  if (cargosMembro.size > 1) {
    // Mantém o cargo mais alto da família
    const cargoMaisAlto = cargosMembro
      .sort((a, b) => b.position - a.position)
      .first();

    for (const role of cargosMembro.values()) {
      if (role.id !== cargoMaisAlto.id) {
        await member.roles.remove(role);
        alterou = true;
      }
    }
  }

  // ==========================
  // 2️⃣ NORMALIZA COM BASE NO VISITANTE (SUA LÓGICA)
  // ==========================

  // Ignora @everyone
  const rolesValidos = roles.filter(r => r.id !== member.guild.id);

  const cargosAcima = rolesValidos.filter(
    r => r.position > visitanteRole.position
  );

  const cargosAbaixo = rolesValidos.filter(
    r => r.position < visitanteRole.position
  );

  // 🔵 Tem cargo acima de Visitante
  if (cargosAcima.size > 0) {
    if (roles.has(visitanteRoleId)) {
      await member.roles.remove(visitanteRoleId);
      alterou = true;
    }

    if (cargosAbaixo.size > 0) {
      await member.roles.remove(cargosAbaixo.map(r => r.id));
      alterou = true;
    }
  }
  // 🟡 Não tem cargo acima de Visitante
  else {
    if (!roles.has(visitanteRoleId)) {
      await member.roles.add(visitanteRoleId);
      alterou = true;
    }

    if (cargosAbaixo.size > 0) {
      await member.roles.remove(cargosAbaixo.map(r => r.id));
      alterou = true;
    }
  }

  return alterou;
}

module.exports = {
  normalizarCargos
};
