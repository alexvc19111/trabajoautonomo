# Demo CI/CD — Integración de Sistemas y Plataformas

Aplicación React (Vite) que se despliega **automáticamente en GitHub Pages**
cada vez que se hace push a la rama `main`, usando un pipeline de
**GitHub Actions**.

## Tecnologías usadas
- React 19 + Vite (frontend)
- GitHub Actions (pipeline de CI/CD)
- GitHub Pages (hosting del despliegue)

## Estructura del pipeline (`.github/workflows/deploy.yml`)

El pipeline tiene 2 jobs (etapas):

1. **build**
   - Descarga el código (`checkout`)
   - Instala Node.js 20
   - Instala dependencias (`npm ci`)
   - Corre pruebas si existen (`npm run test --if-present`)
   - Compila el proyecto (`npm run build`) → genera la carpeta `dist/`
   - Sube `dist/` como artefacto para Pages

2. **deploy**
   - Toma el artefacto generado por `build`
   - Lo publica en GitHub Pages

Se dispara automáticamente con:
```yaml
on:
  push:
    branches: ["main"]
```

Es decir: **cada push a main = build + test + deploy automático**, sin
intervención manual.

## Cómo poner esto a funcionar desde 0

### 1. Crea el repositorio en GitHub
1. Ve a github.com → New repository
2. Nómbralo, por ejemplo, `my-app` (puede ser el nombre que quieras)
3. NO lo inicialices con README (ya tienes uno)

### 2. Ajusta el nombre del repo en el proyecto
Abre `vite.config.js` y reemplaza:
```js
base: '/my-app/',
```
por:
```js
base: '/trabajoautonomo/',
```

### 3. Sube el proyecto
Desde la carpeta del proyecto:
```bash
git init
git add .
git commit -m "Proyecto inicial con pipeline CI/CD"
git branch -M main
git remote add origin https://github.com/alexvc19111/trabajoautonomo.git
git push -u origin main
```

### 4. Habilita GitHub Pages con GitHub Actions
En tu repo de GitHub:
1. Ve a **Settings → Pages**
2. En "Build and deployment" → **Source**, selecciona: **GitHub Actions**

### 5. Verifica el pipeline
1. Ve a la pestaña **Actions** de tu repositorio
2. Verás el workflow "Build & Deploy a GitHub Pages" ejecutándose
3. Cuando termine (ícono verde ✅), tu sitio estará disponible en:
   `https://github.com/alexvc19111/trabajoautonomo.git`

### 6. Prueba la automatización
Haz cualquier cambio (por ejemplo, edita un texto en `src/App.jsx`),
y luego:
```bash
git add .
git commit -m "Cambio de prueba"
git push
```
Ve de nuevo a la pestaña **Actions**: el pipeline se ejecutará solo,
sin que tengas que hacer nada más. Cuando termine, refresca la página
publicada y verás el cambio reflejado.

## Problemas comunes
- **Página en blanco / 404 en recursos**: revisa que `base` en
  `vite.config.js` coincida exactamente con el nombre del repositorio.
- **El workflow falla en "Deploy"**: asegúrate de haber seleccionado
  "GitHub Actions" como fuente en Settings → Pages (paso 4).
- **No aparece la pestaña "Environments"**: es normal la primera vez;
  aparece después del primer deploy exitoso.
