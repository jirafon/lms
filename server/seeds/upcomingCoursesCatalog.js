export const UPCOMING_BADGE = 'Proximamente disponible - Inscribete en la lista de espera';

const withFinalEvaluation = (chapters) => [
  ...chapters,
  { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
];

export const upcomingCourses = [
  {
    courseTitle: 'Ciberseguridad y Proteccion de la Informacion',
    category: 'Ciberseguridad',
    description:
      'Curso practico para prevenir incidentes de seguridad digital, proteger informacion corporativa y fortalecer habitos seguros frente a amenazas tecnologicas actuales.',
    chapters: withFinalEvaluation([
      {
        title: 'Capitulo 1 - Introduccion a la Ciberseguridad',
        topics: [
          'Que es la ciberseguridad',
          'Amenazas digitales actuales',
          'Riesgos para empresas y colaboradores',
          'Rol de cada usuario en la seguridad'
        ]
      },
      {
        title: 'Capitulo 2 - Proteccion de Contrasenas y Accesos',
        topics: [
          'Buenas practicas de contrasenas',
          'Doble factor de autenticacion (MFA)',
          'Riesgos de compartir credenciales',
          'Acceso remoto seguro'
        ]
      },
      {
        title: 'Capitulo 3 - Phishing e Ingenieria Social',
        topics: [
          'Como identificar correos fraudulentos',
          'Ingenieria social',
          'Fraudes digitales comunes',
          'Que hacer ante sospechas'
        ]
      },
      {
        title: 'Capitulo 4 - Proteccion de Informacion y Archivos',
        topics: [
          'Clasificacion de informacion',
          'Manejo seguro de documentos',
          'Comparticion segura',
          'Riesgos de fuga de informacion'
        ]
      },
      {
        title: 'Capitulo 5 - Seguridad en Teletrabajo',
        topics: [
          'Uso seguro de redes WiFi',
          'VPN y acceso remoto',
          'Dispositivos personales',
          'Riesgos en trabajo hibrido'
        ]
      },
      {
        title: 'Capitulo 6 - Uso Seguro de Inteligencia Artificial',
        topics: [
          'Riesgos del uso de IA',
          'Datos que no deben compartirse',
          'Buenas practicas con IA generativa',
          'Shadow AI'
        ]
      },
      {
        title: 'Capitulo 7 - Gestion de Incidentes',
        topics: [
          'Como reportar incidentes',
          'Respuesta temprana',
          'Escalamiento',
          'Buenas practicas post incidente'
        ]
      }
    ])
  },
  {
    courseTitle: 'Ley Karin - Prevencion del Acoso y Violencia en el Trabajo',
    category: 'Compliance',
    description:
      'Curso orientado a promover ambientes laborales seguros y respetuosos, alineados con la Ley Karin y las obligaciones organizacionales de prevencion y actuacion frente al acoso y violencia laboral.',
    chapters: withFinalEvaluation([
      {
        title: 'Capitulo 1 - Introduccion a la Ley Karin',
        topics: [
          'Objetivos de la ley',
          'Obligaciones organizacionales',
          'Derechos de trabajadores',
          'Prevencion y cultura organizacional'
        ]
      },
      {
        title: 'Capitulo 2 - Acoso Laboral',
        topics: [
          'Definicion',
          'Conductas reiteradas',
          'Hostigamiento y exclusion',
          'Casos practicos'
        ]
      },
      {
        title: 'Capitulo 3 - Acoso Sexual',
        topics: [
          'Definicion legal',
          'Conductas inapropiadas',
          'Medios digitales',
          'Consentimiento y limites'
        ]
      },
      {
        title: 'Capitulo 4 - Violencia en el Trabajo',
        topics: [
          'Violencia fisica',
          'Violencia psicologica',
          'Violencia externa',
          'Factores de riesgo'
        ]
      },
      {
        title: 'Capitulo 5 - Procedimientos de Denuncia',
        topics: [
          'Como denunciar',
          'Confidencialidad',
          'Investigacion interna',
          'Proteccion del denunciante'
        ]
      },
      {
        title: 'Capitulo 6 - Rol de Lideres y Jefaturas',
        topics: [
          'Liderazgo preventivo',
          'Gestion de conflictos',
          'Obligaciones legales',
          'Cultura de respeto'
        ]
      },
      {
        title: 'Capitulo 7 - Buenas Practicas Organizacionales',
        topics: [
          'Prevencion temprana',
          'Comunicacion interna',
          'Ambientes saludables',
          'Gestion preventiva'
        ]
      }
    ])
  },
  {
    courseTitle: 'IA Responsable y Uso Seguro de Inteligencia Artificial',
    category: 'Tecnologia',
    description:
      'Capacitacion enfocada en el uso etico, seguro y responsable de herramientas de inteligencia artificial dentro de organizaciones, abordando riesgos regulatorios, reputacionales y de privacidad.',
    chapters: withFinalEvaluation([
      {
        title: 'Capitulo 1 - Introduccion a la Inteligencia Artificial',
        topics: ['Que es IA', 'IA generativa', 'Casos de uso empresariales', 'Beneficios y riesgos']
      },
      {
        title: 'Capitulo 2 - Riesgos y Limitaciones de IA',
        topics: ['Sesgos', 'Alucinaciones', 'Informacion falsa', 'Automatizacion incorrecta']
      },
      {
        title: 'Capitulo 3 - Proteccion de Datos y Confidencialidad',
        topics: ['Datos sensibles', 'Informacion confidencial', 'Riesgos regulatorios', 'IA y privacidad']
      },
      {
        title: 'Capitulo 4 - Uso Seguro de Herramientas IA',
        topics: ['Buenas practicas', 'Validacion humana', 'Human in the loop', 'Shadow AI']
      },
      {
        title: 'Capitulo 5 - IA Responsable y Gobernanza',
        topics: ['Transparencia', 'Explicabilidad', 'Accountability', 'Supervision humana']
      },
      {
        title: 'Capitulo 6 - Riesgos Legales y Compliance',
        topics: ['Propiedad intelectual', 'Derechos de autor', 'Riesgos regulatorios', 'Compliance corporativo']
      },
      {
        title: 'Capitulo 7 - IA en el Trabajo Diario',
        topics: ['Uso corporativo', 'Productividad responsable', 'Riesgos operacionales', 'Revision humana']
      }
    ])
  },
  {
    courseTitle: 'Libre Competencia y Prevencion de Conductas Anticompetitivas',
    category: 'Compliance',
    description:
      'Curso disenado para prevenir riesgos asociados a practicas anticompetitivas y fortalecer el cumplimiento normativo en relaciones comerciales y procesos de mercado.',
    chapters: withFinalEvaluation([
      {
        title: 'Capitulo 1 - Introduccion a Libre Competencia',
        topics: ['Principios basicos', 'Objetivos regulatorios', 'Riesgos empresariales', 'Impacto reputacional']
      },
      {
        title: 'Capitulo 2 - Conductas Anticompetitivas',
        topics: ['Colusion', 'Acuerdos ilicitos', 'Reparto de mercado', 'Manipulacion de precios']
      },
      {
        title: 'Capitulo 3 - Intercambio de Informacion Sensible',
        topics: ['Informacion confidencial', 'Riesgos en reuniones', 'Relacion con competidores', 'Senales de alerta']
      },
      {
        title: 'Capitulo 4 - Licitaciones y Mercado Publico',
        topics: ['Riesgos en licitaciones', 'Coordinacion indebida', 'Buenas practicas', 'Transparencia']
      },
      {
        title: 'Capitulo 5 - Reuniones y Eventos Comerciales',
        topics: ['Participacion segura', 'Conversaciones prohibidas', 'Asociaciones gremiales', 'Prevencion']
      },
      {
        title: 'Capitulo 6 - Buenas Practicas Preventivas',
        topics: ['Compliance comercial', 'Evidencia y trazabilidad', 'Controles internos', 'Cultura preventiva']
      },
      {
        title: 'Capitulo 7 - Gestion de Incidentes',
        topics: ['Reportabilidad', 'Investigacion interna', 'Mitigacion', 'Acciones correctivas']
      }
    ])
  },
  {
    courseTitle: 'Prevencion de Fraude Interno',
    category: 'Compliance',
    description:
      'Capacitacion orientada a identificar riesgos de fraude, fortalecer controles internos y promover una cultura preventiva dentro de la organizacion.',
    chapters: withFinalEvaluation([
      {
        title: 'Capitulo 1 - Introduccion al Fraude Corporativo',
        topics: ['Que es fraude', 'Impacto organizacional', 'Riesgos reputacionales', 'Cultura preventiva']
      },
      {
        title: 'Capitulo 2 - Tipologias de Fraude',
        topics: ['Fraude financiero', 'Fraude documental', 'Fraude digital', 'Manipulacion de informacion']
      },
      {
        title: 'Capitulo 3 - Senales de Alerta',
        topics: ['Conductas sospechosas', 'Indicadores de riesgo', 'Controles debiles', 'Casos frecuentes']
      },
      {
        title: 'Capitulo 4 - Segregacion de Funciones y Controles',
        topics: ['Roles y responsabilidades', 'Doble validacion', 'Controles preventivos', 'Riesgos operacionales']
      },
      {
        title: 'Capitulo 5 - Fraude Digital y Ciberfraude',
        topics: ['Suplantacion', 'Accesos indebidos', 'Phishing financiero', 'Robo de informacion']
      },
      {
        title: 'Capitulo 6 - Reportabilidad y Gestion de Incidentes',
        topics: ['Como reportar', 'Canal de denuncias', 'Investigacion', 'Trazabilidad']
      },
      {
        title: 'Capitulo 7 - Cultura Preventiva',
        topics: ['Etica organizacional', 'Liderazgo', 'Compliance interno', 'Buenas practicas']
      }
    ])
  },
  {
    courseTitle: 'Compliance para Proveedores y Terceros',
    category: 'Compliance',
    description:
      'Curso enfocado en gestion de riesgos asociados a terceros, due diligence, integridad corporativa y relacionamiento responsable con proveedores y contratistas.',
    chapters: withFinalEvaluation([
      {
        title: 'Capitulo 1 - Riesgos Asociados a Terceros',
        topics: ['Riesgos reputacionales', 'Riesgos regulatorios', 'Riesgos financieros', 'Riesgos operacionales']
      },
      {
        title: 'Capitulo 2 - Due Diligence',
        topics: ['Evaluacion de terceros', 'Screening', 'Validaciones basicas', 'PEP y sanciones']
      },
      {
        title: 'Capitulo 3 - Relacion Etica con Proveedores',
        topics: ['Conflictos de interes', 'Regalos y beneficios', 'Transparencia', 'Buenas practicas']
      },
      {
        title: 'Capitulo 4 - Contratos y Evidencia',
        topics: ['Documentacion critica', 'Trazabilidad', 'Evidencia de cumplimiento', 'Gestion documental']
      },
      {
        title: 'Capitulo 5 - Monitoreo y Seguimiento',
        topics: ['Evaluaciones periodicas', 'Alertas', 'Incumplimientos', 'Riesgos emergentes']
      },
      {
        title: 'Capitulo 6 - Gestion de Incidentes',
        topics: ['Reportabilidad', 'Investigacion', 'Acciones correctivas', 'Escalamiento']
      },
      {
        title: 'Capitulo 7 - Cultura de Compliance',
        topics: ['Responsabilidad compartida', 'Prevencion', 'Liderazgo', 'Mejora continua']
      }
    ])
  },
  {
    courseTitle: 'Seguridad de la Informacion - Awareness ISO 27001',
    category: 'Ciberseguridad',
    description:
      'Capacitacion disenada para generar conciencia organizacional sobre seguridad de la informacion y alineamiento con principios ISO 27001.',
    chapters: withFinalEvaluation([
      {
        title: 'Capitulo 1 - Introduccion a Seguridad de la Informacion',
        topics: ['Principios de seguridad', 'Confidencialidad', 'Integridad', 'Disponibilidad']
      },
      {
        title: 'Capitulo 2 - Clasificacion de Informacion',
        topics: ['Informacion publica', 'Informacion confidencial', 'Manejo seguro', 'Etiquetado']
      },
      {
        title: 'Capitulo 3 - Gestion de Accesos',
        topics: ['Usuarios y privilegios', 'MFA', 'Accesos indebidos', 'Buenas practicas']
      },
      {
        title: 'Capitulo 4 - Seguridad en Dispositivos',
        topics: ['Equipos corporativos', 'USB y dispositivos externos', 'Riesgos moviles', 'Actualizaciones']
      },
      {
        title: 'Capitulo 5 - Teletrabajo Seguro',
        topics: ['Redes WiFi', 'VPN', 'Riesgos remotos', 'Trabajo hibrido']
      },
      {
        title: 'Capitulo 6 - Gestion de Incidentes',
        topics: ['Que es un incidente', 'Respuesta', 'Reportabilidad', 'Continuidad']
      },
      {
        title: 'Capitulo 7 - Cultura de Seguridad',
        topics: ['Concientizacion', 'Buenas practicas', 'Riesgo humano', 'Responsabilidad compartida']
      }
    ])
  },
  {
    courseTitle: 'HSCE y Seguridad Operacional',
    category: 'Seguridad Operacional',
    description:
      'Curso orientado a fortalecer el cumplimiento operativo y la prevencion de riesgos en ambientes industriales y mineros.',
    chapters: [
      { title: 'Capitulo 1 - Cultura HSCE', topics: [] },
      { title: 'Capitulo 2 - Identificacion de Riesgos Operacionales', topics: [] },
      { title: 'Capitulo 3 - Permisos de Trabajo', topics: [] },
      { title: 'Capitulo 4 - Seguridad en Terreno', topics: [] },
      { title: 'Capitulo 5 - Reportabilidad de Incidentes', topics: [] },
      { title: 'Capitulo 6 - Gestion de Contratistas', topics: [] },
      { title: 'Capitulo 7 - Continuidad Operacional', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Compliance para Contratistas Mineros',
    category: 'Mineria',
    description:
      'Capacitacion enfocada en estandares de cumplimiento, conducta y seguridad exigidos a empresas contratistas del sector minero.',
    chapters: [
      { title: 'Capitulo 1 - Conducta en Faena', topics: [] },
      { title: 'Capitulo 2 - Seguridad Operacional', topics: [] },
      { title: 'Capitulo 3 - Alcohol y Drogas', topics: [] },
      { title: 'Capitulo 4 - Documentacion Critica', topics: [] },
      { title: 'Capitulo 5 - Relacion con Mandantes', topics: [] },
      { title: 'Capitulo 6 - Reportabilidad', topics: [] },
      { title: 'Capitulo 7 - Buenas Practicas', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Transferencias de Valor y Compliance Farmaceutico',
    category: 'Salud',
    description:
      'Curso especializado para la industria farmaceutica sobre cumplimiento regulatorio y transparencia en relacionamiento con profesionales de la salud.',
    chapters: [
      { title: 'Capitulo 1 - Introduccion a Transferencias de Valor', topics: [] },
      { title: 'Capitulo 2 - Relacion con Profesionales de la Salud', topics: [] },
      { title: 'Capitulo 3 - Hospitalidades y Beneficios', topics: [] },
      { title: 'Capitulo 4 - Riesgos Regulatorios', topics: [] },
      { title: 'Capitulo 5 - Transparencia y Reportabilidad', topics: [] },
      { title: 'Capitulo 6 - Evidencia y Auditoria', topics: [] },
      { title: 'Capitulo 7 - Buenas Practicas', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Proteccion de Datos Sensibles y Compliance Clinico',
    category: 'Salud',
    description:
      'Capacitacion orientada al manejo responsable de informacion clinica y datos sensibles dentro de organizaciones de salud.',
    chapters: [
      { title: 'Capitulo 1 - Datos Sensibles y Riesgos', topics: [] },
      { title: 'Capitulo 2 - Confidencialidad Clinica', topics: [] },
      { title: 'Capitulo 3 - Consentimiento Informado', topics: [] },
      { title: 'Capitulo 4 - Acceso y Trazabilidad', topics: [] },
      { title: 'Capitulo 5 - Riesgos Digitales en Salud', topics: [] },
      { title: 'Capitulo 6 - Brechas y Reportabilidad', topics: [] },
      { title: 'Capitulo 7 - Buenas Practicas', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Integridad y Compliance en Mercado Publico',
    category: 'Compliance',
    description:
      'Curso disenado para organizaciones que participan en procesos de compra publica y requieren fortalecer estandares de probidad y transparencia.',
    chapters: [
      { title: 'Capitulo 1 - Introduccion a Mercado Publico', topics: [] },
      { title: 'Capitulo 2 - Probidad Administrativa', topics: [] },
      { title: 'Capitulo 3 - Conflictos de Interes', topics: [] },
      { title: 'Capitulo 4 - Relacion con Funcionarios Publicos', topics: [] },
      { title: 'Capitulo 5 - Riesgos en Licitaciones', topics: [] },
      { title: 'Capitulo 6 - Canal de Denuncias', topics: [] },
      { title: 'Capitulo 7 - Evidencia y Trazabilidad', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Gobierno Corporativo y Gestion de Riesgos para Directorios',
    category: 'Compliance',
    description:
      'Capacitacion ejecutiva orientada a directorios y alta administracion sobre supervision de riesgos, compliance y gobernanza corporativa.',
    chapters: [
      { title: 'Capitulo 1 - Gobierno Corporativo', topics: [] },
      { title: 'Capitulo 2 - Rol del Directorio', topics: [] },
      { title: 'Capitulo 3 - Riesgos Estrategicos', topics: [] },
      { title: 'Capitulo 4 - Compliance y Supervision', topics: [] },
      { title: 'Capitulo 5 - Riesgos Emergentes', topics: [] },
      { title: 'Capitulo 6 - IA y Directorios', topics: [] },
      { title: 'Capitulo 7 - Accountability', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Gestion de Crisis y Continuidad Operacional',
    category: 'Continuidad Operacional',
    description:
      'Curso enfocado en preparacion organizacional frente a incidentes criticos, continuidad del negocio y resiliencia operacional.',
    chapters: [
      { title: 'Capitulo 1 - Introduccion a Continuidad Operacional', topics: [] },
      { title: 'Capitulo 2 - Gestion de Crisis', topics: [] },
      { title: 'Capitulo 3 - Ciberincidentes y Respuesta', topics: [] },
      { title: 'Capitulo 4 - Continuidad de Procesos', topics: [] },
      { title: 'Capitulo 5 - Gestion de Equipos Criticos', topics: [] },
      { title: 'Capitulo 6 - Comunicacion de Crisis', topics: [] },
      { title: 'Capitulo 7 - Recuperacion Operacional', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Codigo de Conducta Corporativo',
    category: 'Compliance',
    description:
      'Capacitacion introductoria para reforzar principios corporativos, normas internas y expectativas de conducta organizacional.',
    chapters: [
      { title: 'Capitulo 1 - Valores Organizacionales', topics: [] },
      { title: 'Capitulo 2 - Conductas Esperadas', topics: [] },
      { title: 'Capitulo 3 - Uso Responsable de Recursos', topics: [] },
      { title: 'Capitulo 4 - Conflictos de Interes', topics: [] },
      { title: 'Capitulo 5 - Canal de Denuncias', topics: [] },
      { title: 'Capitulo 6 - Buenas Practicas', topics: [] },
      { title: 'Capitulo 7 - Responsabilidades Organizacionales', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Canal de Denuncias y Speak Up Culture',
    category: 'Compliance',
    description:
      'Curso orientado a fortalecer la confianza organizacional y promover la denuncia temprana de conductas indebidas.',
    chapters: [
      { title: 'Capitulo 1 - Que es un Canal de Denuncias', topics: [] },
      { title: 'Capitulo 2 - Tipos de Incidentes', topics: [] },
      { title: 'Capitulo 3 - Confidencialidad y Proteccion', topics: [] },
      { title: 'Capitulo 4 - Como Reportar', topics: [] },
      { title: 'Capitulo 5 - Investigacion y Seguimiento', topics: [] },
      { title: 'Capitulo 6 - Cultura Speak Up', topics: [] },
      { title: 'Capitulo 7 - Buenas Practicas', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  },
  {
    courseTitle: 'Onboarding Etico para Nuevos Colaboradores',
    category: 'Compliance',
    description:
      'Curso introductorio para nuevos ingresos, orientado a transmitir cultura etica, compliance y buenas practicas organizacionales desde el primer dia.',
    chapters: [
      { title: 'Capitulo 1 - Cultura Organizacional', topics: [] },
      { title: 'Capitulo 2 - Integridad y Compliance', topics: [] },
      { title: 'Capitulo 3 - Seguridad de la Informacion', topics: [] },
      { title: 'Capitulo 4 - Privacidad de Datos', topics: [] },
      { title: 'Capitulo 5 - Conducta Esperada', topics: [] },
      { title: 'Capitulo 6 - Canal de Denuncias', topics: [] },
      { title: 'Capitulo 7 - Responsabilidades del Colaborador', topics: [] },
      { title: 'Capitulo 8 - Evaluacion Final', topics: [] }
    ]
  }
];

export const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getCourseChapterList = (course) => {
  if (Array.isArray(course.chapters) && course.chapters.length > 0) {
    return course.chapters;
  }

  if (Array.isArray(course.modules) && course.modules.length > 0) {
    return course.modules.map((moduleName) => ({ title: moduleName, topics: [] }));
  }

  return [];
};

export const buildUpcomingDescription = (course) => {
  return [
    course.description,
    '',
    'Estado: Proximamente disponible.',
    'Inscripcion: Puedes inscribirte en la lista de espera.'
  ].join('\n');
};
