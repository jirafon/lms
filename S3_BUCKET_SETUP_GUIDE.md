# 🚨 S3 Bucket Setup Guide - URGENT

## ❌ Problema Actual
Los archivos se suben correctamente a S3 pero **NO se pueden ver** porque el bucket no está configurado para acceso público.

## ✅ Solución Completa

### Paso 1: Configurar Política del Bucket S3

1. Ve a [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Selecciona tu bucket `repoeticpro`
3. Ve a **Permissions** → **Bucket Policy**
4. Haz clic en **Edit** y reemplaza con:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::repoeticpro/*"
        }
    ]
}
```

5. Haz clic en **Save changes**

### Paso 2: Configurar CORS

1. En el mismo bucket, ve a **Permissions** → **CORS**
2. Haz clic en **Edit** y reemplaza con:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```

3. Haz clic en **Save changes**

### Paso 3: Verificar Configuración de Bloqueo Público

1. Ve a **Permissions** → **Block public access**
2. **IMPORTANTE**: Desmarca todas las opciones:
   - ❌ Block all public access
   - ❌ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ❌ Block public access to buckets and objects granted through new public bucket or access point policies
   - ❌ Block public access to buckets and objects granted through any public bucket or access point policies
3. Haz clic en **Save changes**

### Paso 4: Verificar Variables de Entorno en Render

Ve a tu dashboard de Render → `lms-server` → **Environment** y verifica que tengas:

```
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=sa-east-1
S3_BUCKET_NAME=repoeticpro
```

### Paso 5: Probar Acceso Directo

Una vez configurado, prueba acceder directamente a una URL de S3:

```
https://repoeticpro.s3.sa-east-1.amazonaws.com/user_photos/1751784337549-WhatsApp%20Image%202025-06-25%20at%2000.27.40%20(3).jpeg
```

Si puedes ver la imagen, la configuración está correcta.

## 🔧 Comandos de Verificación

### Verificar configuración actual:
```bash
# En tu terminal local
curl -I "https://repoeticpro.s3.sa-east-1.amazonaws.com/user_photos/1751784337549-WhatsApp%20Image%202025-06-25%20at%2000.27.40%20(3).jpeg"
```

### Respuesta esperada:
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Length: [tamaño]
```

## 🚨 Si sigues sin ver los archivos:

1. **Espera 5-10 minutos** - Los cambios de política pueden tardar
2. **Limpia el caché del navegador** (Ctrl+F5)
3. **Verifica en modo incógnito**
4. **Revisa la consola del navegador** para errores CORS

## 📞 Soporte

Si después de seguir estos pasos sigues sin ver los archivos, contacta con el administrador del sistema.

---

**Nota**: Esta configuración hace que todos los archivos en el bucket sean públicos. Para mayor seguridad, considera usar CloudFront con restricciones de origen. 