# 🎥 Guía de Configuración de S3 para Videos

## Problema Actual
Los videos MP4 no se pueden reproducir porque las variables de entorno de S3 no están configuradas en Render.

## ✅ Solución Temporal Implementada
- Se agregó manejo de errores para videos que no se pueden cargar
- Se muestran mensajes informativos cuando los videos fallan
- La aplicación sigue funcionando sin videos

## 🔧 Configuración Completa de S3 en Render

### Paso 1: Crear Bucket S3 en AWS
1. Ve a [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Crea un nuevo bucket con nombre único
3. Elige tu región preferida (ej: `us-east-1`)
4. **IMPORTANTE**: Desmarca "Block all public access" (usaremos política de bucket)

### Paso 2: Configurar Política del Bucket
En tu bucket S3, ve a **Permissions** → **Bucket Policy** y agrega:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::TU-BUCKET-NAME/*"
        }
    ]
}
```

### Paso 3: Configurar CORS
En **Permissions** → **CORS**, agrega:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### Paso 4: Crear Usuario IAM
1. Ve a [IAM Console](https://console.aws.amazon.com/iam/)
2. Crea un nuevo usuario
3. Adjunta esta política:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::TU-BUCKET-NAME/*"
        }
    ]
}
```

4. Genera Access Key y Secret Key

### Paso 5: Configurar Variables en Render
Ve a tu dashboard de Render → `lms-server` → **Environment** y agrega:

```
AWS_ACCESS_KEY_ID=tu_access_key_id
AWS_SECRET_ACCESS_KEY=tu_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=tu-bucket-name
```

### Paso 6: Opcional - CloudFront (Recomendado)
Para mejor rendimiento, configura CloudFront:

1. Ve a [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Crea nueva distribución
3. **Origin Domain**: Selecciona tu bucket S3
4. **Viewer Protocol Policy**: Redirect HTTP to HTTPS
5. Agrega la variable en Render:
```
CLOUDFRONT_DOMAIN=tu-distribucion.cloudfront.net
```

## 🧪 Probar la Configuración

### Opción 1: Usar el Script de Prueba
```bash
cd server
npm run test-s3
```

### Opción 2: Probar Manualmente
1. Sube un video desde el panel de administración
2. Verifica que se guarde en S3
3. Intenta reproducir el video

## 🔍 Verificar que Funciona

### En la Consola del Navegador
Deberías ver URLs como:
- ✅ `https://tu-bucket.s3.us-east-1.amazonaws.com/videos/...`
- ✅ `https://tu-distribucion.cloudfront.net/videos/...`

### En Render Logs
Deberías ver:
```
MongoDB Connected!
Attempting to connect to MongoDB...
```

## 🚨 Solución de Problemas

### Error: "S3_BUCKET_NAME env var is not defined"
- Verifica que `S3_BUCKET_NAME` esté configurado en Render

### Error: "Access Denied"
- Verifica las credenciales de AWS
- Asegúrate de que el usuario IAM tenga permisos correctos

### Error: "Video no disponible"
- Verifica que el bucket tenga la política pública
- Confirma que CORS esté configurado

### Videos no se reproducen
- Verifica que las URLs de S3 sean accesibles
- Confirma que el bucket no tenga "Block all public access"

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs de Render
2. Verifica la configuración de AWS
3. Usa el script de prueba: `npm run test-s3`

## 💰 Costos Estimados
- **S3 Storage**: ~$0.023/GB/mes
- **S3 Transfer**: ~$0.09/GB (primeros 1TB)
- **CloudFront**: ~$0.085/GB (transferencia)

Para un curso típico de 10GB: ~$1-2/mes 