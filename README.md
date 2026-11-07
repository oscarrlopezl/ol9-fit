# OL9 fit — Progressive High-Performance Training PWA

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live_Online-000000?style=flat-square&logo=vercel)](https://ol9-fit.vercel.app)
[![Production URL](https://img.shields.io/badge/Production-ol9--fit.vercel.app-bdf200?style=flat-square)](https://ol9-fit.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![GloryFit Ready](https://img.shields.io/badge/GloryFit-Bluetooth_Ready-eab308?style=flat-square)](https://ol9-fit.vercel.app)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_Ready-bdf200?style=flat-square)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-slate?style=flat-square)](LICENSE)

> 🚀 **App en Producción Activa 24/7:**  
> **[https://ol9-fit.vercel.app](https://ol9-fit.vercel.app)**

**OL9 fit** es una aplicación web progresiva (PWA) de entrenamiento físico personal de alto rendimiento, optimizada para dispositivos móviles (mobile-first), con una estética industrial oscura (`#0f172a`, verde lima neón, dorado ámbar y gris acero), conectada al ecosistema de smartwatches **GloryFit** y desplegada en producción en Vercel con integración continua.

---

## ⚡ Módulos Principales

### 1. 🏃 Trote Matutino Progresivo (Tipo Strava)
- **Telemetría en Vivo:** Ritmo actual e instantáneo (min/km), distancia recorrida (km), cronómetro (HH:MM:SS), cadencia estimada (spm) y calorías quemadas.
- **Geolocalización en Tiempo Real:** Seguimiento GPS vía `navigator.geolocation.watchPosition` con cálculo exacto de distancia mediante la fórmula de Haversine.
- **Modo Simulación:** Alternador integrado para probar rutas y telemetría en interiores o escritorio.
- **Mapa Leaflet Interactivo:** Modo oscuro CartoDB con polilínea de ruta en vivo y marcador de pulso.
- **Resumen Post-Carrera:** Splits kilómetro a kilómetro, gráfica de altimetría y elevación acumulada, exportación en formato `.GPX` y `.JSON`.
- **Integraciones Externas:**
  - `stravaService.ts`: Conexión OAuth 2.0 y subida directa de actividades a la API de Strava.
  - `wearableSyncService.ts`: Conectividad Web Bluetooth (`0x180D`) para sensores de frecuencia cardíaca y lector de archivos `.GPX`, `.TCX` y `.FIT` de smartwatches chinos (DaFit, FitCloudPro, GloryFit, Zepp, VeryFit).

### 2. 🔥 Reto Progresivo Abdominales 30 Días (Fase 1)
- **Nivel 1 (Días 1 al 10 - Base):** Crunch clásico, Elevación de piernas en suelo, Plancha estática, Toques de talón.
- **Nivel 2 (Días 11 al 20 - Resistencia):** Escaladores (Mountain Climbers), Plancha lateral, Tijeras de piernas, Bicicleta abdominal.
- **Nivel 3 (Días 21 al 30 - Fuerza y Estabilidad):** Navajas (V-Ups), Giros rusos, Plancha con toque de hombros, Hollow Body hold.
- **Reproductor Interactivo a Pantalla Completa:**
  - Temporizadores de 30s de trabajo y 15s de descanso.
  - Web Audio API nativa con pitidos de conteo (3-2-1) y campana de cambio de serie.
  - Ilustraciones vectoriales SVG con postura adecuada y áreas musculares diana iluminadas en brillo neón.
  - Controles: Pausar, retroceder, reiniciar y saltar.

### 3. 🏋️ Gimnasio Vespertino + Motor FST-7
- **División Semanal Completa:**
  - **Lunes (Empuje):** Press plano, Press inclinado con mancuernas, Press militar sentado, Elevaciones laterales, Fondos, Extensión de tríceps en polea + *Remate FST-7 opcional*.
  - **Martes (Tirón):** Jalón al pecho, Remo con barra, Remo en polea baja, Face Pull, Curl de bíceps con barra Z, Curl martillo + *Remate FST-7 opcional*.
  - **Miércoles (Pierna - Cuádriceps y Gemelos):** Sentadilla trasera, Prensa 45°, Zancadas caminando, Extensión de cuádriceps, Gemelos de pie + *Remate FST-7 opcional*.
  - **Jueves (Torso Completo):** Press inclinado, Remo con barra, Pec Deck, Dominadas/Jalón cerrado, Press militar de pie, Superserie Curl Z + Press francés + *Remate FST-7 opcional*.
  - **Viernes (Pierna - Isquios, Glúteo y Cadena Posterior):** Hip Thrust, Peso muerto rumano, Prensa pies altos, Curl femoral, Gemelos sentado + *Remate FST-7 opcional*.
  - **Sábado y Domingo:** Descanso y Recuperación Activa.
- **Motor FST-7 Integrado:**
  - Interruptor "Activar Modo FST-7" en cualquier ejercicio.
  - Visualizador de 7 series: `[ Serie X / 7 ]`.
  - Botón "Serie Completada" activa automáticamente una cuenta regresiva de 30 segundos con alertas sonoras.
  - Modo Isometría con indicación visual de contracción y estiramiento fascial del músculo diana durante el descanso.
  - Animación de confeti y registro automático de volumen en IndexedDB.

### 4. 📊 Dashboard General y Calendario
- Calendario interactivo mensual con marcadores de actividades (Trote, Abdomen, Gimnasio).
- Contador de racha de días activos consecutivos.
- Volumen total acumulado levantado (kg) y kilómetros recorridos.
- Checklist de hábitos diarios persistido en IndexedDB.

---

## 🛠️ Tecnologías Utilizadas
- **Frontend:** React 18 + TypeScript + Vite.
- **Estilos:** Tailwind CSS con paleta industrial oscura y efectos de brillo neón.
- **Iconos:** Lucide Icons.
- **Mapas:** Leaflet + OpenStreetMap (CartoDB Dark Matter).
- **Audio:** Web Audio API nativa para efectos de sonido sin dependencias de archivos externos.
- **Almacenamiento Local:** IndexedDB con fallback automático a LocalStorage.
- **Animaciones:** Canvas Confetti y transiciones Tailwind.

---

## 🚀 Instalación y Ejecución Local

1. Clona el repositorio:
```bash
git clone https://github.com/oscarrlopezl/ol9-fit.git
cd ol9-fit
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Compilar para producción:
```bash
npm run build
npm run preview
```

---

## 📱 Instalación PWA en Dispositivos Móviles
1. Abre la aplicación en tu navegador móvil (Chrome, Safari, Brave o Edge).
2. Toca el menú de opciones (o el botón compartir en iOS).
3. Selecciona **"Agregar a la pantalla de inicio"** o **"Instalar aplicación"**.
4. ¡Listo! Accede a OL9 fit como una aplicación nativa con funcionamiento offline completo.

---

## 📄 Licencia
Distribuido bajo la Licencia MIT.
