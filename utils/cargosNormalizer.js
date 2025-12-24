/**
 * Normaliza cargos de um membro com base
 * na posição do cargo Visitante.
 *
 * NÃO é automático
 * NÃO é punição
 */
async function normalizarCargos(member, visitanteRoleId) {
  if (!member || member.user.bot) return false;

  const visitanteRole = member.guild.roles.cache.get(visitanteRoleId);
  if (!visitanteRole) {
    console.warn('⚠️ Cargo Visitante não encontrado.');
    return false;
  }

  const roles = member.roles.cache;

  // Ignora @everyone
  const rolesValidos = roles.filter(r => r.id !== member.guild.id);

  const cargosAcima = rolesValidos.filter(
    r => r.position > visitanteRole.position
  );

  const cargosAbaixo = rolesValidos.filter(
    r => r.position < visitanteRole.position
  );

  let alterou = false;

  // 🔵 Tem cargo acima
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
  // 🟡 Não tem cargo acima
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
