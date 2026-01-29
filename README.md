# 🎨 DocsStorage Frontend

<div align="center">

![Angular](https://img.shields.io/badge/Angular-18-red?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![OAuth](https://img.shields.io/badge/OAuth-2.0-green)
![Responsive](https://img.shields.io/badge/Design-Responsive-purple)

A modern, responsive document management interface with OAuth integration and cloud storage support.

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Configuration](#-configuration)
- [Project Structure](#-project-structure)
- [Developer](#-developer)

---

## ✨ Features

- 🔐 **Multi-Auth System**: Traditional login + Google OAuth
- 📁 **Document Management**: Upload, organize, and manage files and folders
- ☁️ **Cloud Integration**: 
  - Google Drive file browsing
- 🎨 **Modern UI/UX**:
  - Clean, intuitive interface
  - Responsive design (mobile-first)
  - Custom alert system
  - Smooth animations
- 📊 **Dashboard**: Real-time statistics and storage usage
- 👤 **User Profile**: Account management and settings
- 🌓 **Theme Support**: Light/Dark mode ready
- 🔔 **Notifications**: Custom toast-style alerts
- 📱 **Mobile Responsive**: Optimized for all devices
- 🚀 **Standalone Components**: Angular 18 modern architecture

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Angular** | 18+ | Frontend framework |
| **TypeScript** | 5.0+ | Programming language |
| **RxJS** | 7.8+ | Reactive programming |
| **Angular Router** | 18+ | Navigation |
| **HttpClient** | 18+ | HTTP requests |
| **FormsModule** | 18+ | Form handling |
| **CommonModule** | 18+ | Common directives |
| **OAuth 2.0** | - | Authentication flow |
| **SCSS** | - | Styling |

### Key Libraries

- `@angular/core` - Core Angular framework
- `@angular/common` - Common Angular utilities
- `@angular/router` - Application routing
- `@angular/forms` - Form management
- `rxjs` - Reactive extensions

---

## 🏗️ Architecture

### Component Structure

```
src/app/
├── components/
│   ├── layout/                   
│   │   ├── header/               
│   │   ├── sidebar/              
│   │   ├── footer/            
│   │   └── main-layout/         
│   ├── dashboard/               
│   ├── documents/             
│   ├── google-drive/            
│   ├── login/                 
│   ├── register/          
│   ├── profile/         
│   ├── settings/             
│   ├── oauth-callback/         
│   └── shared/
│       └── alert/             
├── services/         
│   ├── auth.service.ts      
│   ├── files.service.ts         
│   ├── google-drive.service.ts 
│   ├── google-auth-simple.service.ts 
│   ├── alert.service.ts        
│   ├── jwt.interceptor.ts      
│   └── error.interceptor.ts     
├── guards/
│   └── auth.guard.ts            
├── config/
│   └── oauth.config.ts    
├── environments/
│   └── environment.ts        
├── app.config.ts            
├── app.routes.ts             
└── app.component.ts       
```

### Design Patterns

- **Standalone Components**: Modern Angular architecture without NgModules
- **Service Layer**: Business logic separated from components
- **Interceptors**: Global HTTP request/response handling
- **Route Guards**: Authentication and authorization
- **Reactive Programming**: RxJS for async operations
- **Dependency Injection**: Angular's DI system

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Angular CLI 18+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/DocsStorage.git
   cd DocsStorage/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure OAuth (Optional)**
   
   Edit `src/app/config/oauth.config.ts`:
   ```typescript
   export const OAuthConfig = {
     google: {
       clientId: 'your-google-client-id.apps.googleusercontent.com',
       redirectUri: 'http://localhost:4200/oauth/callback'
     }
   };
   ```

4. **Start development server**
   ```bash
   ng serve
   ```

   Application will start at: **http://localhost:4200**

5. **Build for production**
   ```bash
   ng build --configuration production
   ```

   Output will be in `dist/` folder.

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/              
│   ├── assets/              
│   ├── environments/         
│   ├── index.html    
│   ├── main.ts             
│   ├── styles.css      
│   └── server.ts         
├── public/                
├── angular.json         
├── tsconfig.json   
├── package.json             
└── README.md               
```

---

## 🎨 Features Showcase

### Authentication
- ✅ Traditional email/password login
- ✅ Google OAuth 2.0
- ✅ JWT token management
- ✅ Auto-refresh tokens
- ✅ Secure route guards

### Document Management
- ✅ Upload files (drag & drop support)
- ✅ Download files
- ✅ Delete files
- ✅ Create folders
- ✅ Navigate folder structure
- ✅ Move files between folders
- ✅ Storage quota tracking

### Cloud Integration
- ✅ Browse Google Drive files
- ✅ Navigate Drive folders
- ✅ Open files in Google Drive
- ✅ Real-time sync

### User Interface
- ✅ Responsive design
- ✅ Custom alert system
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth animations
- ✅ Breadcrumb navigation
- ✅ Context menus

---

## 🧪 Development

### Development Server

```bash
ng serve
# or with live reload
ng serve --open
```

### Build

```bash
# Development build
ng build

# Production build
ng build --configuration production
```

### Code Quality

```bash
# Lint code
ng lint

# Format code (if prettier is configured)
npm run format
```

### Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

---

## 📦 Deployment

### Static Hosting

1. Build the application:
   ```bash
   ng build --configuration production
   ```

2. Deploy `dist/` folder to:
   - **Netlify**: Drag and drop `dist/` folder
   - **Vercel**: Connect GitHub repository
   - **GitHub Pages**: Use `angular-cli-ghpages`
   - **Firebase**: Use Firebase hosting CLI

### Server Deployment

For server-side rendering (SSR):

```bash
# Build SSR app
ng build --configuration production
ng run app:server:production

# Run server
node dist/server/main.js
```

---

## 🚀 Performance

- **Lazy Loading**: Routes are lazy-loaded for faster initial load
- **Standalone Components**: Smaller bundle sizes
- **Tree Shaking**: Unused code is eliminated
- **AOT Compilation**: Ahead-of-time compilation in production
- **Code Splitting**: Automatic code splitting by route

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

**Developed with by Igor Pieralini**

---

<div align="center">
  <sub>Built with Angular, TypeScript, and lots of ☕</sub>
</div>