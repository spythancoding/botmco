// =====================================================
// 🔧 IMPORTS & CONFIG
// =====================================================
const {
  Client,
  Collection,
  GatewayIntentBits,
  InteractionType,
  Events
} = require('discord.js');

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
  criarInscricao
} = require('./utils/dataManager');

// 🔧 CONFIGURAÇÕES FIXAS
const CANAL_ADM = '1440166535602770032';

// =====================================================
// 🤖 CLIENT
// =====================================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});

// =====================================================
// 📦 COMMAND HANDLER
// =====================================================
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file =>
  file.endsWith('.js')
);

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Comando carregado: /${command.data.name}`);
  }
}

// =====================================================
// 📡 EVENT HANDLER (JOIN / LEAVE / BAN)
// =====================================================
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file =>
  file.endsWith('.js')
);

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));

  if (!event.name || typeof event.execute !== 'function') {
    console.warn(`⚠️ Evento inválido ignorado: ${file}`);
    continue;
  }

  client.on(event.name, (...args) => event.execute(...args));
  console.log(`📡 Evento carregado: ${event.name}`);
}

// =====================================================
// ✅ READY
// =====================================================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);
});

// =====================================================
// 📥 INTERACTIONS (SEM ALTERAÇÃO)
// =====================================================
client.on(Events.InteractionCreate, async interaction => {
  try {

    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction);
      return;
    }

    // Modal de inscrição
    if (
      interaction.type === InteractionType.ModalSubmit &&
      interaction.customId === 'modal_inscricao'
    ) {
      const dados = {
        userId: interaction.user.id,
        nick: interaction.fields.getTextInputValue('nick'),
        nivel: interaction.fields.getTextInputValue('nivel'),
        idade: interaction.fields.getTextInputValue('idade'),
        liderOrg: interaction.fields.getTextInputValue('lider_org'),
        indicacao: interaction.fields.getTextInputValue('indicacao') || 'Nenhuma'
      };

      criarInscricao(dados.userId, dados);

      const canalAdm = interaction.guild.channels.cache.get(CANAL_ADM);
      if (canalAdm) {
        const { EmbedBuilder } = require('discord.js');

        const embed = new EmbedBuilder()
          .setColor('#f1c40f')
          .setTitle('📥 Nova Inscrição')
          .addFields(
            { name: '👤 Usuário', value: `<@${dados.userId}>`, inline: true },
            { name: '🎮 Nick', value: dados.nick, inline: true }
          )
          .setTimestamp();

        canalAdm.send({ embeds: [embed] });
      }

      return interaction.reply({
        content: '✅ Inscrição enviada com sucesso!',
        ephemeral: true
      });
    }

  } catch (err) {
    console.error('❌ Erro na interaction:', err);
  }
});

// =====================================================
// 🔐 LOGIN
// =====================================================
client.login(process.env.DISCORD_TOKEN);
