// =====================================================
// 🔧 IMPORTS & CONFIG
// =====================================================
const {
  Client,
  Collection,
  GatewayIntentBits,
  Events
} = require('discord.js');

const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { lerMembros } = require('./utils/dataManager');
const { setClient } = require('./utils/notifier');


const {
  processarExpiracaoAdvertencias
} = require('./utils/advertenciasManager');

const {
  getBlacklistsTemporariasExpiradas,
  removerBlacklist
} = require('./utils/blacklistManager');

// =====================================================
// 🔧 CONFIGURAÇÕES FIXAS
// =====================================================

const GUILD_ID = '1313568206132220034';
const {
  processarBlacklistsTemporariasExpiradas
} = require('./utils/dataManager');



const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';
const BLACKLIST_PERM_ROLE_ID = '1451676459545661602';
const CARGO_MEMBRO = '1439059436789305395';

// =====================================================
// 🤖 DISCORD CLIENT
// =====================================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration
  ]
});
setClient(client);



// =====================================================
// 📦 COMMAND HANDLER
// =====================================================
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Comando carregado: /${command.data.name}`);
  }
}

// =====================================================
// 📡 EVENT HANDLER
// =====================================================
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (!event.name || typeof event.execute !== 'function') continue;
  client.on(event.name, (...args) => event.execute(...args));
  console.log(`📡 Evento carregado: ${event.name}`);
}

// =====================================================
// ✅ READY + JOBS AUTOMÁTICOS
// =====================================================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);

  setInterval(async () => {
    try {
      // ⏳ Advertências
      const membros = lerMembros();
      const resultadoAdv = processarExpiracaoAdvertencias(membros);
      if (resultadoAdv.alteracoes > 0) {
        console.log(`⏳ Advertências expiradas: ${resultadoAdv.alteracoes}`);
      }

      // 🚫 Blacklist temporária (PADRÃO NOVO)
const expiradas = processarBlacklistsTemporariasExpiradas();
if (!expiradas.length) return;

const guild = await client.guilds.fetch(GUILD_ID);

for (const registro of expiradas) {
  const membro = await guild.members.fetch(registro.id).catch(() => null);

  if (membro) {
    await membro.roles.remove([
      BLACKLIST_TEMP_ROLE_ID,
      BLACKLIST_PERM_ROLE_ID
    ]);

    if (!membro.roles.cache.has(CARGO_MEMBRO)) {
      await membro.roles.add(CARGO_MEMBRO);
    }
  }
}


    } catch (err) {
      console.error('❌ Erro no JOB automático:', err);
    }
  }, 1000 * 60 * 5);
});

// =====================================================
// 📥 INTERACTIONS
// =====================================================
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (command) await command.execute(interaction);
    }
  } catch (err) {
    console.error('❌ Erro na interaction:', err);
  }
});

// =====================================================
// 🌐 API HTTP
// =====================================================
const app = express();
const PORT = 3333;

const cors = require('cors');

app.use(cors({
  origin: '*',
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const inscricaoRoutes = require('./api/inscricao.routes');
app.use('/api', inscricaoRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 API de inscrições ativa na porta ${PORT}`);
});

// =====================================================
// 🔐 LOGIN
// =====================================================
client.login(process.env.DISCORD_TOKEN);
