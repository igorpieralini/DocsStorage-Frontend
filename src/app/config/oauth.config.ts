// Configurações OAuth para Google e Microsoft
// IMPORTANTE: Substitua pelos seus próprios Client IDs

export const OAuthConfig = {
  google: {
    clientId: '1015085655063-2odhes7689glov1scjdt0g4lo1hlm837.apps.googleusercontent.com',
    scopes: 'profile email https://www.googleapis.com/auth/drive.file',
    redirectUri: 'http://localhost:4200/oauth/callback'
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

3. Para produção, atualize os redirectUri com sua URL real
*/