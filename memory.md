# MEMORY.md - OL9 fit (High Performance Fitness PWA)

## 1. Visión General del Proyecto
- **Nombre Oficial y Marca:** `OL9 fit`
- **Tipo de Aplicación:** Progressive Web Application (PWA) de alto rendimiento, mobile-first, diseñada para entrenamiento personal progresivo.
- **Estética Visual:** Industrial oscura:
  - Fondo primario: `#0f172a` (slate-900) y `#090d16` (slate-950).
  - Acentos de alto impacto: Verde lima neón (`#bdf200` / `#ccff00`) y dorado metálico/ámbar (`#eab308` / `#f59e0b`).
  - Acero y bordes: `#334155` y `#1e293b`.
  - Tipografía: Industrial bold técnica (JetBrains Mono / Chakra Petch / Inter).

---

## 2. Arquitectura de Software y Carpetas
```
ol9-fit/
├── public/
│   ├── favicon.ico / icon.svg  # Logo industrial vectorial con hexágono y remaches
│   ├── manifest.json           # Manifiesto PWA standalone
│   └── sw.js                   # Service Worker para almacenamiento en caché offline
├── src/
│   ├── types/
│   │   └── index.ts            # Definiciones TypeScript completas (RunSession, Splits, Gym, Abs, Habits)
│   ├── services/
│   │   ├── dbService.ts        # Persistencia robusta en IndexedDB (runs, gym_logs, abs_days, habits)
│   │   ├── audioService.ts     # Generador de audio nativo con Web Audio API (3-2-1 pitidos, timbres y fanfarria)
│   │   ├── stravaService.ts    # Integración OAuth 2.0 y subida de actividades a Strava API v3
│   │   └── wearableSyncService.ts # Web Bluetooth (0x180D), lector de archivos (.GPX, .TCX, .FIT) y syncWatchData hook
│   ├── data/
│   │   ├── gymSplitData.ts     # División Lunes a Viernes + Modo FST-7 + Descanso fin de semana
│   │   └── absChallengeData.ts # 30 Días organizados en Nivel 1 (Base), Nivel 2 (Resistencia), Nivel 3 (Fuerza)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx          # Cabecera con logo industrial OL9 fit y conectividad
│   │   │   └── NavigationTabs.tsx  # Dock inferior móvil para navegación táctil fluida
│   │   ├── running/
│   │   │   ├── RunningTracker.tsx      # Telemetría en vivo, Leaflet Dark Map, polilínea, controles táctiles y simulación
│   │   │   ├── ElevationPaceChart.tsx  # Gráfica SVG de altimetría y perfil de ritmo
│   │   │   └── PostRunSummaryModal.tsx # Splits km a km, subida a Strava y exportación GPX/JSON
│   │   ├── abs/
│   │   │   ├── AbsChallengeView.tsx    # Cuadrícula 30 días, selector de niveles y barra global de progreso
│   │   │   ├── AbsPlayerModal.tsx      # Reproductor a pantalla completa (30s trabajo / 15s descanso, audio y controles)
│   │   │   └── AbsExerciseSvg.tsx      # 12 ilustraciones vectoriales SVG con postura y músculos diana iluminados
│   │   ├── gym/
│   │   │   ├── GymWorkoutView.tsx      # Selector de días L-D, registro de series, pesos (kg), reps y botón FST-7
│   │   │   └── Fst7EngineModal.tsx     # Motor FST-7: 7 series, descanso de 30s automático, isometría y fanfarria
│   │   ├── dashboard/
│   │   │   └── DashboardView.tsx       # Calendario mensual interactivo, racha activa, volumen total y km acumulados
│   │   └── sync/
│   │       └── SyncCenterModal.tsx     # Conexión Web Bluetooth HR, importador DaFit/Zepp/GloryFit y Strava
│   ├── App.tsx                         # Orquestador principal de vistas
│   ├── main.tsx                        # Punto de entrada React 18
│   └── index.css                       # Directivas Tailwind, animaciones y scrollbars industriales
├── index.html                          # Meta tags PWA, fuentes Google y Leaflet
├── package.json                        # Dependencias de producción y build scripts
├── tailwind.config.js                  # Configuración de temas y colores industriales
└── vite.config.ts                      # Configuración de Vite
```

---

## 3. Detalle de Módulos Implementados

