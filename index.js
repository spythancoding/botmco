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
const express = require('express');


const fs = require('fs');
const path = require('path');
require('dotenv').config();

const {
  lerMembros,
  criarInscricao
} = require('./utils/dataManager');

const {
  processarExpiracaoAdvertencias
} = require('./utils/advertenciasManager');

const {
  getBlacklistsTemporariasExpiradas,
  removerBlacklist
} = require('./utils/blacklistManager');

// 🔧 CONFIGURAÇÕES FIXAS
const CANAL_ADM = '1440166535602770032';
const GUILD_ID = '1313568206132220034';

// Cargos
const BLACKLIST_TEMP_ROLE_ID = '1451323733129302128';
const BLACKLIST_PERM_ROLE_ID = '1451676459545661602';
const CARGO_MEMBRO = '1439059436789305395';

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
// ✅ READY + JOB AUTOMÁTICO
// =====================================================
client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot online como ${client.user.tag}`);

  // =====================================================
  // 🔁 JOB AUTOMÁTICO (DISCIPLINA)
  // =====================================================
  setInterval(async () => {
    try {
      // ===============================
      // ⏳ EXPIRAÇÃO DE ADVERTÊNCIAS
      // ===============================
      const membros = lerMembros();
      const resultadoAdv = processarExpiracaoAdvertencias(membros);

      if (resultadoAdv.alteracoes > 0) {
        console.log(
          `⏳ Advertências expiradas automaticamente: ${resultadoAdv.alteracoes}`
        );
      }

      // ===============================
      // 🚫 BLACKLIST TEMP EXPIRADA
      // ===============================
      const expiradas = getBlacklistsTemporariasExpiradas();

      if (expiradas.length === 0) return;

      const guild = await client.guilds.fetch(GUILD_ID);

      for (const registro of expiradas) {
        const userId = registro.userId;

        // Remove do blacklist.json
        removerBlacklist({
          userId,
          removidoPor: 'SISTEMA (EXPIRAÇÃO AUTOMÁTICA)'
        });

        try {
          const membro = await guild.members.fetch(userId).catch(() => null);

          if (membro) {
            // Remove cargos de blacklist
            await membro.roles.remove([
              BLACKLIST_TEMP_ROLE_ID,
              BLACKLIST_PERM_ROLE_ID
            ]);

            // Aplica cargo de membro comum
            if (!membro.roles.cache.has(CARGO_MEMBRO)) {
              await membro.roles.add(CARGO_MEMBRO);
            }
          }

          console.log(
            `🔓 Blacklist temporária expirada automaticamente: ${userId}`
          );

        } catch (err) {
          console.warn(
            `⚠️ Erro ao restaurar cargos do usuário ${userId}:`,
            err.message
          );
        }
      }

    } catch (err) {
      console.error('❌ Erro no JOB automático:', err);
    }
  }, 1000 * 60 * 5); // ⏱️ a cada 5 minutos
});

// =====================================================
// 📥 INTERACTIONS (SEM ALTERAÇÃO FUNCIONAL)
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
// 🌐 API HTTP (INSCRIÇÕES)
// =====================================================
const app = express();
const PORT = 3333;

app.use(express.json());

// Rotas
const inscricaoRoutes = require('./api/inscricao.routes');
app.use('/api', inscricaoRoutes);

app.listen(PORT, () => {
  console.log(`🌐 API de inscrições ativa na porta ${PORT}`);
});

// =====================================================
// 🔐 LOGIN
// =====================================================
client.login(process.env.DISCORD_TOKEN);
