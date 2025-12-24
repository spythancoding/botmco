const { EmbedBuilder } = require('discord.js');

const regrasEmbed = new EmbedBuilder()
  .setTitle('📜 Código de Conduta — Família MoChavãO')
  .setColor(0x8b0000) // vermelho escuro (elegante / autoridade)
  .setThumbnail('https://cdn.discordapp.com/attachments/1450348057295061045/1453143385161465987/Gemini_Generated_Image_cajufwcajufwcaju.png?ex=694c60bd&is=694b0f3d&hm=da7ecb523d4046baf31d0dcd7d8e5265698b9f52e0b73f83c24073608a6439d0&') // link direto
  .setDescription(
    '@everyone\n\n' +
    '**Bem-vindo à Família MoChavãO.**\n\n' +
    'A MoChavãO é uma comunidade organizada, pautada em **respeito, disciplina e crescimento coletivo**. ' +
    'Ao permanecer neste servidor, você concorda integralmente com as diretrizes abaixo.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━'
  )
  .addFields(
    {
      name: '🤝 Conduta Geral',
      value:
        '• O respeito é obrigatório entre todos os membros\n' +
        '• Provocações, ofensas ou atitudes tóxicas não serão toleradas\n' +
        '• Conflitos devem ser resolvidos de forma madura ou com auxílio da staff'
    },
    {
      name: '🗣️ Comunicação',
      value:
        '• Linguagem ofensiva, abusiva ou desrespeitosa é proibida\n' +
        '• Evite discussões desnecessárias ou comportamento provocativo\n' +
        '• Preserve sempre um ambiente organizado'
    },
    {
      name: '🚫 Spam & Divulgação',
      value:
        '• Proibido spam, flood ou mensagens repetitivas\n' +
        '• Divulgação de servidores, links ou conteúdos externos somente com autorização'
    },
    {
      name: '🔞 Conteúdo',
      value:
        '• Conteúdo NSFW, ilegal ou impróprio é estritamente proibido\n' +
        '• Nomes, imagens, status ou mensagens ofensivas não são permitidos'
    },
    {
      name: '🎧 Canais de Voz',
      value:
        '• Utilize os canais de voz com respeito\n' +
        '• Evite ruídos, interrupções ou comportamentos invasivos\n' +
        '• Siga sempre as orientações dos membros presentes'
    },
    {
      name: '🛡️ Autoridade & Moderação',
      value:
        '• As decisões da administração devem ser respeitadas\n' +
        '• A staff pode aplicar advertências, mute, kick ou ban quando necessário\n' +
        '• Caso se sinta injustiçado, procure um administrador de forma privada e respeitosa'
    },
    {
      name: '📌 Avisos Importantes',
      value:
        '• O desconhecimento das regras não isenta punições\n' +
        '• As regras podem ser atualizadas a qualquer momento\n' +
        '• É responsabilidade do membro manter-se informado'
    }
  )
  
  .setFooter({
    text: 'Família MoChavãO © 2025 • Organização, respeito e compromisso'
  })
  .setTimestamp();

module.exports = { regrasEmbed };
