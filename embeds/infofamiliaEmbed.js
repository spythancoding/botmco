const { EmbedBuilder } = require('discord.js');

const infoFamiliaEmbed = new EmbedBuilder()
  .setColor(0x8b0000) // vermelho escuro (autoridade)
  .setTitle('ℹ️ Família MoChavãO — Informações Gerais')
  .setDescription(
    'A **Família MoChavãO** é uma organização estruturada, fundada sobre **disciplina, respeito e compromisso coletivo**.\n\n' +
    'Não somos um servidor social comum. Somos uma família que valoriza **postura, organização e lealdade**.\n\n' +
    '**Nossa proposta é simples:**\n' +
    '• **Qualidade** acima de quantidade\n' +
    '• **Ordem** acima de bagunça\n' +
    '• **Respeito** acima de ego\n\n' +
    'Cada membro representa a família **dentro e fora do servidor**.\n' +
    'Atitudes individuais refletem diretamente na imagem do grupo.'
  )
  .addFields(
    {
      name: '🩸 O Que Valorizamos',
      value:
        '• Postura madura e respeitosa\n' +
        '• Compromisso com a família\n' +
        '• Disciplina e respeito à hierarquia\n' +
        '• Evolução coletiva'
    },
    {
      name: '🚫 O Que Não Somos',
      value:
        '• Não somos um servidor aberto ou casual\n' +
        '• Não somos espaço para conflitos desnecessários\n' +
        '• Não somos ambiente de desordem ou falta de respeito'
    },
    {
      name: '🔔 Informações Importantes',
      value:
        '**Servidor Base:** Brasil Play Games (BPG)\n\n' +
        '🎧 **Discord BPG:**\n' +
        'https://discord.gg/bpgrpg\n\n' +
        '🎮 **IP do Servidor:**\n' +
        '• bpg.brasilplaygames.com.br:7777\n' +
        '• 104.234.189.170:7777\n\n' +
        '🔗 **Convite Oficial da Família MoChavãO:**\n' +
        'https://discord.gg/JfaKQkcudy'
    }
  )
  .setFooter({
    text: 'Família MoChavãO • Organização, respeito e compromisso'
  })
  .setTimestamp();

module.exports = { infoFamiliaEmbed };
