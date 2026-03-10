# 🚌 Busetas App — Reporte de Daños

App móvil y web (React Native + Expo) para registrar reportes de daños de equipos,
conectada a Google Sheets como base de datos en tiempo real.

---

## 📦 Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales reales

# 3. Ejecutar
npx expo start          # Escanear QR con Expo Go
npx expo start --android
npx expo start --ios
npx expo start --web
```

---

## ⚙️ Configuración de Google Cloud (paso a paso)

### 1. Crear proyecto en Google Cloud Console
1. Ir a https://console.cloud.google.com
2. Click en "Nuevo proyecto" → Nombrar (ej: `busetas-reportes`)
3. Seleccionar el proyecto creado

### 2. Habilitar APIs
1. Ir a **APIs y servicios → Biblioteca**
2. Buscar y habilitar **Google Sheets API**
3. Buscar y habilitar **Google Drive API**

### 3. Crear Service Account
1. Ir a **APIs y servicios → Credenciales**
2. Click **Crear credenciales → Cuenta de servicio**
3. Nombre: `busetas-service` → Crear
4. Rol: **Editor** → Continuar → Listo
5. Click en la cuenta creada → **Claves → Agregar clave → JSON**
6. Se descargará un archivo `credentials.json`

### 4. Extraer credenciales del JSON descargado
Del archivo JSON, copiar:
- `client_email` → valor para `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → valor para `GOOGLE_PRIVATE_KEY`

### 5. Preparar el Google Sheet
1. Crear un nuevo Google Sheet en https://sheets.google.com
2. En la fila 1, ingresar estas cabeceras exactamente:
   ```
   Fecha | Hora | Población | N° Buseta | Placa | Link Foto | Componente | Descripción | Preliminar | Responsable | Observaciones | Timestamp Envío
   ```
3. **Compartir el Sheet** con el email del Service Account (del paso 3)
   → Click en "Compartir" → pegar el email → Rol: Editor
4. Copiar el ID del Sheet desde la URL:
   `https://docs.google.com/spreadsheets/d/**ESTE_ES_EL_ID**/edit`

### 6. Crear carpeta en Google Drive para fotos
1. Crear carpeta en https://drive.google.com
2. Compartirla con el email del Service Account (Editor)
3. Copiar el ID de la carpeta desde la URL:
   `https://drive.google.com/drive/folders/**ESTE_ES_EL_ID**`

---

## 🔑 Variables de entorno (.env)

```env
GOOGLE_SHEET_ID=tu_sheet_id_aqui
GOOGLE_SERVICE_ACCOUNT_EMAIL=nombre@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_LLAVE_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=tu_folder_id_aqui
NOMBRE_EMPRESA=Tu Empresa S.A.S.
```

> ⚠️ **IMPORTANTE**: Nunca subir el archivo `.env` al repositorio.
> Agregar `.env` a `.gitignore`.

---

## 🔐 Nota sobre autenticación en producción

La firma JWT con RS256 requiere criptografía que no está disponible de forma nativa
en React Native (navegador y móvil). Para un entorno de producción seguro, se recomienda:

### Opción A: Backend intermedio (recomendado)
- Crear una Cloud Function o endpoint en tu servidor
- El backend firma el JWT y devuelve el access_token
- La app solo llama a tu backend (no expone la llave privada)

### Opción B: Google Apps Script como proxy
- Crear un Web App en Google Apps Script con permiso de Sheet
- La app llama al Web App que escribe directamente en el Sheet
- Sin necesidad de credenciales en la app

### Opción C: Tokens de acceso temporales (solo desarrollo)
- Desde Google Cloud Console → Credenciales → OAuth playground
- Generar token manualmente y usarlo durante pruebas

---

## 📁 Estructura del proyecto

```
/app
  index.jsx          → Pantalla historial + FAB
  nuevo-reporte.jsx  → Formulario de reporte
  config.js          → Variables de configuración
/components
  FormField.jsx      → Input reutilizable con validación
  PhotoPicker.jsx    → Selector de foto (cámara/galería)
  ReporteCard.jsx    → Card para historial
/services
  googleSheets.js    → appendRow(), getRows(), uploadPhoto()
  offline.js         → saveLocal(), getPending(), syncPending()
/hooks
  useForm.js         → Estado y validación del formulario
  useSync.js         → Sincronización offline + conectividad
```

---

## 🗂 Formato del Google Sheet

| Fecha | Hora | Población | N° Buseta | Placa | Link Foto | Componente | Descripción | Preliminar | Responsable | Observaciones | Timestamp Envío |
|-------|------|-----------|-----------|-------|-----------|------------|-------------|------------|-------------|---------------|-----------------|

---

## 🌐 Despliegue web (Expo Web)

```bash
npx expo export --platform web
# Subir la carpeta /dist a Netlify, Vercel, o Firebase Hosting
```

---

## 📱 Generar APK (Android)

```bash
npx eas build --platform android --profile preview
```

> Requiere cuenta en https://expo.dev y `eas-cli` instalado (`npm i -g eas-cli`)
