const ROLES = require('../config/roles');

// 🧠 DEV / SCRIPTER SUPREMO (ACESSO TOTAL)
const DEV_ID = '353946672549724161';

// =======================
// 🔧 FUNÇÕES BASE
// =======================

function isDeveloper(member) {
  return member.id === DEV_ID;
}

function hasRole(member, roleId) {
  return member.roles.cache.has(roleId);
}

function hasAnyRole(member, rolesArray) {
  return rolesArray.some(roleId => member.roles.cache.has(roleId));
}

// =======================
// 👑 HIERARQUIA
// =======================

function isFounder(member) {
  return isDeveloper(member) || hasAnyRole(member, ROLES.FOUNDERS);
}

function isOwner(member) {
  return isDeveloper(member) || hasRole(member, ROLES.OWNERS);
}

function isSubOwner(member) {
  return isDeveloper(member) || hasRole(member, ROLES.SUB_OWNERS);
}

// 🚧 FUTURO (NÃO USADO AINDA)
function isDirector(member) {
  return hasRole(member, ROLES.DIRECTOR);
}

function isSupport(member) {
  return hasRole(member, ROLES.SUPPORT);
}

// =======================
// 🔐 REGRAS DE AÇÃO
// =======================

function canAddMember(member) {
  return isFounder(member) || isOwner(member) || isSubOwner(member);
}

function canRemoveMember(member) {
  return isFounder(member) || isOwner(member);
}

function canViewHistory(member) {
  return isFounder(member) || isOwner(member) || isSubOwner(member);
}

function canUpdateMember(member) {
  return isFounder(member) || isOwner(member);
}

// 🔥 ADMIN GERAL (se precisar no futuro)
function isAdmin(member) {
  return (
    isDeveloper(member) ||
    isFounder(member) ||
    isOwner(member) ||
    isSubOwner(member)
  );
}

module.exports = {
  DEV_ID,

  // Identidade
  isDeveloper,
  isFounder,
  isOwner,
  isSubOwner,
  isDirector,
  isSupport,

  // Permissões
  canAddMember,
  canRemoveMember,
  canViewHistory,
  canUpdateMember,
  isAdmin
};
