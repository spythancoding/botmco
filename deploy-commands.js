require('dotenv').config();

const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

// 🔁 Função recursiva para ler subpastas
function loadCommands(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith('.js')) {
      const command = require(fullPath);

      if (command.data) {
        commands.push(command.data.toJSON());
      }
    }
  }
}

// 📂 Inicia leitura em /commands
loadCommands(path.join(__dirname, 'commands'));

const rest = new REST({ version: '10' });
rest.setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('⏳ Registrando comandos (com subpastas)...');

    await rest.put(
      Routes.applicationGuildCommands(
        '1449610187433443418', // CLIENT ID
        '1313568206132220034'  // GUILD ID
      ),
      { body: commands }
    );

    console.log('✅ Comandos registrados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
})();
