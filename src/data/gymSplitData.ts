import { GymDailyRoutine } from '../types';

export const GYM_SPLIT: GymDailyRoutine[] = [
  {
    dayKey: 'lunes',
    dayName: 'Lunes',
    title: 'Día de Empuje (Push)',
    focus: 'Pecho, Deltoides Anterior/Lateral y Tríceps',
    isRestDay: false,
    fst7RecommendedExercise: 'Cruces en polea o Extensión de tríceps',
    exercises: [
      {
        id: 'lun-1',
        name: 'Press de banca plano (barra o mancuernas)',
        targetMuscle: 'Pectoral mayor (porción media/esternal)',
        setsCount: 4,
        targetReps: '6-8 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '6-8 reps', completed: false },
          { setNumber: 2, targetReps: '6-8 reps', completed: false },
          { setNumber: 3, targetReps: '6-8 reps', completed: false },
          { setNumber: 4, targetReps: '6-8 reps', completed: false },
        ]
      },
      {
        id: 'lun-2',
        name: 'Press inclinado con mancuernas',
        targetMuscle: 'Pectoral superior (porción clavicular)',
        setsCount: 3,
        targetReps: '8-10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8-10 reps', completed: false },
          { setNumber: 2, targetReps: '8-10 reps', completed: false },
          { setNumber: 3, targetReps: '8-10 reps', completed: false },
        ]
      },
      {
        id: 'lun-3',
        name: 'Press militar con mancuernas sentado',
        targetMuscle: 'Deltoides anterior y tríceps',
        setsCount: 3,
        targetReps: '8-10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8-10 reps', completed: false },
          { setNumber: 2, targetReps: '8-10 reps', completed: false },
          { setNumber: 3, targetReps: '8-10 reps', completed: false },
        ]
      },
      {
        id: 'lun-4',
        name: 'Elevaciones laterales con mancuernas',
        targetMuscle: 'Deltoides lateral (anchura de hombro)',
        setsCount: 4,
        targetReps: '12-15 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '12-15 reps', completed: false },
          { setNumber: 2, targetReps: '12-15 reps', completed: false },
          { setNumber: 3, targetReps: '12-15 reps', completed: false },
          { setNumber: 4, targetReps: '12-15 reps', completed: false },
        ]
      },
      {
        id: 'lun-5',
        name: 'Fondos en paralelas o banco',
        targetMuscle: 'Tríceps y pectoral inferior',
        setsCount: 3,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '10-12 reps', completed: false },
          { setNumber: 2, targetReps: '10-12 reps', completed: false },
          { setNumber: 3, targetReps: '10-12 reps', completed: false },
        ]
      },
      {
        id: 'lun-6',
        name: 'Extensión de tríceps en polea (cuerda/barra)',
        targetMuscle: 'Tríceps (cabeza lateral y medial)',
        setsCount: 3,
        targetReps: '12 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '12 reps', completed: false },
          { setNumber: 2, targetReps: '12 reps', completed: false },
          { setNumber: 3, targetReps: '12 reps', completed: false },
        ]
      },
      {
        id: 'lun-fst7',
        name: 'Cruces en polea / Extensión tríceps (Remate FST-7)',
        targetMuscle: 'Bomba Fascial de Pectoral o Tríceps',
        setsCount: 7,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        isFst7Finisher: true,
        isFst7Active: true,
        notes: 'Protocolo FST-7: 7 series de 10-12 reps con 30s de descanso estricto y contracción isométrica entre series.',
        sets: Array.from({ length: 7 }, (_, i) => ({
          setNumber: i + 1,
          targetReps: '10-12 reps',
          completed: false,
          isFst7: true
        }))
      }
    ]
  },
  {
    dayKey: 'martes',
    dayName: 'Martes',
    title: 'Día de Tirón (Pull)',
    focus: 'Espalda completa, Deltoides Posterior y Bíceps',
    isRestDay: false,
    fst7RecommendedExercise: 'Pull-over en polea alta con cuerda',
    exercises: [
      {
        id: 'mar-1',
        name: 'Jalón al pecho (abierto o neutro)',
        targetMuscle: 'Dorsal ancho y redondo mayor',
        setsCount: 4,
        targetReps: '8-10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8-10 reps', completed: false },
          { setNumber: 2, targetReps: '8-10 reps', completed: false },
          { setNumber: 3, targetReps: '8-10 reps', completed: false },
          { setNumber: 4, targetReps: '8-10 reps', completed: false },
        ]
      },
      {
        id: 'mar-2',
        name: 'Remo con barra o mancuerna a una mano',
        targetMuscle: 'Dorsal, trapecio medio y romboides',
        setsCount: 4,
        targetReps: '8 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8 reps', completed: false },
          { setNumber: 2, targetReps: '8 reps', completed: false },
          { setNumber: 3, targetReps: '8 reps', completed: false },
          { setNumber: 4, targetReps: '8 reps', completed: false },
        ]
      },
      {
        id: 'mar-3',
        name: 'Remo en polea baja (agarre estrecho)',
        targetMuscle: 'Espesor dorsal y romboides',
        setsCount: 3,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '10-12 reps', completed: false },
          { setNumber: 2, targetReps: '10-12 reps', completed: false },
          { setNumber: 3, targetReps: '10-12 reps', completed: false },
        ]
      },
      {
        id: 'mar-4',
        name: 'Face Pull en polea o Pájaros con mancuerna',
        targetMuscle: 'Deltoides posterior y manguito rotador',
        setsCount: 4,
        targetReps: '12-15 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '12-15 reps', completed: false },
          { setNumber: 2, targetReps: '12-15 reps', completed: false },
          { setNumber: 3, targetReps: '12-15 reps', completed: false },
          { setNumber: 4, targetReps: '12-15 reps', completed: false },
        ]
      },
      {
        id: 'mar-5',
        name: 'Curl de bíceps con barra Z o mancuernas',
        targetMuscle: 'Bíceps braquial (cabeza corta y larga)',
        setsCount: 3,
        targetReps: '10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '10 reps', completed: false },
          { setNumber: 2, targetReps: '10 reps', completed: false },
          { setNumber: 3, targetReps: '10 reps', completed: false },
        ]
      },
      {
        id: 'mar-6',
        name: 'Curl martillo con mancuernas',
        targetMuscle: 'Braquial anterior y braquiorradial',
        setsCount: 3,
        targetReps: '12 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '12 reps', completed: false },
          { setNumber: 2, targetReps: '12 reps', completed: false },
          { setNumber: 3, targetReps: '12 reps', completed: false },
        ]
      },
      {
        id: 'mar-fst7',
        name: 'Pull-over en polea alta con cuerda (Remate FST-7)',
        targetMuscle: 'Dorsal Ancho (Aislamiento y Estiramiento Fascial)',
        setsCount: 7,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        isFst7Finisher: true,
        isFst7Active: true,
        notes: 'Protocolo FST-7: 7 series de 10-12 reps con 30s de descanso estricto expandiendo la caja torácica en cada pausa.',
        sets: Array.from({ length: 7 }, (_, i) => ({
          setNumber: i + 1,
          targetReps: '10-12 reps',
          completed: false,
          isFst7: true
        }))
      }
    ]
  },
  {
    dayKey: 'miercoles',
    dayName: 'Miércoles',
    title: 'Pierna (Cuádriceps y Gemelos)',
    focus: 'Cuádriceps femoral, Aductores y Gastrocnemios',
    isRestDay: false,
    fst7RecommendedExercise: 'Extensión de cuádriceps en máquina',
    exercises: [
      {
        id: 'mie-1',
        name: 'Sentadilla trasera (barra o Smith)',
        targetMuscle: 'Cuádriceps y glúteo mayor',
        setsCount: 4,
        targetReps: '6-8 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '6-8 reps', completed: false },
          { setNumber: 2, targetReps: '6-8 reps', completed: false },
          { setNumber: 3, targetReps: '6-8 reps', completed: false },
          { setNumber: 4, targetReps: '6-8 reps', completed: false },
        ]
      },
      {
        id: 'mie-2',
        name: 'Prensa de piernas 45°',
        targetMuscle: 'Cuádriceps completo y estabilizadores',
        setsCount: 4,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '10-12 reps', completed: false },
          { setNumber: 2, targetReps: '10-12 reps', completed: false },
          { setNumber: 3, targetReps: '10-12 reps', completed: false },
          { setNumber: 4, targetReps: '10-12 reps', completed: false },
        ]
      },
      {
        id: 'mie-3',
        name: 'Zancadas caminando (walking lunges)',
        targetMuscle: 'Cuádriceps, glúteo y core dinámico',
        setsCount: 3,
        targetReps: '10 pasos por pierna',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '10 pasos/pierna', completed: false },
          { setNumber: 2, targetReps: '10 pasos/pierna', completed: false },
          { setNumber: 3, targetReps: '10 pasos/pierna', completed: false },
        ]
      },
      {
        id: 'mie-4',
        name: 'Extensión de cuádriceps en máquina',
        targetMuscle: 'Aislamiento de recto femoral y vastos',
        setsCount: 3,
        targetReps: '12-15 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '12-15 reps', completed: false },
          { setNumber: 2, targetReps: '12-15 reps', completed: false },
          { setNumber: 3, targetReps: '12-15 reps', completed: false },
        ]
      },
      {
        id: 'mie-5',
        name: 'Gemelos de pie en máquina',
        targetMuscle: 'Gastrocnemio (cabeza medial y lateral)',
        setsCount: 4,
        targetReps: '15 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '15 reps', completed: false },
          { setNumber: 2, targetReps: '15 reps', completed: false },
          { setNumber: 3, targetReps: '15 reps', completed: false },
          { setNumber: 4, targetReps: '15 reps', completed: false },
        ]
      },
      {
        id: 'mie-fst7',
        name: 'Extensión de cuádriceps en máquina (Remate FST-7)',
        targetMuscle: 'Congestión Fascial Máxima de Cuádriceps',
        setsCount: 7,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        isFst7Finisher: true,
        isFst7Active: true,
        notes: 'Protocolo FST-7: 7 series de 10-12 reps con 30s de descanso. Aprieta el cuádriceps en la contracción máxima durante 1s.',
        sets: Array.from({ length: 7 }, (_, i) => ({
          setNumber: i + 1,
          targetReps: '10-12 reps',
          completed: false,
          isFst7: true
        }))
      }
    ]
  },
  {
    dayKey: 'jueves',
    dayName: 'Jueves',
    title: 'Torso Completo (Fuerza e Hipertrofia)',
    focus: 'Pecho, Espalda, Hombros y Brazos',
    isRestDay: false,
    fst7RecommendedExercise: 'Elevaciones laterales en polea o Pec Deck',
    exercises: [
      {
        id: 'jue-1',
        name: 'Press banca inclinado (barra o mancuernas)',
        targetMuscle: 'Pectoral superior',
        setsCount: 4,
        targetReps: '8 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8 reps', completed: false },
          { setNumber: 2, targetReps: '8 reps', completed: false },
          { setNumber: 3, targetReps: '8 reps', completed: false },
          { setNumber: 4, targetReps: '8 reps', completed: false },
        ]
      },
      {
        id: 'jue-2',
        name: 'Remo con barra',
        targetMuscle: 'Espalda media y alta',
        setsCount: 4,
        targetReps: '8 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8 reps', completed: false },
          { setNumber: 2, targetReps: '8 reps', completed: false },
          { setNumber: 3, targetReps: '8 reps', completed: false },
          { setNumber: 4, targetReps: '8 reps', completed: false },
        ]
      },
      {
        id: 'jue-3',
        name: 'Aperturas con mancuernas o Pec Deck',
        targetMuscle: 'Pectoral mayor (estiramiento profundo)',
        setsCount: 3,
        targetReps: '12 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '12 reps', completed: false },
          { setNumber: 2, targetReps: '12 reps', completed: false },
          { setNumber: 3, targetReps: '12 reps', completed: false },
        ]
      },
      {
        id: 'jue-4',
        name: 'Dominadas o jalón cerrado al pecho',
        targetMuscle: 'Dorsal ancho (amplitud)',
        setsCount: 3,
        targetReps: '8-10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8-10 reps', completed: false },
          { setNumber: 2, targetReps: '8-10 reps', completed: false },
          { setNumber: 3, targetReps: '8-10 reps', completed: false },
        ]
      },
      {
        id: 'jue-5',
        name: 'Press militar de pie con barra o mancuernas',
        targetMuscle: 'Deltoides anterior y estabilizadores de core',
        setsCount: 3,
        targetReps: '8-10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8-10 reps', completed: false },
          { setNumber: 2, targetReps: '8-10 reps', completed: false },
          { setNumber: 3, targetReps: '8-10 reps', completed: false },
        ]
      },
      {
        id: 'jue-6',
        name: 'Superserie: Curl barra Z + Press francés',
        targetMuscle: 'Bíceps braquial + Tríceps (cabeza larga)',
        setsCount: 3,
        targetReps: '10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '10 reps c/u', completed: false },
          { setNumber: 2, targetReps: '10 reps c/u', completed: false },
          { setNumber: 3, targetReps: '10 reps c/u', completed: false },
        ]
      },
      {
        id: 'jue-fst7',
        name: 'Elevaciones laterales en polea / Pec Deck (Remate FST-7)',
        targetMuscle: 'Deltoides Lateral o Bombeo Pectoral',
        setsCount: 7,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        isFst7Finisher: true,
        isFst7Active: true,
        notes: 'Protocolo FST-7: 7 series de 10-12 reps con 30s de descanso exacto.',
        sets: Array.from({ length: 7 }, (_, i) => ({
          setNumber: i + 1,
          targetReps: '10-12 reps',
          completed: false,
          isFst7: true
        }))
      }
    ]
  },
  {
    dayKey: 'viernes',
    dayName: 'Viernes',
    title: 'Pierna (Isquios, Glúteo y Cadena Posterior)',
    focus: 'Isquiosurales, Glúteo Mayor y Erector Espinal',
    isRestDay: false,
    fst7RecommendedExercise: 'Curl femoral acostado',
    exercises: [
      {
        id: 'vie-1',
        name: 'Hip Thrust con barra',
        targetMuscle: 'Glúteo mayor (extensión máxima de cadera)',
        setsCount: 4,
        targetReps: '8-10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8-10 reps', completed: false },
          { setNumber: 2, targetReps: '8-10 reps', completed: false },
          { setNumber: 3, targetReps: '8-10 reps', completed: false },
          { setNumber: 4, targetReps: '8-10 reps', completed: false },
        ]
      },
      {
        id: 'vie-2',
        name: 'Peso muerto rumano (mancuernas o barra)',
        targetMuscle: 'Isquiosurales y glúteos en estiramiento excéntrico',
        setsCount: 4,
        targetReps: '8-10 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '8-10 reps', completed: false },
          { setNumber: 2, targetReps: '8-10 reps', completed: false },
          { setNumber: 3, targetReps: '8-10 reps', completed: false },
          { setNumber: 4, targetReps: '8-10 reps', completed: false },
        ]
      },
      {
        id: 'vie-3',
        name: 'Prensa de piernas (pies altos y separados)',
        targetMuscle: 'Glúteos e isquiosurales',
        setsCount: 3,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '10-12 reps', completed: false },
          { setNumber: 2, targetReps: '10-12 reps', completed: false },
          { setNumber: 3, targetReps: '10-12 reps', completed: false },
        ]
      },
      {
        id: 'vie-4',
        name: 'Curl femoral acostado o sentado',
        targetMuscle: 'Aislamiento de bíceps femoral y semitendinoso',
        setsCount: 4,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '10-12 reps', completed: false },
          { setNumber: 2, targetReps: '10-12 reps', completed: false },
          { setNumber: 3, targetReps: '10-12 reps', completed: false },
          { setNumber: 4, targetReps: '10-12 reps', completed: false },
        ]
      },
      {
        id: 'vie-5',
        name: 'Gemelos sentado en máquina',
        targetMuscle: 'Sóleo (flexión plantar con rodilla flexionada)',
        setsCount: 4,
        targetReps: '15 reps',
        isFst7Eligible: true,
        sets: [
          { setNumber: 1, targetReps: '15 reps', completed: false },
          { setNumber: 2, targetReps: '15 reps', completed: false },
          { setNumber: 3, targetReps: '15 reps', completed: false },
          { setNumber: 4, targetReps: '15 reps', completed: false },
        ]
      },
      {
        id: 'vie-fst7',
        name: 'Curl femoral acostado (Remate FST-7)',
        targetMuscle: 'Fascia Posterior y Congestión Isquiosural',
        setsCount: 7,
        targetReps: '10-12 reps',
        isFst7Eligible: true,
        isFst7Finisher: true,
        isFst7Active: true,
        notes: 'Protocolo FST-7: 7 series de 10-12 reps con 30s de descanso estricto. Mantén 1s de contracción isométrica arriba.',
        sets: Array.from({ length: 7 }, (_, i) => ({
          setNumber: i + 1,
          targetReps: '10-12 reps',
          completed: false,
          isFst7: true
        }))
      }
    ]
  },
  {
    dayKey: 'sabado',
    dayName: 'Sábado',
    title: 'Descanso y Recuperación Activa',
    focus: 'Regeneración Muscular, Movilidad y Trote Ligero',
    isRestDay: true,
    exercises: []
  },
  {
    dayKey: 'domingo',
    dayName: 'Domingo',
    title: 'Descanso y Preparación Semanal',
    focus: 'Recarga de Glucógeno, Hidratación y Descanso del SNC',
    isRestDay: true,
    exercises: []
  }
];
