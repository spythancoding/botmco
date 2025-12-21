const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { lerTeste } = require('../utils/dataManager');
const {
  isFounder,
  isOwner,
  isSubOwner
} = require('../utils/permissions');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('verteste')
    .setDescription('Lista membros que estão em período de teste'),

  async execute(interaction) {
    const member = interaction.member;

    // 🔐 PERMISSÃO
    if (
      !isFounder(member) &&
      !isOwner(member) &&
      !isSubOwner(member)
    ) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }
  
  
  
    const testesObj = lerTeste();

    // 🔒 Garantia de segurança
    const testes = Object.values(testesObj || {});

    if (testes.length === 0) {
      return interaction.reply({
        content: '📭 Não há membros em teste no momento.',       
      });
    }

    const embeds = [];

    testes.forEach((teste, index) => {
      const fimTeste = teste.fimTeste
        ? `<t:${Math.floor(new Date(teste.fimTeste).getTime() / 1000)}:R>`
        : 'Não definido';

      const embed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle(`🧪 Membro em Teste #${index + 1}`)
        .addFields(
          { name: '👤 Usuário', value: `<@${teste.userId}>`, inline: true },
          { name: '🎮 Nick', value: teste.nick || 'Não informado', inline: true },
          { name: '📊 Nível', value: teste.nivel || 'Não informado', inline: true },
          { name: '🎂 Idade', value: teste.idade || 'Não informado', inline: true },
          { name: '📆 Fim do Teste', value: fimTeste, inline: true },
          { name: '👮 Aprovado por', value: teste.aprovadoPor ? `<@${teste.aprovadoPor}>` : 'ADM', inline: true }
        )
        .setFooter({ text: 'Status: Em período de teste' })
        .setTimestamp();

      embeds.push(embed);
    });

    await interaction.reply({
      embeds
      
    });
  }
};
