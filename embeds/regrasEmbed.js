const { EmbedBuilder } = require('discord.js');

const regrasEmbed = new EmbedBuilder()
  .setTitle('📜 Diretrizes de Entrada — Família MoChavãO')
  .setColor(0x8b0000) // vermelho escuro (autoridade)
  .setThumbnail(
    'https://cdn.discordapp.com/attachments/1450348057295061045/1453143385161465987/Gemini_Generated_Image_cajufwcajufwcaju.png'
  )
  .setDescription(
    '**Bem-vindo à Família MoChavãO.**\n\n' +
    'Este servidor é a base oficial da família MoChavãO no GTA RP. ' +
    'Aqui prezamos por **organização, respeito e compromisso**.\n\n' +
    'Se você está aqui, significa que tem interesse em **fazer parte da família**.\n\n' +
    '━━━━━━━━━━━━━━━━━━━━'
  )
  .addFields(
    {
      name: '🎯 Sobre a Família',
      value:
        '• Comunidade séria e organizada\n' +
        '• Foco em GTA RP (SAMP)\n' +
        '• Hierarquia bem definida\n' +
        '• Ambiente disciplinado e respeitoso'
    },
    {
      name: '📌 Regras Básicas',
      value:
        '• Respeito é obrigatório\n' +
        '• Não serão toleradas provocações, ofensas ou desrespeito\n' +
        '• Qualquer tentativa de burlar regras resultará em punição\n' +
        '• Decisões da administração são soberanas'
    },
    {
      name: '📝 Como Fazer Parte',
      value:
        '1️⃣ Utilize o comando **/inscrever**\n' +
        '2️⃣ Preencha o formulário com atenção\n' +
        '3️⃣ Aguarde a análise da administração\n' +
        '4️⃣ Se aprovado, você será integrado à família'
    },
    {
      name: '⚠️ Avisos Importantes',
      value:
        '• O desconhecimento das regras não isenta punições\n' +
        '• Informações falsas na inscrição resultam em reprovação\n' +
        '• As regras podem ser alteradas sem aviso prévio'
    }
  )
  .setFooter({
    text: 'Família MoChavãO © 2025 • Organização, respeito e compromisso'
  })
  .setTimestamp();

module.exports = { regrasEmbed };
