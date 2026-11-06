import { AbsExercise, AbsChallengeDay } from '../types';

export const ABS_EXERCISES: Record<string, AbsExercise> = {
  // NIVEL 1 - BASE (Días 1-10)
  'crunch-clasico': {
    id: 'crunch-clasico',
    name: 'Crunch clásico',
    targetMuscles: ['Recto Abdominal Superior', 'Faja Abdominal Media'],
    level: 1,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Acuéstate boca arriba con rodillas flexionadas y plantas apoyadas en el suelo.',
      'Coloca las yemas de los dedos tras las orejas sin tirar del cuello.',
      'Eleva las escápulas del suelo contrayendo fuertemente el abdomen.',
      'Exhala al subir y desciende de forma controlada sin apoyar la cabeza del todo.'
    ],
    coachingCue: 'Enfoca la contracción en la boca del estómago. No jales la nuca.',
    svgType: 'crunch'
  },
  'elevacion-piernas': {
    id: 'elevacion-piernas',
    name: 'Elevación de piernas en suelo',
    targetMuscles: ['Recto Abdominal Inferior', 'Psoas Ilíaco'],
    level: 1,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Acuéstate boca arriba con brazos pegados a los costados o manos bajo los glúteos.',
      'Mantén las piernas rectas o con ligera flexión de rodilla.',
      'Eleva ambas piernas hasta un ángulo de 90° respecto al suelo.',
      'Baja lentamente sin permitir que la zona lumbar se arquee o despegue del suelo.'
    ],
    coachingCue: 'Presiona la espalda baja firmemente contra el suelo en todo momento.',
    svgType: 'leg-raise'
  },
  'plancha-estatica': {
    id: 'plancha-estatica',
    name: 'Plancha estática',
    targetMuscles: ['Transverso Abdominal', 'Core Profundo', 'Estabilizadores Espinales'],
    level: 1,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Apóyate sobre los antebrazos y las puntas de los pies.',
      'Los codos deben estar alineados directamente bajo los hombros.',
      'Forma una línea recta impecable desde los tobillos hasta la coronilla.',
      'Activa glúteos y mete el ombligo hacia la columna vertebral.'
    ],
    coachingCue: 'Visualiza que te van a golpear el estómago; mantén la faja abdominal en máxima tensión.',
    svgType: 'plank'
  },
  'toques-talon': {
    id: 'toques-talon',
    name: 'Toques de talón (oblicuos)',
    targetMuscles: ['Oblicuos Externos e Internos', 'Serratos'],
    level: 1,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Acuéstate con rodillas flexionadas y talones a unos 25 cm de los glúteos.',
      'Eleva ligeramente la cabeza y hombros del suelo.',
      'Flexiona el torso lateralmente para tocar el talón derecho con la mano derecha.',
      'Regresa al centro y toca el talón izquierdo en movimiento rítmico y continuo.'
    ],
    coachingCue: 'Siente el pellizco en la cintura en cada lateralización.',
    svgType: 'heel-touches'
  },

  // NIVEL 2 - RESISTENCIA (Días 11-20)
  'escaladores': {
    id: 'escaladores',
    name: 'Escaladores (Mountain Climbers)',
    targetMuscles: ['Core Dinámico', 'Recto Abdominal', 'Cardio-Metabólico'],
    level: 2,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Colócate en posición de flexión con brazos extendidos y cuerpo alineado.',
      'Lleva una rodilla hacia el pecho sin elevar la cadera.',
      'Regresa y alterna inmediatamente con la otra pierna a ritmo ágil.',
      'Mantén los hombros sobre las muñecas y el abdomen acorazado.'
    ],
    coachingCue: 'Mantén la cadera baja. No saltes, desliza las piernas con potencia controlada.',
    svgType: 'climber'
  },
  'plancha-lateral': {
    id: 'plancha-lateral',
    name: 'Plancha lateral (ambos lados)',
    targetMuscles: ['Oblicuo Interno/Externo', 'Cuadrado Lumbar', 'Glúteo Medio'],
    level: 2,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Apóyate de lado sobre un antebrazo con pies apilados o escalonados.',
      'Eleva la pelvis hasta alinear tobillos, caderas y cabeza.',
      'Mantén 15 segundos en tensión máxima y cambia con agilidad al otro lado.',
      'Brazo superior extendido hacia el techo para mayor estabilidad.'
    ],
    coachingCue: 'Empuja la cadera hacia arriba, no dejes que caiga por gravedad.',
    svgType: 'side-plank'
  },
  'tijeras-piernas': {
    id: 'tijeras-piernas',
    name: 'Tijeras de piernas (Flutter Kicks)',
    targetMuscles: ['Abdomen Inferior', 'Flexores de Cadera', 'Transverso'],
    level: 2,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Acuéstate con manos bajo los glúteos para proteger la zona lumbar.',
      'Eleva las piernas a unos 15 cm del suelo con puntas estiradas.',
      'Alterna cruces horizontales o pataleos verticales rápidos y controlados.',
      'Evita que los talones toquen el suelo durante todo el intervalo.'
    ],
    coachingCue: 'Movimiento corto y rápido desde las caderas, no desde las rodillas.',
    svgType: 'scissors'
  },
  'bicicleta-abdominal': {
    id: 'bicicleta-abdominal',
    name: 'Bicicleta abdominal (Bicycle Crunch)',
    targetMuscles: ['Oblicuos', 'Recto Abdominal Completo', 'Coordinación Cruzada'],
    level: 2,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Acuéstate boca arriba con manos rozando las orejas y piernas suspendidas.',
      'Lleva el codo derecho hacia la rodilla izquierda mientras extiendes la pierna derecha.',
      'Gira fluidamente y lleva el codo izquierdo hacia la rodilla derecha.',
      'Realiza el giro desde la caja torácica, no jalando el cuello.'
    ],
    coachingCue: 'Rotación torácica profunda. Mantén los codos abiertos.',
    svgType: 'bicycle'
  },

  // NIVEL 3 - FUERZA Y ESTABILIDAD (Días 21-30)
  'navajas-vups': {
    id: 'navajas-vups',
    name: 'Navajas (V-Ups)',
    targetMuscles: ['Recto Abdominal Total', 'Cadena Flexora Anterior', 'Fuerza Explosiva'],
    level: 3,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Comienza acostado completamente extendido con brazos sobre la cabeza.',
      'En un solo impulso coordinado, eleva simultáneamente el torso y las piernas.',
      'Intenta tocar las puntas de los pies en el punto más alto formando una "V".',
      'Desciende de forma lenta y resistida hasta la posición inicial.'
    ],
    coachingCue: 'Sube con potencia explosiva y desciende con control milimétrico.',
    svgType: 'v-ups'
  },
  'giros-rusos': {
    id: 'giros-rusos',
    name: 'Giros rusos (Russian Twists)',
    targetMuscles: ['Oblicuos Rotacionales', 'Transverso', 'Estabilidad Pélvica'],
    level: 3,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Siéntate con rodillas flexionadas y talones flotando a 10 cm del suelo.',
      'Inclina el torso hacia atrás a 45° manteniendo la espalda recta.',
      'Junta las manos y rota el torso completamente tocando el suelo a cada lado.',
      'Mantén la pelvis estable sin balanceo excesivo de rodillas.'
    ],
    coachingCue: 'Gira los hombros y el pecho, no solo los brazos.',
    svgType: 'russian-twist'
  },
  'plancha-toque-hombros': {
    id: 'plancha-toque-hombros',
    name: 'Plancha con toque de hombros',
    targetMuscles: ['Antirrotación del Core', 'Deltoides', 'Estabilidad Lumbo-Pélvica'],
    level: 3,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Posición de plancha alta con manos bajo los hombros y pies abiertos al ancho de hombros.',
      'Levanta la mano derecha y toca suavemente el hombro izquierdo.',
      'Baja la mano y repite con la mano izquierda tocando el hombro derecho.',
      'Crucial: Las caderas NO deben tambalearse ni rotar en cada toque.'
    ],
    coachingCue: 'Imagina que tienes una taza de café hirviendo en la espalda baja; no la derrames.',
    svgType: 'shoulder-taps'
  },
  'hollow-body': {
    id: 'hollow-body',
    name: 'Hollow Body hold',
    targetMuscles: ['Tensión Isométrica Máxima', 'Transverso Abdominal', 'Gimnasia Olímpica'],
    level: 3,
    durationSeconds: 30,
    restSeconds: 15,
    instructions: [
      'Acuéstate boca arriba con brazos estirados junto a las orejas y piernas juntas.',
      'Presiona la zona lumbar fuertemente contra el piso.',
      'Eleva hombros, brazos y piernas a 15-20 cm del suelo formando una curva tipo "banana".',
      'Sostén la posición respirando superficialmente sin despegar la zona lumbar.'
    ],
    coachingCue: 'Cero espacio entre el suelo y tu espalda baja. Rigidez total de cuerpo.',
    svgType: 'hollow-body'
  }
};

