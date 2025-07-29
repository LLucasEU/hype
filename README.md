# HYPE Staking Dashboard

Application Angular pour visualiser les informations de staking HYPE sur Hyperliquid.

## 🚀 Déploiement sur GitHub Pages

### Configuration automatique (recommandé)

1. **Activer GitHub Pages** dans les paramètres du repository :
   - Allez dans Settings > Pages
   - Source : "GitHub Actions"

2. **Pousser le code** sur la branche `main` :
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Le déploiement se fera automatiquement** via GitHub Actions

### Déploiement manuel

Si vous préférez déployer manuellement :

```bash
cd client
npm run deploy
```

## 🛠️ Développement local

```bash
cd client
npm install --legacy-peer-deps
npm start
```

L'application sera disponible sur `http://localhost:4200`

## 📦 Build de production

```bash
cd client
npm run build:gh-pages
```

## 🔧 Configuration

- **Base href** : `/hype/` (pour GitHub Pages)
- **Angular version** : 15.2.x
- **Node.js** : 18.x recommandé

## 📱 Fonctionnalités

- ✅ Connexion wallet
- ✅ Affichage du solde staké
- ✅ Historique des rewards
- ✅ Prix HYPE en temps réel
- ✅ Graphique des rewards
- ✅ Interface responsive 