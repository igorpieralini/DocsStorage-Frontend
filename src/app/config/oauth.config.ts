// Configurações OAuth para Google e Microsoft
// IMPORTANTE: Substitua pelos seus próprios Client IDs

export const OAuthConfig = {
  google: {
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    scopes: 'profile email https://www.googleapis.com/auth/drive.file',
    redirectUri: window.location.origin
  },
  
  microsoft: {
    clientId: 'YOUR_MICROSOFT_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/common',
    scopes: ['openid', 'profile', 'User.Read', 'Files.ReadWrite.All'],
    redirectUri: window.location.origin
  }
};

// Instruções para configurar OAuth:
/*
1. GOOGLE OAUTH:
   - Vá para https://console.cloud.google.com/
   - Crie um novo projeto ou selecione um existente
   - Ative a Google Drive API e Google+ API
   - Vá em "Credenciais" > "Criar Credenciais" > "ID do cliente OAuth 2.0"
   - Configure o JavaScript origins: http://localhost:4200
   - Copie o Client ID e cole acima

2. MICROSOFT OAUTH:
   - Vá para https://portal.azure.com/
   - Registre um novo aplicativo em "Azure Active Directory"
   - Configure as permissões para Microsoft Graph
   - Configure a URL de redirecionamento: http://localhost:4200
   - Copie o Application (client) ID e cole acima

3. Para produção, atualize os redirectUri com sua URL real
*/