export const LEVEL_1_EXERCISE_IDS = [
  'crunch-clasico',
  'elevacion-piernas',
  'plancha-estatica',
  'toques-talon'
];

export const LEVEL_2_EXERCISE_IDS = [
  'escaladores',
  'plancha-lateral',
  'tijeras-piernas',
  'bicicleta-abdominal'
];

export const LEVEL_3_EXERCISE_IDS = [
  'navajas-vups',
  'giros-rusos',
  'plancha-toque-hombros',
  'hollow-body'
];

export function generateAbsChallenge30Days(): AbsChallengeDay[] {
  const days: AbsChallengeDay[] = [];

  for (let day = 1; day <= 30; day++) {
    if (day <= 10) {
      days.push({
        day,
        level: 1,
        levelName: 'Nivel 1 - Base Fundamental',
        exerciseIds: LEVEL_1_EXERCISE_IDS,
        completed: false,
        durationSecondsTotal: 4 * (30 + 15) // 180s = 3 min
      });
    } else if (day <= 20) {
      days.push({
        day,
        level: 2,
        levelName: 'Nivel 2 - Resistencia y Densidad',
        exerciseIds: LEVEL_2_EXERCISE_IDS,
        completed: false,
        durationSecondsTotal: 4 * (30 + 15)
      });
    } else {
      days.push({
        day,
        level: 3,
        levelName: 'Nivel 3 - Fuerza Máxima y Estabilidad',
        exerciseIds: LEVEL_3_EXERCISE_IDS,
        completed: false,
        durationSecondsTotal: 4 * (30 + 15)
      });
    }
  }

  return days;
}
