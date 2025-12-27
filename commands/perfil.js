const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dayjs = require('dayjs');
const { lerMembros } = require('../utils/dataManager');

// ==========================
// CONFIGURAÇÕES VISUAIS
// ==========================
const CORES_CARGO = {
  'Dono': 0xF1C40F,
  'Diretor': 0x8E44AD,
  'Administrador': 0xC0392B,
  'Membro +': 0x2ECC71,
  'Membro': 0x7F8C8D,
  'Legacy': 0x2C2C2C
};

const STATUS_LABEL = {
  excelente: '🟢 Excelente',
  bom: '🔵 Bom',
  regular: '🟡 Regular',
  atencao: '🟠 Atenção',
  nocivo: '🔴 Nocivo'
};

const ATIVIDADE_LABEL = {
  alta: '🔥 Alta',
  media: '🙂 Média',
  baixa: '💤 Baixa'
};

const BADGES_EMOJI = {
  teste_aprovado: '🧪',
  '30_dias': '⏱️',
  '90_dias': '⏳',
  recrutador: '🤝',
  suporte: '🛡️',
  comunicacao: '📢',
  destaque_semana: '🏅',
  comprometimento: '🎯',
  legacy: '🏛️'
};

// ==========================
// COMANDO
// ==========================
module.exports = {
  data: new SlashCommandBuilder()
    .setName('perfil')
    .setDescription('Exibe o perfil de um membro da família')
    .addUserOption(opt =>
      opt
        .setName('membro')
        .setDescription('Membro que deseja visualizar')
        .setRequired(false)
    ),

  async execute(interaction) {
    const membrosObj = lerMembros();
    const membros = Object.values(membrosObj);
    const alvo = interaction.options.getUser('membro') || interaction.user;

    const membro = membros.find(m => m.id === alvo.id);

    if (!membro) {
      return interaction.reply({
        content: '❌ Este usuário não faz parte da família.',
        ephemeral: true
      });
    }

    const perfil = membro.perfil || {};
    const dataEntrada = dayjs(membro.dataEntrada);
    const diasNaFamilia = dayjs().diff(dataEntrada, 'day');

    // ==========================
    // EMBED 1 — IDENTIDADE
    // ==========================
    const embedPerfil = new EmbedBuilder()
      .setTitle(`👤 Perfil — ${membro.nomeDiscord}`)
      .setColor(CORES_CARGO[membro.cargo] || 0x2F3136)
      .addFields(
        {
          name: '👑 Cargo',
          value: membro.cargo,
          inline: true
        },
        {
          name: '📅 Desde',
          value: `${dataEntrada.format('DD/MM/YYYY')} (${diasNaFamilia} dias)`,
          inline: true
        }
      );

    if (membro.departamento) {
      const depLabel = {
        recrutamento: '🤝 Recrutamento',
        suporte: '🛡️ Suporte',
        comunicacao: '📢 Comunicação'
      };

      embedPerfil.addFields({
        name: '🏷️ Departamento',
        value: depLabel[membro.departamento] || '—',
        inline: true
      });
    }

    embedPerfil.addFields(
      {
        name: '🛡️ Status do Perfil',
        value: STATUS_LABEL[perfil.status] || '—',
        inline: true
      },
      {
        name: '📈 Atividade',
        value: ATIVIDADE_LABEL[perfil.atividade] || '—',
        inline: true
      }
    );

    if (perfil.titulo) {
      embedPerfil.addFields({
        name: '🖋️ Título',
        value: `“${perfil.titulo}”`,
        inline: false
      });
    }

    const badges = (perfil.badges || [])
      .map(b => BADGES_EMOJI[b])
      .filter(Boolean)
      .slice(0, 5);

    embedPerfil.addFields({
      name: '🏅 Conquistas',
      value: badges.length ? badges.join(' ') : 'Nenhuma conquista registrada.',
      inline: false
    });

    // ==========================
    // EMBED 2 — COMENTÁRIOS
    // ==========================
    const comentarios = (perfil.comentarios || []).slice(-5).reverse();

    const embedComentarios = new EmbedBuilder()
      .setTitle('💬 Comentários da Comunidade')
      .setColor(0x2F3136);

    if (comentarios.length === 0) {
      embedComentarios.setDescription(
        'Ainda não há comentários neste perfil.'
      );
    } else {
      embedComentarios.setDescription(
        comentarios
          .map(c => `👍 “${c.texto}” — <@${c.autorId}>`)
          .join('\n')
      );
    }

    // ==========================
    // RESPOSTA FINAL
    // ==========================
    await interaction.reply({
      embeds: [embedPerfil, embedComentarios]
    });
  }
};
