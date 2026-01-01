# adm-bot

Sistema administrativo oficial da Família MoChavãO (GTA SAMP RPG).

Este bot é responsável por **todas as decisões administrativas** da família.
Não é um bot público, não é um bot social e não é um bot de economia.

---

## 🎯 Objetivo

Centralizar e registrar decisões administrativas como:
- Inscrições
- Membros
- Advertências
- Blacklist
- Logs administrativos

Com foco em:
- estabilidade
- rastreabilidade
- regras claras
- crescimento controlado

---

## ❌ O que este bot NÃO é

- Bot público
- Bot de diversão
- Bot de economia
- Bot de ranking
- Bot social

Funcionalidades fora do escopo **não entram** neste projeto.

---

## 🧱 Arquitetura

src/
├─ core/ → regras de negócio (decide)
├─ services/ → execução e escrita de dados
├─ commands/ → orquestração (Discord)
├─ embeds/ → visual
├─ events/ → interações (botões, modais)
└─ utils/ → helpers simples
data/ → fonte da verdade (JSON)

yaml
Copiar código

---

## 📌 Regras de Ouro

- Nenhuma ação administrativa sem log
- Nenhuma permissão fora do core
- Nenhuma escrita de dados fora de services
- Commands nunca decidem regras
- Core não conhece Discord
- Services não decidem permissões

---

## 🔐 Governança

- Somente o desenvolvedor (DEV) altera o código
- Demais membros da staff **não** alteram o sistema
- Regras administrativas são definidas no core

---

## 📦 Fonte da Verdade

- Dados são armazenados em arquivos JSON (`/data`)
- Dados nunca são apagados, apenas mudam de estado
- Estrutura pensada para migração futura para banco de dados

---

## 🚧 Status do Projeto

Projeto em desenvolvimento ativo.
Primeiro módulo em construção: **Inscrições (V1)**.