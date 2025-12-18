const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');
const fs = require('fs');

let mainWindow;
let serverProcess;
let PORT = 3000;

// Trouver un port libre
async function findFreePort(startPort = 3000, endPort = 3010) {
  for (let port = startPort; port <= endPort; port++) {
    const available = await new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, '127.0.0.1', () => {
        server.close(() => resolve(true));
      });
      server.on('error', () => resolve(false));
    });
    if (available) return port;
  }
  throw new Error('Aucun port disponible');
}

// Afficher une erreur
function showErrorWindow(message, details = '') {
  const errorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true, contextIsolation: false },
  });
  
  const safeDetails = details.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  
  errorWindow.loadURL(`data:text/html,
    <html>
      <head><style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 30px; background: #1a1a2e; color: white; }
        h1 { color: #e94560; margin-bottom: 20px; }
        pre { background: #16213e; padding: 15px; border-radius: 8px; overflow: auto; font-size: 11px; max-height: 400px; white-space: pre-wrap; word-break: break-all; }
        button { background: #0f3460; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 15px; margin-right: 10px; }
        button:hover { background: #e94560; }
      </style></head>
      <body>
        <h1>Erreur de demarrage</h1>
        <p>${message}</p>
        ${details ? `<pre>${safeDetails}</pre>` : ''}
        <button onclick="location.reload()">Reessayer</button>
        <button onclick="window.close()">Fermer</button>
      </body>
    </html>
  `);
}

