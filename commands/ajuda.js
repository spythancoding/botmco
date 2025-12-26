const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ajuda')
    .setDescription('Guia rápido para membros da Família MoChavãO'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x8b0000) // identidade MoChavãO
      .setTitle('🧭 Ajuda — Família MoChavãO')
      .setDescription(
        'Bem-vindo à **Família MoChavãO**.\n\n' +
        'Este guia rápido explica **como a família funciona**, ' +
        'onde você pode interagir e o que é esperado de cada membro.'
      )

      // ======================
      // QUEM SOMOS
      // ======================
      .addFields(
        {
          name: '🩸 Quem Somos',
          value:
            'Somos uma família organizada, baseada em **disciplina, respeito e hierarquia**.\n' +
            'Aqui, atitudes individuais refletem diretamente na imagem do grupo.'
        },

        // ======================
        // ONDE FALAR
        // ======================
        {
          name: '💬 Onde Interagir',
          value:
            '• Utilize apenas os canais liberados para membros\n' +
            '• Evite flood, spam ou mensagens fora de contexto\n' +
            '• Em calls, mantenha postura e respeito'
        },

        // ======================
        // INSCRIÇÃO / TESTE
        // ======================
        {
          name: '📝 Inscrição & Teste',
          value:
            '• Inscrições são feitas **exclusivamente pelo site**\n' +
            '• Após aprovação, você entra em **período de teste**\n' +
            '• Atividade, postura e comprometimento são avaliados'
        },

        // ======================
        // REGRAS
        // ======================
        {
          name: '📜 Regras',
          value:
            '• Leia atentamente o canal de regras\n' +
            '• O desconhecimento das regras não evita punições\n' +
            '• Respeito é obrigatório em qualquer situação'
        },

        // ======================
        // DÚVIDAS
        // ======================
        {
          name: '❓ Dúvidas ou Problemas',
          value:
            '• Procure um membro da liderança **no privado**\n' +
            '• Evite expor problemas em chat público\n' +
            '• Sempre mantenha uma postura respeitosa'
        },

        // ======================
        // FINAL
        // ======================
        {
          name: '⚠️ Importante',
          value:
            'A família valoriza **compromisso, disciplina e respeito**.\n' +
            'Se tiver dúvidas, pergunte. Se errar, aprenda.\n\n' +
            '**Boa sorte e seja bem-vindo.**'
        }
      )
      .setFooter({
        text: 'Família MoChavãO • União, respeito e hierarquia'
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
