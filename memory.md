# MEMORY.md - OL9 fit (High Performance Fitness PWA)

## 1. Visión General del Proyecto
- **Nombre Oficial y Marca:** `OL9 fit`
- **Tipo de Aplicación:** Progressive Web Application (PWA) de alto rendimiento, mobile-first, diseñada para entrenamiento personal progresivo.
- **URL de Producción Vercel (Activa 24/7):** [https://ol9-fit.vercel.app](https://ol9-fit.vercel.app)
- **Repositorio GitHub Conectado:** [https://github.com/oscarrlopezl/ol9-fit](https://github.com/oscarrlopezl/ol9-fit) (Despliegue Continuo automatizado en cada `git push`)
- **Ecosistema Wearable Oficial:** Smartwatches con sistema operativo **GloryFit** (Realtek / Linwear chipsets) con soporte para Web Bluetooth y parseo de tracks (.GPX, .TCX, .FIT, .JSON).
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
│   │   └── wearableSyncService.ts # Conector GloryFit Web Bluetooth (0x180D/Linwear), cálculo de zonas HR Z1-Z5 y lectores de archivos
│   ├── data/
│   │   ├── gymSplitData.ts     # División Lunes a Viernes + Modo FST-7 + Descanso fin de semana
│   │   └── absChallengeData.ts # 30 Días organizados en Nivel 1 (Base), Nivel 2 (Resistencia), Nivel 3 (Fuerza)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx          # Cabecera con logo industrial OL9 fit y badge GLORYFIT ACTIVO
│   │   │   └── NavigationTabs.tsx  # Dock inferior móvil para navegación táctil fluida
│   │   ├── running/
│   │   │   ├── RunningTracker.tsx      # Telemetría en vivo, Leaflet Dark Map, polilínea, telemetría GloryFit en HUD
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
│   │       └── SyncCenterModal.tsx     # Módulo GloryFit Bluetooth, Carga Rápida de pantalla, importador GPX/TCX y Strava
│   ├── App.tsx                         # Orquestador principal de vistas
│   ├── main.tsx                        # Punto de entrada React 18
│   └── index.css                       # Directivas Tailwind, animaciones y scrollbars industriales
├── index.html                          # Meta tags PWA, fuentes Google y Leaflet
├── package.json                        # Dependencias de producción y build scripts
├── tailwind.config.js                  # Configuración de temas y colores industriales
└── vite.config.ts                      # Configuración de Vite
```

---

## 3. Integración Especializada con Smartwatch GloryFit

### ¿Por qué GloryFit?
GloryFit es el sistema operativo y ecosistema de aplicaciones más común en relojes deportivos inteligentes económicos y de alto rendimiento (basados en SoCs Realtek RTL8762/8763 y Linwear).

### Capacidades Implementadas para GloryFit:
1. **Web Bluetooth Pairing Especializado:**
   - Escaneo universal (`acceptAllDevices: true`) con filtros GATT para `heart_rate` (`0x180D`), `battery_service` (`0x180F`), `device_information` (`0x180A`) y UUIDs de sincronización Linwear/GloryFit (`0000fee7-0000-1000-8000-00805f9b34fb`).
   - Lectura de frecuencia cardíaca continua (BPM) con discriminación de zonas de esfuerzo (Z1 a Z5).
   - Botón directo de vinculación rápida en la cabecera del mapa durante el trote matutino.
2. **Importador de Entrenamientos GloryFit:**
   - Admite archivos `.GPX`, `.TCX` y `.FIT` exportados directamente desde la aplicación GloryFit móvil (Menú *Deporte > Historial > Compartir Track*).
   - Admite archivos `.JSON` de resumen de sesiones GloryFit.
   - Generación instantánea de mapa con polilínea, elevación y tabla de splits por kilómetro.
3. **Carga Rápida de Pantalla GloryFit:**
   - Formulario optimizado para registrar en 5 segundos los datos visibles en la carátula del reloj al terminar de correr (Kilómetros, Tiempo, Pulso medio y Pasos).

---

## 4. Detalle de los Módulos de Entrenamiento

### Módulo 1: Running Tipo Strava (Trote Matutino Progresivo)
- Telemetría en vivo: Ritmo instantáneo y promedio (min/km), distancia recorrida (km), cronómetro de sesión (HH:MM:SS), cadencia estimada (spm) y calorías quemadas (kcal).
- Geolocalización con cálculo de distancia geodésica mediante fórmula de Haversine y modo simulación para interiores.
- Mapa Leaflet en modo oscuro CartoDB con polilínea verde lima y marcador de pulso.
- Splits por kilómetro con split más rápido destacado y gráfica SVG de altimetría.
- Subida directa a Strava mediante OAuth 2.0 y exportación a `.GPX` / `.JSON`.

### Módulo 2: Abdominales (Reto Progresivo 30 Días - Fase 1)
- 3 bloques de 10 días:
  - *Nivel 1 (Días 1-10 - Base):* Crunch clásico, Elevación de piernas, Plancha estática, Toques de talón.
  - *Nivel 2 (Días 11-20 - Resistencia):* Escaladores, Plancha lateral, Tijeras de piernas, Bicicleta abdominal.
  - *Nivel 3 (Días 21-30 - Fuerza y Estabilidad):* Navajas (V-Ups), Giros rusos, Plancha con toque de hombros, Hollow Body hold.
- Reproductor de 30s trabajo / 15s descanso con Web Audio API (pitidos 3-2-1 y campana de cambio).
- 12 ilustraciones vectoriales SVG biomecánicas con músculos diana iluminados.

### Módulo 3: Gimnasio Vespertino + Motor FST-7
- División de Lunes a Viernes con ejercicios cargados, series, repeticiones recomendadas y registro de cargas en kg.
- Fines de semana marcados como Descanso y Recuperación Activa.
- Motor FST-7 en cada ejercicio: 7 series, descanso automático de 30 segundos, alertas sonoras a los 3 segundos finales, y pantalla de Modo Isometría con contracción fascial.
- Confeti y guardado de tonelaje/volumen levantado en IndexedDB.

### Módulo 4: Dashboard y Calendario
- Calendario interactivo mensual con puntos de colores de actividades diarias (Trote, Abdomen, Gimnasio).
- Contador de racha activa de días consecutivos.
- Volumen total acumulado levantado en kg y kilómetros totales recorridos.