async function startServer() {
  const isDev = !app.isPackaged;
  
  if (isDev) {
    console.log('Mode développement - utilisation du serveur Next.js existant sur port 3000');
    return Promise.resolve();
  }

  try {
    PORT = await findFreePort();
    console.log(`Port sélectionné: ${PORT}`);
  } catch (e) {
    throw new Error('Aucun port disponible (3000-3010)');
  }

  return new Promise((resolve, reject) => {
    // Chemin vers le serveur standalone Next.js
    const resourcesPath = process.resourcesPath;
    const appPath = app.isPackaged ? path.join(resourcesPath, 'app') : process.cwd();
    const serverPath = path.join(appPath, 'server.js');
    const serverCwd = appPath;
    
    // Chemin de la base de données dans les données utilisateur
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'database.db');
    
    // Copier le schéma Prisma si nécessaire
    const prismaSchemaSource = path.join(resourcesPath, 'prisma', 'schema.prisma');
    const prismaDir = path.join(userDataPath, 'prisma');
    const prismaSchemaTarget = path.join(prismaDir, 'schema.prisma');
    
    if (!fs.existsSync(prismaDir)) {
      fs.mkdirSync(prismaDir, { recursive: true });
    }
    if (fs.existsSync(prismaSchemaSource) && !fs.existsSync(prismaSchemaTarget)) {
      fs.copyFileSync(prismaSchemaSource, prismaSchemaTarget);
    }
    
    // Initialiser la base de données si elle n'existe pas en copiant le template
    if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
      console.log('Initialisation de la base de données...');
      try {
        const templateDbPath = path.join(appPath, 'prisma', 'database.template.db');
        
        if (fs.existsSync(templateDbPath)) {
          // Copier le template
          fs.copyFileSync(templateDbPath, dbPath);
          console.log('Base de données initialisée depuis le template');
        } else {
          console.warn('Template de base de données non trouvé:', templateDbPath);
          // Créer un fichier vide en dernier recours
          fs.writeFileSync(dbPath, '');
          console.log('Base de données vide créée - les tables seront créées au premier démarrage');
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données:', error);
      }
    }
    
    console.log('========== CONFIGURATION ==========');
    console.log('Démarrage du serveur:', serverPath);
    console.log('Répertoire:', serverCwd);
    console.log('Database:', dbPath);
    console.log('Resources:', resourcesPath);
    console.log('UserData:', userDataPath);
    
    // Vérifier que le fichier serveur existe
    if (!fs.existsSync(serverPath)) {
      reject(new Error(`Serveur non trouvé: ${serverPath}`));
      return;
    }
    
    // IMPORTANT: Générer un secret aléatoire pour NextAuth
    const crypto = require('crypto');
    const nextAuthSecret = crypto.randomBytes(32).toString('hex');
    
    // Variables d'environnement pour le serveur Next.js
    const serverEnv = {
      ...process.env,
      NODE_ENV: 'production',
      PORT: PORT.toString(),
      HOSTNAME: 'localhost',
      DATABASE_URL: `file:${dbPath}`,
      NEXTAUTH_URL: `http://localhost:${PORT}`,
      NEXTAUTH_SECRET: nextAuthSecret,
      AUTH_TRUST_HOST: 'true', // IMPORTANT: Autoriser localhost en production
      ELECTRON_RUN_AS_NODE: '1',
      NEXT_TELEMETRY_DISABLED: '1',
    };

    console.log('========== VARIABLES ENV ==========');
    console.log('NODE_ENV:', serverEnv.NODE_ENV);
    console.log('PORT:', serverEnv.PORT);
    console.log('DATABASE_URL:', serverEnv.DATABASE_URL);
    console.log('NEXTAUTH_URL:', serverEnv.NEXTAUTH_URL);
    console.log('NEXTAUTH_SECRET:', nextAuthSecret.substring(0, 10) + '...');
    console.log('====================================');

    // Utiliser Electron comme Node.js pour exécuter le serveur
    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: serverCwd,
      shell: false,
      stdio: 'pipe',
      env: serverEnv,
    });

    let serverOutput = '';
    const timeout = setTimeout(() => {
      console.error('TIMEOUT - Logs du serveur:');
      console.error(serverOutput);
      reject(new Error(`Timeout: le serveur n'a pas démarré.\n\nLogs:\n${serverOutput}`));
    }, 30000);

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      console.log('[SERVER]', output);
      if (output.includes('Listening') || output.includes('Ready') || output.includes('ready') || output.includes('started')) {
        clearTimeout(timeout);
        setTimeout(resolve, 1000);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      serverOutput += error;
      console.error('[SERVER ERROR]', error);
    });

    serverProcess.on('error', (error) => {
      clearTimeout(timeout);
      console.error('Erreur spawn:', error);
      reject(new Error(`Erreur serveur: ${error.message}\n\nLogs:\n${serverOutput}`));
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        clearTimeout(timeout);
        console.error('Serveur arrêté avec code:', code);
        console.error('Logs:', serverOutput);
        reject(new Error(`Serveur arrêté (code ${code})\n\nLogs:\n${serverOutput}`));
      }
    });
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, 'build', 'icon.ico'),
    show: false,
    backgroundColor: '#0f172a',
  });

  // Supprimer le menu par défaut en production
  if (app.isPackaged) {
    mainWindow.setMenu(null);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Ouvrir les DevTools automatiquement pour le debug
    mainWindow.webContents.openDevTools();
  });

  // Raccourci F12 pour ouvrir les DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
    }
  });

  const isDev = !app.isPackaged;
  const url = isDev ? 'http://localhost:3000' : `http://localhost:${PORT}`;
  
  console.log('Chargement:', url);
  
  // Charger avec retry
  const loadWithRetry = (retries = 5) => {
    mainWindow.loadURL(url).catch((err) => {
      console.error('Erreur de chargement:', err);
      if (retries > 0) {
        console.log(`Retry... (${retries} restants)`);
        setTimeout(() => loadWithRetry(retries - 1), 1000);
      } else {
        showErrorWindow('Impossible de charger l\'application', err.message);
      }
    });
  };
  
  loadWithRetry();

  // Logger les erreurs de la page
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('[RENDERER]', message);
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await startServer();
    createWindow();
  } catch (error) {
    console.error('Erreur:', error);
    showErrorWindow(error.message);
  }
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

