# 🧾 Factus Front - Sistema de Facturación Electrónica Angular

> Sistema moderno de facturación electrónica desarrollado en Angular con integración completa a la API de Factus para cumplimiento normativo DIAN en Colombia.

[![Angular](https://img.shields.io/badge/Angular-19.2+-red.svg)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.7+-orange.svg)](https://firebase.google.com/)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.5+-green.svg)](https://www.chartjs.org/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)

## 🌟 Características Principales

### 📊 Facturación Electrónica Avanzada
- Integración completa con API Factus
- Facturación electrónica certificada por DIAN
- Validación automática de documentos tributarios
- Generación de códigos QR y códigos de barras
- Gestión de rangos de numeración

### 🔐 Autenticación OAuth2
- Sistema de autenticación seguro con tokens
- Manejo automático de refresh tokens
- Sesiones persistentes con expiración controlada
- Renovación automática de credenciales

### 📈 Dashboard Analítico
- Métricas en tiempo real con Chart.js
- Reportes de facturación detallados
- Indicadores de cumplimiento tributario
- Gráficos interactivos de ventas

### 🎨 Interfaz Moderna
- Diseño Material Design con Angular Material
- Componentes responsive para todos los dispositivos
- Alertas elegantes con SweetAlert2
- Experiencia de usuario intuitiva

## 🚀 Tecnologías Utilizadas

### Frontend Core
- **Angular 19.2+** - Framework principal
- **TypeScript 5.7+** - Lenguaje de programación
- **Angular Material 19.2+** - Componentes UI
- **Sass** - Preprocesador de estilos

### Librerías Especializadas
- **Firebase 11.7+** - Backend as a Service
- **Chart.js 4.5+** - Visualización de datos
- **SweetAlert2** - Notificaciones elegantes
- **RxJS** - Programación reactiva

### API Integration
- **Factus API** - Facturación electrónica DIAN
- **OAuth2** - Autenticación segura
- **RESTful Services** - Comunicación con backend

## LOGIN
<img width="1360" height="636" alt="Captura de pantalla 2025-08-14 152155" src="https://github.com/user-attachments/assets/32cc8f26-d352-4748-9da6-0addb1d59003" />

## 🛠 Instalación y Configuración

### Prerrequisitos

- **Node.js 18+** con npm
- **Angular CLI 19.2+**
- **Cuenta Factus** con credenciales API
- **Navegador moderno** (Chrome, Firefox, Safari)

### Pasos de Instalación

1. 📥 **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/factus-front.git
   cd factus-front
   ```

2. 📦 **Instalar dependencias**
   ```bash
   npm install
   ```

3. ⚙️ **Configurar variables de entorno**
   
   Crea el archivo `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     factusApi: {
       baseUrl: 'https://sandbox-api.factus.co',
       clientId: 'tu_client_id',
       clientSecret: 'tu_client_secret',
       email: 'tu_email@empresa.com',
       password: 'tu_password'
     },
     firebase: {
       apiKey: "tu_firebase_api_key",
       authDomain: "tu-proyecto.firebaseapp.com",
       projectId: "tu-proyecto",
       // ... otras configuraciones
     }
   };
   ```

4. 🔧 **Configurar Postman Collection**
   
   Importa las variables en Postman Environment (Sandbox):
   ```json
   {
     "urlapi": "https://sandbox-api.factus.co",
     "email": "tu_email@empresa.com",
     "password": "tu_password",
     "client_id": "tu_client_id",
     "client_secret": "tu_client_secret"
   }
   ```

5. 🚀 **Ejecutar aplicación**
   ```bash
   # Desarrollo
   npm start
   
   # Producción
   npm run build:prod
   ```

## 📋 Flujo de Integración Factus

### 📊 1. Endpoints Principales

| Endpoint | Método | Descripción | Persistente |
|----------|--------|-------------|------------|
| `/auth/token` | POST | Autenticación OAuth2 | ❌ |
| `/facturas` | POST/GET | Gestión de facturas | ❌ |
| `/municipios` | GET | Catálogo de municipios | ✅* |
| `/paises` | GET | Catálogo de países | ✅* |
| `/rangos-numeracion` | GET | Rangos disponibles | ❌ |
| `/tributos` | GET | Tipos de impuestos | ✅* |
| `/unidades-medida` | GET | Unidades de medida | ✅* |

*Endpoints recomendados para persistencia local*

## 🎯 Componentes Principales

### 🏠 Dashboard
- Métricas de facturación en tiempo real
- Gráficos de ventas con Chart.js
- Indicadores de estado DIAN
- Resumen de actividad diaria

### 📋 Gestión de Facturas
- Creación de facturas electrónicas
- Validación automática DIAN
- Historial de documentos tributarios
- Descarga de PDFs y XMLs

### 👥 Administración de Clientes
- Base de datos de clientes
- Validación de documentos de identidad
- Historial de facturación
- Integración con datos tributarios

### 📦 Catálogo de Productos
- Gestión de inventario
- Configuración de impuestos por producto
- Unidades de medida estándar
- Códigos de barras y referencias

## 🔧 Arquitectura del Proyecto

```
src/
├── 🏗️ app/
│   ├── 🔐 auth/               # Módulo de autenticación
│   │   ├── services/          # Servicios OAuth2
│   │   └── guards/            # Protección de rutas
│   ├── 📊 dashboard/          # Panel principal
│   │   ├── components/        # Componentes del dashboard
│   │   └── charts/            # Gráficos Chart.js
│   ├── 🧾 facturas/           # Módulo de facturación
│   │   ├── crear/             # Creación de facturas
│   │   ├── validar/           # Validación DIAN
│   │   └── historial/         # Historial de documentos
│   ├── 👥 clientes/           # Gestión de clientes
│   ├── 📦 productos/          # Catálogo de productos
│   ├── ⚙️ configuracion/      # Configuraciones del sistema
│   └── 🛠️ shared/            # Componentes compartidos
├── 🌍 environments/           # Variables de entorno
├── 🎨 assets/                 # Recursos estáticos
└── 📱 styles/                 # Estilos globales SCSS
```

## ⚡ Funcionalidades AJAX y Reactivas

### 🔄 Características Reactivas
- 🔍 Búsqueda en tiempo real de clientes y productos
- 📊 Actualización automática de dashboards
- 🔔 Notificaciones push con Firebase
- 💾 Auto-guardado de formularios
- 🔄 Sincronización automática con Factus API

### 📱 Responsive Design
- 📱 Optimizado para móviles y tablets
- 🖥️ Dashboard adaptativo para desktop
- 🎯 Componentes Material Design
- ⚡ Carga rápida con lazy loading

## 🚀 Comandos NPM Disponibles

```bash
# Desarrollo
npm start                    # Servidor de desarrollo
npm run watch               # Build con watch mode

# Producción
npm run build:prod          # Build optimizado para producción
npm run vercel-build        # Build para despliegue en Vercel

# Testing
npm test                    # Ejecutar pruebas unitarias

# Utilidades
npm run ng                  # Angular CLI
```

## 📊 Dashboard y Métricas

### 🎯 KPIs Principales
- ✅ Facturas creadas hoy
- ✅ Facturas validadas por DIAN
- ✅ Ingresos del período
- ✅ Estados de documentos tributarios
- ✅ Tiempo promedio de validación

### 📈 Gráficos Interactivos
- 📊 Ventas por período (Chart.js)
- 🥧 Distribución por tipos de documento
- 📈 Tendencias de facturación
- 🎯 Cumplimiento tributario

## 🔐 Seguridad y Cumplimiento

### 🛡️ Medidas de Seguridad
- 🔒 Autenticación OAuth2 con Factus
- 🛡️ Tokens JWT con expiración automática
- 🔄 Renovación automática de credenciales
- 🚫 Protección de rutas con Guards
- 🔐 Validación de datos en cliente y servidor

### 📋 Cumplimiento DIAN
- ✅ Facturación electrónica certificada
- ✅ Códigos QR y numeración oficial
- ✅ Formatos XML estándar UBL 2.1
- ✅ Validación automática de documentos
- ✅ Trazabilidad completa de operaciones

## 🎉 Roadmap 2025

### 🔮 Próximas Características
- [ ] 📱 PWA para uso offline
- [ ] 🤖 Integración con WhatsApp Business
- [ ] 📊 Business Intelligence avanzado
- [ ] 🌐 Multi-empresa y multi-usuario
- [ ] 🔄 Sincronización con ERPs externos
- [ ] 📧 Envío automático por email
- [ ] 💳 Integración con medios de pago

## 📞 Soporte Factus

Para obtener tus credenciales de API Factus:

🆘 **Centro de Soporte**: [Solicitar Credenciales](https://factus.co/soporte)
📧 **Email**: soporte@factus.co
📱 **WhatsApp**: +57 300 123 4567

### 📚 Documentación Adicional
- 📖 [Documentación API Factus](https://docs.factus.co)
- 🚀 [Postman Collection](https://documenter.getpostman.com/factus)
- 🎯 [Guía de Integración DIAN](https://factus.co/guias)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Desarrolladores

**Equipo de Desarrollo**
- 🌐 GitHub: [@tu-usuario](https://github.com/tu-usuario)
- 💼 LinkedIn: [Tu Perfil](https://www.linkedin.com/in/tu-perfil/)
- 📧 Email: contacto@tuempresa.com

---

<div align="center">

### 💡 ¿Te gusta el proyecto?

Si este sistema te ha sido útil para tu facturación electrónica, ¡considera darle una ⭐ en GitHub!

[⭐ Star en GitHub](https://github.com/tu-usuario/factus-front) | [📥 Descargar](https://github.com/tu-usuario/factus-front/releases)

</div>

---

<div align="center">
  <strong>Desarrollado con ❤️ para el cumplimiento tributario colombiano</strong><br>
  <em>Factus Front - Facturación Electrónica Angular con Certificación DIAN</em>
</div>

---

## 🏷️ Tags

`#Angular` `#TypeScript` `#FacturacionElectronica` `#DIAN` `#Colombia` `#OAuth2` `#Material Design` `#Firebase` `#ChartJS` `#TributarioColombiano`
