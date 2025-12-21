const { EmbedBuilder } = require('discord.js');

const regrasEmbed = new EmbedBuilder()
  .setTitle('📜 Código de Conduta — Família MoChavãO')
  .setColor(0x6c3483) // roxo corporativo
  .setThumbnail('https://i.imgur.com/PDJRqCR.png')
  .setDescription(
    '@everyone\n\n' +
    '**Bem-vindo à Família MoChavãO.**\n\n' +
    'Somos uma comunidade organizada, focada em **respeito, disciplina e crescimento coletivo**. ' +
    'Ao permanecer neste servidor, você concorda integralmente com as regras abaixo:\n\n' +
    '━━━━━━━━━━━━━━━━━━━━'
  )

  .addFields(
    {
      name: '🤝 Conduta e Respeito',
      value:
        '• Trate todos os membros com respeito\n' +
        '• Ofensas, provocações fora do RP e desrespeito não serão tolerados\n' +
        '• Conflitos devem ser resolvidos de forma madura ou via staff'
    },
    {
      name: '🗣️ Linguagem e Comunicação',
      value:
        '• Linguagem ofensiva, tóxica ou abusiva é proibida\n' +
        '• Evite discussões desnecessárias\n' +
        '• Mantenha um ambiente saudável para todos'
    },
    {
      name: '🚫 Spam e Divulgação',
      value:
        '• Proibido spam, flood ou mensagens repetitivas\n' +
        '• Divulgação de outros servidores, links ou streams sem autorização é proibida'
    },
    {
      name: '🔞 Conteúdo',
      value:
        '• Proibido conteúdo NSFW, ilegal ou impróprio\n' +
        '• Nomes, fotos e status ofensivos não são permitidos'
    },
    {
      name: '🎧 Canais de Voz',
      value:
        '• Entre com respeito nos canais\n' +
        '• Evite interrupções e ruídos desnecessários\n' +
        '• Siga as orientações dos membros presentes'
    },
    {
      name: '🛡️ Autoridade da Staff',
      value:
        '• As decisões da administração devem ser respeitadas\n' +
        '• A staff pode aplicar mute, kick ou ban sem aviso prévio\n' +
        '• Caso se sinta injustiçado, entre em contato por DM com um administrador'
    },
    {
      name: '📌 Aviso Importante',
      value:
        '• O desconhecimento das regras não isenta punições\n' +
        '• As regras podem ser alteradas a qualquer momento\n' +
        '• É responsabilidade do membro manter-se atualizado'
    }
  )

  .setFooter({
    text: 'Família MoChavãO © 2025 • Organização, respeito e compromisso'
  })
  .setTimestamp();

module.exports = { regrasEmbed };
