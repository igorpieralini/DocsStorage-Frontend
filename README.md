# 🎨 DocsStorage Frontend

Interface moderna em Angular com autenticação OAuth (Google/Microsoft) e design system customizado.

## 🚀 Tecnologias
- Angular 18+ (Standalone Components)
- TypeScript
- OAuth 2.0 (Google/Microsoft Graph)
- Design System Moderno
- SCSS Animations

## ⚡ Setup
```bash
npm install
ng serve
```
**App:** http://localhost:4200

## 🔐 OAuth Configuration

**Google OAuth:**
1. [Google Console](https://console.cloud.google.com/) → Criar projeto
2. Ativar APIs: Google Drive + Google+ 
3. Credenciais → OAuth Client ID
4. Atualizar em `services/google-auth-new.service.ts`

**Microsoft OAuth:**
1. [Azure Portal](https://portal.azure.com/) → App Registration
2. Permissões: User.Read + Files.ReadWrite.All
3. Atualizar em `services/microsoft-auth-new.service.ts`

## ✨ Funcionalidades
- 🔑 Login tradicional + OAuth social
- 🎨 Interface moderna e responsiva  
- 🔔 Sistema de alertas customizado
- 📤 Upload de documentos
- ☁️ Integração Google Drive/OneDrive
- 👤 Dashboard com estatísticas
- 📱 Design mobile-first

## 🏗️ Estrutura
```
src/app/
├── components/
│   ├── layout/          # Header, Sidebar, Footer
│   ├── login/           # Tela de login OAuth
│   ├── dashboard/       # Dashboard principal
│   └── shared/alert/    # Sistema de alertas
├── services/            # Auth, OAuth, API
└── config/              # Configurações OAuth
```

---
**Frontend App | DocsStorage 2025**

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
