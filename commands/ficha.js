const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerMembros } = require('../utils/dataManager');

const cargosOrdem = [
  { nome: 'Dono', emoji: '👑', cor: '#f1c40f', peso: 6 },
  { nome: 'Sub Dono', emoji: '🟣', cor: '#9b59b6', peso: 5 },
  { nome: 'Diretor', emoji: '🎯', cor: '#e67e22', peso: 4 },
  { nome: 'Suporte', emoji: '🛠️', cor: '#3498db', peso: 3 },
  { nome: 'Membro +', emoji: '⭐', cor: '#2ecc71', peso: 2 },
  { nome: 'Membro', emoji: '👤', cor: '#95a5a6', peso: 1 }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ficha')
    .setDescription('Mostra a ficha completa de um membro da família')
    .addUserOption(opt =>
      opt.setName('usuario')
        .setDescription('Membro da família')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('usuario');
    const membros = lerMembros();
    const membro = membros[user.id];

    if (!membro) {
      return interaction.reply({
        content: '❌ Este usuário não está registrado na família.',
        ephemeral: true
      });
    }

    const cargoInfo =
      cargosOrdem.find(c => c.nome === membro.cargo) ||
      cargosOrdem[cargosOrdem.length - 1];

    // ================= DATAS =================
    const dataEntrada = membro.dataEntrada
      ? new Date(membro.dataEntrada).toLocaleDateString('pt-BR')
      : 'Não informado';

    const dataSaida = membro.dataSaida
      ? new Date(membro.dataSaida).toLocaleDateString('pt-BR')
      : '—';

    // ================= ADVERTÊNCIAS =================
    const advertenciasAtivas =
      membro.advertencias?.filter(a => a.status === 'ativa') || [];

    const totalAdvAtivas = advertenciasAtivas.length;

    const ultimaAdv =
      advertenciasAtivas.length > 0
        ? advertenciasAtivas[advertenciasAtivas.length - 1]
        : null;

    // ================= BLACKLIST =================
    let statusBlacklist = '🟢 Regular';
    let detalheBlacklist = 'Nenhuma punição ativa';

    if (membro.blacklist?.ativa) {
      if (membro.blacklist.tipo === 'perm') {
        statusBlacklist = '⛔ Blacklist Permanente';
        detalheBlacklist = membro.blacklist.motivo || 'Motivo não informado';
      } else {
        statusBlacklist = '🚫 Blacklist Temporária';
        detalheBlacklist =
          `Até ${new Date(membro.blacklist.fim).toLocaleDateString('pt-BR')}\n` +
          `Motivo: ${membro.blacklist.motivo || 'Não informado'}`;
      }
    }

    // ================= EMBED =================
    const embed = new EmbedBuilder()
      .setColor(cargoInfo.cor)
      .setTitle(`${cargoInfo.emoji} Ficha • ${membro.cargo}`)
      .setThumbnail(user.displayAvatarURL())
      .addFields(
        { name: '👤 Usuário', value: `<@${user.id}>`, inline: true },
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '🎖️ Cargo', value: `${cargoInfo.emoji} **${membro.cargo}**`, inline: true },

        { name: '💬 Nick Discord', value: membro.nomeDiscord || 'Não informado', inline: true },
        { name: '🎮 Nick In-Game', value: membro.nickGame || 'Não informado', inline: true },
        { name: '🧍 Nome Real', value: membro.nomeReal || 'Não informado', inline: true },

        { name: '🎂 Idade', value: membro.idade || 'Não informado', inline: true },
        { name: '📱 WhatsApp', value: membro.whatsapp || 'Não informado', inline: true },
        { name: '📅 Entrada', value: dataEntrada, inline: true },

        {
          name: '⚠️ Advertências Ativas',
          value:
            totalAdvAtivas === 0
              ? '🟢 Nenhuma'
              : `🔴 ${totalAdvAtivas} / 3`,
          inline: true
        },

        {
          name: '📄 Última Advertência',
          value:
            ultimaAdv
              ? ultimaAdv.motivo
              : '—',
          inline: false
        },

        {
          name: '🚫 Status Disciplinar',
          value: `${statusBlacklist}\n${detalheBlacklist}`,
          inline: false
        }
      )
      .setFooter({
        text: `Hierarquia MoChavãO • Nível ${cargoInfo.peso}`
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
