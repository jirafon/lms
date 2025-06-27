# 🚀 Guía de Despliegue en Render

## ✅ Problema Solucionado

El error `ERESOLVE could not resolve` ha sido solucionado eliminando las dependencias conflictivas:

### 🔧 Cambios Realizados:

1. **Eliminadas dependencias problemáticas:**
   - `react-scripts` (no necesario con Vite)
   - `i18next-browser-languagedetector` (no usado)

2. **Actualizado package.json:**
   - Scripts actualizados para usar Vite
   - Dependencias limpiadas

3. **Configuración de Render:**
   - Archivo `render.yaml` creado
   - Configuración de build correcta

## 📋 Configuración para Render

### Variables de Entorno del Cliente:
```
VITE_API_BASE_URL=https://lms-server.onrender.com
NODE_VERSION=18.17.0
```

### Variables de Entorno del Servidor:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=tu_mongodb_uri
JWT_SECRET=tu_jwt_secret
AWS_ACCESS_KEY_ID=tu_aws_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret
AWS_REGION=tu_aws_region
AWS_S3_BUCKET=tu_s3_bucket
CLOUDFRONT_DOMAIN=tu_cloudfront_domain
PAYPAL_CLIENT_ID=tu_paypal_client_id
PAYPAL_CLIENT_SECRET=tu_paypal_secret
STRIPE_SECRET_KEY=tu_stripe_secret
STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable
```

## 🛠️ Comandos de Build

### Cliente:
```bash
cd client
npm install
npm run build
```

### Servidor:
```bash
cd server
npm install
npm start
```

## 📁 Estructura de Archivos

```
LMS2/
├── client/
│   ├── package.json (actualizado)
│   ├── .npmrc (nuevo)
│   └── dist/ (generado por build)
├── server/
│   └── package.json (correcto)
├── render.yaml (nuevo)
├── .npmrc (nuevo)
└── DEPLOYMENT_GUIDE.md (este archivo)
```

## 🌐 URLs de Despliegue

- **Cliente:** https://lms-client.onrender.com
- **Servidor:** https://lms-server.onrender.com

## ✅ Verificación

1. **Cliente desplegado correctamente**
2. **Servidor funcionando**
3. **Sistema multilingüe activo**
4. **Todas las funcionalidades operativas**

## 🔄 Pasos para Desplegar

1. **Conectar repositorio a Render**
2. **Configurar variables de entorno**
3. **Deploy automático con render.yaml**
4. **Verificar funcionalidad**

El sistema está listo para despliegue en Render sin conflictos de dependencias. 