### Módulo 1: Running Tipo Strava (Trote Matutino Progresivo)
- **Telemetría en Vivo:** Ritmo instantáneo y promedio (min/km), distancia recorrida (km), cronómetro de sesión (HH:MM:SS), cadencia estimada (spm) y calorías quemadas (kcal).
- **Geolocalización:** `navigator.geolocation.watchPosition` con cálculo de distancia geodésica mediante fórmula de Haversine. Incluye toggle de "Simulación GPS" para pruebas en interiores.
- **Mapa Interactivo:** Leaflet con teselas en modo oscuro CartoDB Dark Matter, polilínea verde lima dinámicamente actualizada y marcador de pulso en la posición actual.
- **Resumen Post-Carrera:** Tabla de splits por kilómetro (identificando el split más rápido), gráfica SVG de altimetría y elevación acumulada, exportación a archivo `.GPX` y `.JSON`, y botón para publicar en Strava vía API.
- **Conectividad Wearable:** Lector directo de archivos de relojes inteligentes chinos (.GPX, .TCX, .FIT) y conexión Web Bluetooth a bandas de ritmo cardíaco (Heart Rate Service `0x180D`).

### Módulo 2: Abdominales (Reto Progresivo 30 Días - Fase 1)
- **3 Niveles Automáticos:**
  - *Nivel 1 (Días 1-10 - Base):* Crunch clásico, Elevación de piernas, Plancha estática, Toques de talón.
  - *Nivel 2 (Días 11-20 - Resistencia):* Escaladores, Plancha lateral, Tijeras de piernas, Bicicleta abdominal.
  - *Nivel 3 (Días 21-30 - Fuerza y Estabilidad):* Navajas (V-Ups), Giros rusos, Plancha con toque de hombros, Hollow Body hold.
- **Reproductor Interactivo a Pantalla Completa:**
  - Temporizadores sincronizados: 30 segundos de trabajo y 15 segundos de descanso.
  - Efectos de sonido con Web Audio API: Pitidos en cuenta regresiva (3, 2, 1) y campana de cambio de fase.
  - Ilustraciones vectoriales SVG personalizadas para los 12 ejercicios, con áreas musculares activas en brillo neón.
  - Controles completos: Pausar, retroceder, reiniciar, saltar y cierre con persistencia de racha.

### Módulo 3: Gimnasio Vespertino + Motor FST-7
- **División Semanal Completa:**
  - *Lunes:* Empuje (Pecho, Deltoides Anterior/Lateral, Tríceps) + Remate FST-7.
  - *Martes:* Tirón (Espalda completa, Deltoides Posterior, Bíceps) + Remate FST-7 (Pull-over en polea).
  - *Miércoles:* Pierna - Enfoque Cuádriceps y Gemelos + Remate FST-7 (Extensión de cuádriceps).
  - *Jueves:* Torso Completo - Fuerza e Hipertrofia + Remate FST-7.
  - *Viernes:* Pierna - Enfoque Isquios, Glúteo y Cadena Posterior + Remate FST-7 (Curl femoral).
  - *Sábado y Domingo:* Marcados como Descanso y Recuperación Activa.
- **Motor FST-7 y Temporizador Automático:**
  - Interruptor "Activar Modo FST-7" disponible en cada ejercicio.
  - Visualizador de 7 series: `[ SERIE X / 7 ]`.
  - Botón "Serie Completada" dispara automáticamente una **cuenta regresiva de 30 segundos** con progreso circular y sonoro.
  - Pantalla de **Modo Isometría**: Indica la contracción isométrica y estiramiento fascial del músculo diana durante los 30 segundos de descanso.
  - Celebración con confeti al completar la serie 7/7 y guardado automático en IndexedDB.

### Módulo 4: Dashboard General y Calendario
- Calendario interactivo mensual con puntos de colores que indican actividades realizadas (Trote, Abdomen, Gimnasio).
- Selector de fecha con checklist interactivo de hábitos diarios.
- Indicadores en tiempo real: Días en racha activa, volumen total levantado (kg acumulados) y kilómetros totales corridos.

---

## 4. Persistencia Local y Servicios
- **IndexedDB (`dbService.ts`):** Tablas creadas para `runs`, `gym_logs`, `abs_days`, `habits` y `app_state`. Fallback automático a `localStorage`.
- **Audio Sintetizado (`audioService.ts`):** Sin archivos de audio externos; genera frecuencias precisas en tiempo real para máxima rapidez y compatibilidad móvil.
- **Strava Service (`stravaService.ts`):** Configurado para OAuth 2.0 y llamadas `POST /v3/activities`.
- **Wearable Service (`wearableSyncService.ts`):** Compatibilidad con Web Bluetooth y analizador de archivos de relojes deportivos genéricos y de marca china (DaFit, FitCloudPro, GloryFit, Zepp, VeryFit).
