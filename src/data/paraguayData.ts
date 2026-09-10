export interface ParaguayCity {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  lat: number;
  lng: number;
  nickname?: string;
  description?: string;
  isCapital?: boolean;
}

export interface ParaguayDepartment {
  id: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  zoom: number;
  region: 'Región Oriental' | 'Región Occidental (Chaco)';
  badge: string;
  description: string;
  cities: ParaguayCity[];
}

export const PARAGUAY_CENTER: [number, number] = [-23.60, -58.00];
export const PARAGUAY_DEFAULT_ZOOM = 6.4;

export const PARAGUAY_DEPARTMENTS: ParaguayDepartment[] = [
  {
    id: 'asuncion',
    name: 'Asunción (Distrito Capital)',
    capital: 'Asunción',
    lat: -25.2867,
    lng: -57.6470,
    zoom: 12,
    region: 'Región Oriental',
    badge: 'Capital Nacional',
    description: 'Capital de la República del Paraguay, sede de gobierno, principal centro financiero, cultural y gastronómico del país.',
    cities: [
      {
        id: 'asu-centro',
        name: 'Asunción Centro / Casco Histórico',
        departmentId: 'asuncion',
        departmentName: 'Asunción (Distrito Capital)',
        lat: -25.2825,
        lng: -57.6350,
        nickname: 'Madre de Ciudades • Casco Histórico',
        description: 'Centro administrativo y comercial histórico de Asunción.',
        isCapital: true
      },
      {
        id: 'asu-villa-morra',
        name: 'Asunción - Villa Morra / Recoleta',
        departmentId: 'asuncion',
        departmentName: 'Asunción (Distrito Capital)',
        lat: -25.2950,
        lng: -57.5850,
        nickname: 'Eje Corporativo y Comercial',
        description: 'Zona de shoppings, restaurantes, hoteles y edificios residenciales de alta demanda.',
        isCapital: false
      },
      {
        id: 'asu-trinidad',
        name: 'Asunción - Santísima Trinidad',
        departmentId: 'asuncion',
        departmentName: 'Asunción (Distrito Capital)',
        lat: -25.2570,
        lng: -57.5750,
        nickname: 'Barrio Residencial y Jardín Botánico',
        description: 'Tradicional barrio asunceno con alta densidad de viviendas y comercios.',
        isCapital: false
      },
      {
        id: 'asu-sajonia',
        name: 'Asunción - Sajonia / Carlos A. López',
        departmentId: 'asuncion',
        departmentName: 'Asunción (Distrito Capital)',
        lat: -25.2980,
        lng: -57.6580,
        nickname: 'Barrio Tradicional del Puerto',
        description: 'Zona residencial histórica próxima al Palacio de Justicia y al río Paraguay.',
        isCapital: false
      }
    ]
  },
  {
    id: 'central',
    name: 'Central',
    capital: 'Areguá',
    lat: -25.4000,
    lng: -57.4800,
    zoom: 10,
    region: 'Región Oriental',
    badge: 'XI Departamento',
    description: 'El departamento más poblado de Paraguay, motor industrial, comercial y habitacional del Gran Asunción.',
    cities: [
      {
        id: 'san-lorenzo',
        name: 'San Lorenzo',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.3400,
        lng: -57.5100,
        nickname: 'Ciudad Universitaria',
        description: 'Polo educativo y comercial de mayor movimiento del Gran Asunción.',
        isCapital: false
      },
      {
        id: 'luque',
        name: 'Luque',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.2667,
        lng: -57.4833,
        nickname: 'Ciudad de la Música y la Filigrana',
        description: 'Gran urbe industrial, sede del Aeropuerto Silvio Pettirossi y de la CONMEBOL.',
        isCapital: false
      },
      {
        id: 'capiata',
        name: 'Capiatá',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.3500,
        lng: -57.4333,
        nickname: 'Ciudad de los Mitos',
        description: 'Eje habitacional y productivo sobre las Rutas PY01 y PY02.',
        isCapital: false
      },
      {
        id: 'lambare',
        name: 'Lambaré',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.3500,
        lng: -57.6167,
        nickname: 'Ciudad del Cerro y la Naturaleza',
        description: 'Distrito residencial vecino a Asunción con amplio crecimiento comercial.',
        isCapital: false
      },
      {
        id: 'fernando-de-la-mora',
        name: 'Fernando de la Mora',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.3200,
        lng: -57.5400,
        nickname: 'Ciudad Joven y Feliz',
        description: 'Ubicación estratégica y núcleo comercial clave del área metropolitana.',
        isCapital: false
      },
      {
        id: 'limpio',
        name: 'Limpio',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.1800,
        lng: -57.4800,
        nickname: 'El Portal Norte del Gran Asunción',
        description: 'Crecimiento exponencial industrial y logístico sobre la Ruta PY03.',
        isCapital: false
      },
      {
        id: 'nemby',
        name: 'Ñemby',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.3900,
        lng: -57.5400,
        nickname: 'Ciudad del Cerro Ñemby',
        description: 'Importante nodo poblacional y de talleres, servicios y comercios.',
        isCapital: false
      },
      {
        id: 'mariano-roque-alonso',
        name: 'Mariano Roque Alonso',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.2100,
        lng: -57.5300,
        nickname: 'Sede de la Expo Nacional',
        description: 'Polo portuario, industrial y de ferias internacionales sobre el río Paraguay.',
        isCapital: false
      },
      {
        id: 'villa-elisa',
        name: 'Villa Elisa',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.3700,
        lng: -57.5900,
        nickname: 'Ciudad Jardín del Sur',
        description: 'Punto de conexión fluvial y residencial de alto dinamismo.',
        isCapital: false
      },
      {
        id: 'itaugua',
        name: 'Itauguá',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.3800,
        lng: -57.3300,
        nickname: 'Capital del Ñandutí',
        description: 'Cuna artesanal paraguaya con importante actividad hospitalaria y vecinal.',
        isCapital: false
      },
      {
        id: 'aregua',
        name: 'Areguá',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.3100,
        lng: -57.3800,
        nickname: 'Capital Departamental • Tierra de Frutilla y Alfarería',
        description: 'Hermosa ciudad colonial a orillas del Lago Ypacaraí y capital de Central.',
        isCapital: true
      },
      {
        id: 'san-antonio',
        name: 'San Antonio',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.4200,
        lng: -57.5500,
        nickname: 'Ciudad Fluvial y Pesquera',
        description: 'Zona de astilleros, frigoríficos y urbanizaciones ribereñas.',
        isCapital: false
      },
      {
        id: 'ypane',
        name: 'Ypané',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.4500,
        lng: -57.5300,
        nickname: 'Tierra Histórica de la Batalla de Ytororó',
        description: 'Gran crecimiento de condominios y depósitos logísticos.',
        isCapital: false
      },
      {
        id: 'villeta',
        name: 'Villeta',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.5100,
        lng: -57.5600,
        nickname: 'Polo Industrial Portuario',
        description: 'Principal complejo de puertos privados e industrias químicas de Paraguay.',
        isCapital: false
      },
      {
        id: 'ypacarai',
        name: 'Ypacaraí',
        departmentId: 'central',
        departmentName: 'Central',
        lat: -25.4000,
        lng: -57.2800,
        nickname: 'Capital del Folclore',
        description: 'Portal histórico de acceso a la cordillera y al lago azul.',
        isCapital: false
      }
    ]
  },
  {
    id: 'alto-parana',
    name: 'Alto Paraná',
    capital: 'Ciudad del Este',
    lat: -25.4500,
    lng: -54.8000,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'X Departamento',
    description: 'Frontera con Brasil y Argentina, eje comercial internacional, de la represa de Itaipú y gigantesca producción de granos.',
    cities: [
      {
        id: 'ciudad-del-este',
        name: 'Ciudad del Este',
        departmentId: 'alto-parana',
        departmentName: 'Alto Paraná',
        lat: -25.5100,
        lng: -54.6100,
        nickname: 'Capital Departamental • Corazón Comercial de la Triple Frontera',
        description: 'Segunda ciudad del país, centro neurálgico de compras, servicios y tecnología.',
        isCapital: true
      },
      {
        id: 'hernandarias',
        name: 'Hernandarias',
        departmentId: 'alto-parana',
        departmentName: 'Alto Paraná',
        lat: -25.4000,
        lng: -54.6300,
        nickname: 'Capital de la Energía y Sede de Itaipú',
        description: 'Polo energético e industrial con hermosas costaneras e industrias maquiladoras.',
        isCapital: false
      },
      {
        id: 'presidente-franco',
        name: 'Presidente Franco',
        departmentId: 'alto-parana',
        departmentName: 'Alto Paraná',
        lat: -25.5400,
        lng: -54.6100,
        nickname: 'Ciudad de los Saltos del Monday',
        description: 'Conectada por el Puente de la Integración con Foz de Iguazú, con gran actividad turística y urbana.',
        isCapital: false
      },
      {
        id: 'minga-guazu',
        name: 'Minga Guazú',
        departmentId: 'alto-parana',
        departmentName: 'Alto Paraná',
        lat: -25.4800,
        lng: -54.7600,
        nickname: 'Capital del Trabajo Solidario',
        description: 'Sede del Aeropuerto Guaraní y del mayor parque agroindustrial del este.',
        isCapital: false
      },
      {
        id: 'santa-rita',
        name: 'Santa Rita',
        departmentId: 'alto-parana',
        departmentName: 'Alto Paraná',
        lat: -25.7800,
        lng: -55.0700,
        nickname: 'Capital del Progreso y la Soja',
        description: 'Polo agrícola de altísima tecnología, sede de la mayor Expo rural del interior.',
        isCapital: false
      },
      {
        id: 'juan-leon-mallorquin',
        name: 'Juan León Mallorquín',
        departmentId: 'alto-parana',
        departmentName: 'Alto Paraná',
        lat: -25.4100,
        lng: -55.2600,
        nickname: 'Polo Agrícola del Km 60',
        description: 'Eje productivo sobre la Ruta PY02 que conecta con Caaguazú.',
        isCapital: false
      }
    ]
  },
  {
    id: 'itapua',
    name: 'Itapúa',
    capital: 'Encarnación',
    lat: -27.0500,
    lng: -55.8000,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'VII Departamento',
    description: 'El Granero de Paraguay y joya del sur frente al Río Paraná, con 30 ciudades, playas, misiones jesuíticas y gran dinamismo.',
    cities: [
      {
        id: 'encarnacion',
        name: 'Encarnación',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.3306,
        lng: -55.8667,
        nickname: 'Capital Departamental • La Perla del Sur',
        description: 'Capital del departamento de Itapúa, polo económico, turístico y cultural frente al Río Paraná.',
        isCapital: true
      },
      {
        id: 'cambyreta',
        name: 'Cambyretá',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.3167,
        lng: -55.8167,
        nickname: 'Ciudad Jardín y Crecimiento',
        description: 'Distrito de gran expansión urbana adyacente a Encarnación con alta demanda de servicios y oficios.',
        isCapital: false
      },
      {
        id: 'san-juan-del-parana',
        name: 'San Juan del Paraná',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.3000,
        lng: -55.9667,
        nickname: 'Costanera y Naturaleza',
        description: 'Vecina a Encarnación sobre el embalse del Río Paraná, con clubes náuticos y barrios residenciales.',
        isCapital: false
      },
      {
        id: 'capitan-miranda',
        name: 'Capitán Miranda',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.2000,
        lng: -55.8000,
        nickname: 'Capital Nacional de la Horticultura',
        description: 'Importante centro hortícola e industrial sobre la Ruta PY06, a solo 15 km de Encarnación.',
        isCapital: false
      },
      {
        id: 'carmen-del-parana',
        name: 'Carmen del Paraná',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.2217,
        lng: -56.1550,
        nickname: 'Capital del Arroz y Playas del Paraná',
        description: 'Polo arrocero y balneario de aguas tranquilas con amplia costanera sobre la Ruta PY01.',
        isCapital: false
      },
      {
        id: 'coronel-bogado',
        name: 'Coronel Bogado',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.1667,
        lng: -56.2500,
        nickname: 'Capital Nacional de la Chipa',
        description: 'Eje comercial y gastronómico tradicional de Itapúa sobre el cruce de las rutas PY01 y PY08.',
        isCapital: false
      },
      {
        id: 'fram',
        name: 'Fram',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.0667,
        lng: -55.8833,
        nickname: 'Capital del Trigo y la Salud',
        description: 'Emblemática colonia eslava e industrial con alto estándar de desarrollo cívico y agropecuario.',
        isCapital: false
      },
      {
        id: 'hohenau',
        name: 'Hohenau',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.0833,
        lng: -55.6500,
        nickname: 'Madre de las Colonias Unidas',
        description: 'Pionera colonia alemana, centro agroindustrial, cooperativo y de la Expo Agrodinámica.',
        isCapital: false
      },
      {
        id: 'obligado',
        name: 'Obligado',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.0500,
        lng: -55.6333,
        nickname: 'Capital del Cooperativismo',
        description: 'Sede central de una de las mayores cooperativas del Cono Sur y polo lechero e industrial.',
        isCapital: false
      },
      {
        id: 'bella-vista',
        name: 'Bella Vista',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -27.0333,
        lng: -55.5667,
        nickname: 'Capital Nacional de la Yerba Mate',
        description: 'Cuna de las más célebres marcas de yerba mate paraguaya, con turismo industrial y clubes de pesca.',
        isCapital: false
      },
      {
        id: 'tomas-romero-pereira',
        name: 'Tomás Romero Pereira (María Auxiliadora)',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -26.5000,
        lng: -55.2667,
        nickname: 'Capital de la Zanahoria',
        description: 'La mayor urbe del nordeste de Itapúa, eje hortícola, bancario y de servicios de la región.',
        isCapital: false
      },
      {
        id: 'san-pedro-del-parana',
        name: 'San Pedro del Paraná',
        departmentId: 'itapua',
        departmentName: 'Itapúa',
        lat: -26.8333,
        lng: -56.2000,
        nickname: 'Corazón Ganadero y Agrícola',
        description: 'Extenso distrito con gran riqueza ganadera, agrícola y tradición criolla.',
        isCapital: false
      }
    ]
  },
  {
    id: 'caaguazu',
    name: 'Caaguazú',
    capital: 'Coronel Oviedo',
    lat: -25.4000,
    lng: -56.2500,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'V Departamento',
    description: 'En el cruce de las principales rutas de Paraguay, eje de la madera, la producción lechera de Campo 9 y gran comercio.',
    cities: [
      {
        id: 'coronel-oviedo',
        name: 'Coronel Oviedo',
        departmentId: 'caaguazu',
        departmentName: 'Caaguazú',
        lat: -25.4500,
        lng: -56.4500,
        nickname: 'Capital Departamental • Capital del Trabajo',
        description: 'Estratégico cruce de caminos nacionales, centro judicial y universitario del centro del país.',
        isCapital: true
      },
      {
        id: 'caaguazu-ciudad',
        name: 'Caaguazú (Ciudad)',
        departmentId: 'caaguazu',
        departmentName: 'Caaguazú',
        lat: -25.4600,
        lng: -56.0100,
        nickname: 'Capital de la Madera',
        description: 'Importante urbe industrial maderera, comercial y de servicios sobre la Ruta PY02.',
        isCapital: false
      },
      {
        id: 'campo-9',
        name: 'J. Eulogio Estigarribia (Campo 9)',
        departmentId: 'caaguazu',
        departmentName: 'Caaguazú',
        lat: -25.3800,
        lng: -55.8300,
        nickname: 'Capital Industrial de la Leche y Granos',
        description: 'Centro agroindustrial menonita con inmensa producción de lácteos, harinas y balanceados.',
        isCapital: false
      },
      {
        id: 'repatriacion',
        name: 'Repatriación',
        departmentId: 'caaguazu',
        departmentName: 'Caaguazú',
        lat: -25.5500,
        lng: -55.9600,
        nickname: 'Tierra Agrícola y Reforestación',
        description: 'Zona de intensa actividad agrícola, forestal y ganadera.',
        isCapital: false
      }
    ]
  },
  {
    id: 'cordillera',
    name: 'Cordillera',
    capital: 'Caacupé',
    lat: -25.2500,
    lng: -57.1000,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'III Departamento',
    description: 'Tierra de fe, cerros y turismo de fin de semana, sede de la Virgen de Caacupé y del Lago Ypacaraí.',
    cities: [
      {
        id: 'caacupe',
        name: 'Caacupé',
        departmentId: 'cordillera',
        departmentName: 'Cordillera',
        lat: -25.3800,
        lng: -57.1400,
        nickname: 'Capital Departamental • Capital Espiritual del Paraguay',
        description: 'Santuario de la Virgen de Caacupé, meta de millones de peregrinos y próspero centro de comercio.',
        isCapital: true
      },
      {
        id: 'san-bernardino',
        name: 'San Bernardino',
        departmentId: 'cordillera',
        departmentName: 'Cordillera',
        lat: -25.3100,
        lng: -57.2900,
        nickname: 'La Ciudad del Verano',
        description: 'Histórica colonia alemana y epicentro del veraneo y la gastronomía nacional junto al lago.',
        isCapital: false
      },
      {
        id: 'piribebuy',
        name: 'Piribebuy',
        departmentId: 'cordillera',
        departmentName: 'Cordillera',
        lat: -25.4800,
        lng: -57.0500,
        nickname: 'Ciudad Histórica de Arroyos y Caña',
        description: 'Cuna de caña paraguaya, arroyos cristalinos y balnearios de gran afluencia.',
        isCapital: false
      },
      {
        id: 'tobati',
        name: 'Tobatí',
        departmentId: 'cordillera',
        departmentName: 'Cordillera',
        lat: -25.2600,
        lng: -57.0700,
        nickname: 'Capital de la Cerámica y la Artesanía',
        description: 'Importante productora de ladrillos, tejas y tallados en madera para la construcción nacional.',
        isCapital: false
      },
      {
        id: 'atyra',
        name: 'Atyrá',
        departmentId: 'cordillera',
        departmentName: 'Cordillera',
        lat: -25.2800,
        lng: -57.1600,
        nickname: 'La Ciudad Más Limpia de América',
        description: 'Famosa por su cultura ecológica y fina artesanía en cuero y talabartería.',
        isCapital: false
      }
    ]
  },
  {
    id: 'guaira',
    name: 'Guairá',
    capital: 'Villarrica',
    lat: -25.7500,
    lng: -56.4500,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'IV Departamento',
    description: 'Al pie de la Cordillera del Ybytyruzú y el cerro Tres Kandu, rica en poesía, cultura, caña dulce e industrias azucareras.',
    cities: [
      {
        id: 'villarrica',
        name: 'Villarrica',
        departmentId: 'guaira',
        departmentName: 'Guairá',
        lat: -25.7500,
        lng: -56.4500,
        nickname: 'Capital Departamental • La Andariega • Cuna de Poetas',
        description: 'Ciudad culta y señorial, sede de universidades históricas y polo agroindustrial azucarero.',
        isCapital: true
      },
      {
        id: 'colonia-independencia',
        name: 'Colonia Independencia',
        departmentId: 'guaira',
        departmentName: 'Guairá',
        lat: -25.6800,
        lng: -56.2600,
        nickname: 'Tierra del Vino y del Ybytyruzú',
        description: 'Colonia alemana con bodegas vitivinícolas, saltos de agua y posadas turísticas.',
        isCapital: false
      },
      {
        id: 'paso-yobai',
        name: 'Paso Yobái',
        departmentId: 'guaira',
        departmentName: 'Guairá',
        lat: -25.7300,
        lng: -55.9800,
        nickname: 'Capital del Oro y la Yerba',
        description: 'Polo de minería aurífera y cultivo de yerba mate.',
        isCapital: false
      }
    ]
  },
  {
    id: 'paraguari',
    name: 'Paraguarí',
    capital: 'Paraguarí',
    lat: -26.0000,
    lng: -57.1500,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'IX Departamento',
    description: 'Cerros imponentes, balnearios, tradición ecuestre y orígenes del ferrocarril paraguayo en Sapucai.',
    cities: [
      {
        id: 'paraguari-ciudad',
        name: 'Paraguarí',
        departmentId: 'paraguari',
        departmentName: 'Paraguarí',
        lat: -25.6200,
        lng: -57.1500,
        nickname: 'Capital Departamental • Tierra de Cerros y Toros',
        description: 'Histórica ciudad entre los cerros Santo Tomás y Hû, nexo entre la capital y el sur.',
        isCapital: true
      },
      {
        id: 'carapegua',
        name: 'Carapeguá',
        departmentId: 'paraguari',
        departmentName: 'Paraguarí',
        lat: -25.7700,
        lng: -57.2400,
        nickname: 'Capital del Poyvi y el Telar',
        description: 'Famosa por sus mantas, alfombras y tejidos en telar tradicional sobre la Ruta PY01.',
        isCapital: false
      },
      {
        id: 'yaguaron',
        name: 'Yaguarón',
        departmentId: 'paraguari',
        departmentName: 'Paraguarí',
        lat: -25.5600,
        lng: -57.2800,
        nickname: 'Cuna de los Mitos y Templo Franciscano',
        description: 'Posee la iglesia franciscana del siglo XVIII más deslumbrante de Paraguay.',
        isCapital: false
      },
      {
        id: 'quiindy',
        name: 'Quiindy',
        departmentId: 'paraguari',
        departmentName: 'Paraguarí',
        lat: -25.9700,
        lng: -57.2300,
        nickname: 'Capital Nacional de la Pelota',
        description: 'Fábricas artesanales de balones de fútbol cosidos a mano de fama internacional.',
        isCapital: false
      },
      {
        id: 'ybycui',
        name: 'Ybycuí',
        departmentId: 'paraguari',
        departmentName: 'Paraguarí',
        lat: -26.0200,
        lng: -57.0500,
        nickname: 'Parque Nacional e Histórica Fundición La Rosada',
        description: 'Hermosos saltos de agua y la primera fundición de hierro de Sudamérica.',
        isCapital: false
      }
    ]
  },
  {
    id: 'concepcion',
    name: 'Concepción',
    capital: 'Concepción',
    lat: -23.4000,
    lng: -57.4300,
    zoom: 8,
    region: 'Región Oriental',
    badge: 'I Departamento',
    description: 'El portal del norte paraguayo, polo portuario fluvial, frigorífico y de la celulosa sobre el Río Paraguay.',
    cities: [
      {
        id: 'concepcion-ciudad',
        name: 'Concepción',
        departmentId: 'concepcion',
        departmentName: 'Concepción',
        lat: -23.4000,
        lng: -57.4300,
        nickname: 'Capital Departamental • La Perla del Norte',
        description: 'Puerto comercial fluvial estratégico, polo frigorífico y polo de inversión en celulosa.',
        isCapital: true
      },
      {
        id: 'horqueta',
        name: 'Horqueta',
        departmentId: 'concepcion',
        departmentName: 'Concepción',
        lat: -23.3400,
        lng: -56.0500,
        nickname: 'Ciudad Laboriosa y Ganadera',
        description: 'Núcleo comercial sobre la Ruta PY05 que une Concepción con Pedro Juan Caballero.',
        isCapital: false
      },
      {
        id: 'yby-yau',
        name: 'Yby Yaú',
        departmentId: 'concepcion',
        departmentName: 'Concepción',
        lat: -22.9700,
        lng: -56.5300,
        nickname: 'Cruce Comercial del Norte',
        description: 'Estratégico empalme de las rutas PY05 y PY08.',
        isCapital: false
      }
    ]
  },
  {
    id: 'san-pedro',
    name: 'San Pedro',
    capital: 'San Pedro de Ycuamandyyú',
    lat: -24.0800,
    lng: -56.8000,
    zoom: 8,
    region: 'Región Oriental',
    badge: 'II Departamento',
    description: 'El departamento más extenso de la Región Oriental, inmensa producción de granos, ganadería y yerba mate.',
    cities: [
      {
        id: 'santani',
        name: 'San Estanislao (Santaní)',
        departmentId: 'san-pedro',
        departmentName: 'San Pedro',
        lat: -24.6500,
        lng: -56.4400,
        nickname: 'El Motor Comercial de San Pedro',
        description: 'La ciudad más poblada y comercial del departamento de San Pedro.',
        isCapital: false
      },
      {
        id: 'santa-rosa-del-aguaray',
        name: 'Santa Rosa del Aguaray',
        departmentId: 'san-pedro',
        departmentName: 'San Pedro',
        lat: -23.7800,
        lng: -56.5000,
        nickname: 'Capital del Agua Clara y Laguna Blanca',
        description: 'Polo comercial en auge, con centros de salud y turismo en Laguna Blanca.',
        isCapital: false
      },
      {
        id: 'san-pedro-capital',
        name: 'San Pedro de Ycuamandyyú',
        departmentId: 'san-pedro',
        departmentName: 'San Pedro',
        lat: -24.0900,
        lng: -57.0800,
        nickname: 'Capital Departamental • Tierra del Ycuá Mandyyú',
        description: 'Histórica capital departamental con edificios coloniales y puerto fluvial.',
        isCapital: true
      }
    ]
  },
  {
    id: 'amambay',
    name: 'Amambay',
    capital: 'Pedro Juan Caballero',
    lat: -22.5400,
    lng: -55.7300,
    zoom: 8,
    region: 'Región Oriental',
    badge: 'XIII Departamento',
    description: 'Frontera seca con Ponta Porã (Brasil), la Cordillera del Amambay y el Parque Nacional Cerro Corá.',
    cities: [
      {
        id: 'pedro-juan-caballero',
        name: 'Pedro Juan Caballero',
        departmentId: 'amambay',
        departmentName: 'Amambay',
        lat: -22.5400,
        lng: -55.7300,
        nickname: 'Capital Departamental • La Terraza del País',
        description: 'Gran metrópoli de compras fronteriza, polo universitario de medicina y comercio dinámico.',
        isCapital: true
      },
      {
        id: 'bella-vista-norte',
        name: 'Bella Vista Norte',
        departmentId: 'amambay',
        departmentName: 'Amambay',
        lat: -22.1300,
        lng: -56.5200,
        nickname: 'Frontera Ribereña sobre el Río Apa',
        description: 'Conexión fronteriza frente a Bela Vista (Mato Grosso do Sul, Brasil).',
        isCapital: false
      },
      {
        id: 'capitan-bado',
        name: 'Capitán Bado',
        departmentId: 'amambay',
        departmentName: 'Amambay',
        lat: -23.2700,
        lng: -55.5300,
        nickname: 'Frontera con Coronel Sapucaia',
        description: 'Destacada actividad maderera, sojera y ganadera en el límite oriental.',
        isCapital: false
      }
    ]
  },
  {
    id: 'canindeyu',
    name: 'Canindeyú',
    capital: 'Salto del Guairá',
    lat: -24.0500,
    lng: -54.3000,
    zoom: 8,
    region: 'Región Oriental',
    badge: 'XIV Departamento',
    description: 'Enorme producción de soja y maíz, shoppings de turismo de compras y la reserva de biosfera del Bosque Mbaracayú.',
    cities: [
      {
        id: 'salto-del-guaira',
        name: 'Salto del Guairá',
        departmentId: 'canindeyu',
        departmentName: 'Canindeyú',
        lat: -24.0500,
        lng: -54.3000,
        nickname: 'Capital Departamental • Capital del Turismo de Compras',
        description: 'Frontera con los estados de Paraná y Mato Grosso do Sul (Brasil), meca de centros comerciales.',
        isCapital: true
      },
      {
        id: 'curuguaty',
        name: 'Curuguaty',
        departmentId: 'canindeyu',
        departmentName: 'Canindeyú',
        lat: -24.4700,
        lng: -55.6900,
        nickname: 'Histórica Villa de San Isidro',
        description: 'Histórica ciudad de refugio del prócer Gervasio Artigas y centro ganadero y agrícola.',
        isCapital: false
      },
      {
        id: 'katuete',
        name: 'Katueté',
        departmentId: 'canindeyu',
        departmentName: 'Canindeyú',
        lat: -24.2500,
        lng: -54.7500,
        nickname: 'El Cruce Productivo de Canindeyú',
        description: 'Polo de silos, empresas de maquinaria agrícola e insumos.',
        isCapital: false
      }
    ]
  },
  {
    id: 'misiones',
    name: 'Misiones',
    capital: 'San Juan Bautista',
    lat: -26.8500,
    lng: -57.0000,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'VIII Departamento',
    description: 'Tierra jesuítica, del asado a la estaca, del chorizo sanjuanino, de la represa de Yacyretá y hermosas playas en Ayolas y Villa Florida.',
    cities: [
      {
        id: 'san-juan-bautista',
        name: 'San Juan Bautista',
        departmentId: 'misiones',
        departmentName: 'Misiones',
        lat: -26.6600,
        lng: -57.1400,
        nickname: 'Capital Departamental • Cuna de Agustín Pío Barrios (Mangoré)',
        description: 'Ciudad cultural y universitaria, cuna de la guitarrística paraguaya y tradicional chorizo.',
        isCapital: true
      },
      {
        id: 'san-ignacio',
        name: 'San Ignacio Guazú',
        departmentId: 'misiones',
        departmentName: 'Misiones',
        lat: -26.8700,
        lng: -57.0200,
        nickname: 'Primera Reducción Jesuítica y Capital del Tañarandy',
        description: 'Famosa mundialmente por las procesiones de Semana Santa con antorchas en Tañarandy.',
        isCapital: false
      },
      {
        id: 'ayolas',
        name: 'Ayolas',
        departmentId: 'misiones',
        departmentName: 'Misiones',
        lat: -27.4000,
        lng: -56.9000,
        nickname: 'Capital de la Energía y Paraíso de la Pesca',
        description: 'Sede paraguaya de la Central Hidroeléctrica Yacyretá e islas sobre el Río Paraná.',
        isCapital: false
      },
      {
        id: 'villa-florida',
        name: 'Villa Florida',
        departmentId: 'misiones',
        departmentName: 'Misiones',
        lat: -26.3800,
        lng: -57.1400,
        nickname: 'Portal Dorado sobre el Río Tebicuary',
        description: 'Tradicional balneario de arenas blancas de fin de semana para familias de todo el país.',
        isCapital: false
      }
    ]
  },
  {
    id: 'neembucu',
    name: 'Ñeembucú',
    capital: 'Pilar',
    lat: -26.8600,
    lng: -58.3000,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'XII Departamento',
    description: 'En la confluencia de los ríos Paraguay y Paraná, tierra de humedales vírgenes, pesca deportiva y la industria textil de Pilar.',
    cities: [
      {
        id: 'pilar',
        name: 'Pilar',
        departmentId: 'neembucu',
        departmentName: 'Ñeembucú',
        lat: -26.8600,
        lng: -58.3000,
        nickname: 'Capital Departamental • La Perla del Sur-Oeste • Capital Textil',
        description: 'Sede de Manufactura de Pilar, con moderna costanera defensiva y puerto fluvial.',
        isCapital: true
      },
      {
        id: 'alberdi',
        name: 'Alberdi',
        departmentId: 'neembucu',
        departmentName: 'Ñeembucú',
        lat: -26.1800,
        lng: -58.1400,
        nickname: 'Frontera Comercial frente a Formosa (Argentina)',
        description: 'Punto de cruce fluvial de miles de personas diarias y comercio fronterizo.',
        isCapital: false
      },
      {
        id: 'cerrito',
        name: 'Cerrito',
        departmentId: 'neembucu',
        departmentName: 'Ñeembucú',
        lat: -27.3500,
        lng: -57.6500,
        nickname: 'Capital de la Pesca y Playas de las Islas',
        description: 'Destino predilecto de pescadores de dorados y surubíes sobre el Paraná.',
        isCapital: false
      }
    ]
  },
  {
    id: 'caazapa',
    name: 'Caazapá',
    capital: 'Caazapá',
    lat: -26.1800,
    lng: -56.3700,
    zoom: 9,
    region: 'Región Oriental',
    badge: 'VI Departamento',
    description: 'Tierra de leyendas de Fray Luis de Bolaños y el Ykua Bolaños, rica en bosques y producción sojera y ganadera.',
    cities: [
      {
        id: 'caazapa-ciudad',
        name: 'Caazapá',
        departmentId: 'caazapa',
        departmentName: 'Caazapá',
        lat: -26.1800,
        lng: -56.3700,
        nickname: 'Capital Departamental • Cuna del Ykua Bolaños',
        description: 'Famosa fuente milagrosa franciscana y festejos tradicionales de verano.',
        isCapital: true
      },
      {
        id: 'san-juan-nepomuceno',
        name: 'San Juan Nepomuceno',
        departmentId: 'caazapa',
        departmentName: 'Caazapá',
        lat: -26.1100,
        lng: -55.9600,
        nickname: 'El Motor Económico de Caazapá',
        description: 'La ciudad de mayor pujanza comercial y productiva del departamento.',
        isCapital: false
      },
      {
        id: 'yuty',
        name: 'Yuty',
        departmentId: 'caazapa',
        departmentName: 'Caazapá',
        lat: -26.6100,
        lng: -56.2500,
        nickname: 'Tierra del Arroz y el Río Tebicuary',
        description: 'Fuerte desarrollo arrocero y agrícola en la cuenca del Tebicuary.',
        isCapital: false
      }
    ]
  },
  {
    id: 'presidente-hayes',
    name: 'Presidente Hayes',
    capital: 'Villa Hayes',
    lat: -24.5000,
    lng: -58.5000,
    zoom: 7,
    region: 'Región Occidental (Chaco)',
    badge: 'XV Departamento (Bajo Chaco)',
    description: 'La puerta de entrada al Chaco paraguayo cruzando el puente Héroes del Chaco, polo siderúrgico, ganadero y astilleros.',
    cities: [
      {
        id: 'villa-hayes',
        name: 'Villa Hayes',
        departmentId: 'presidente-hayes',
        departmentName: 'Presidente Hayes',
        lat: -25.1000,
        lng: -57.5300,
        nickname: 'Capital Departamental • La Ciudad del Acero',
        description: 'Sede de ACEPAR, puertos privados y rápido crecimiento industrial y residencial frente a Asunción.',
        isCapital: true
      },
      {
        id: 'benjamin-aceval',
        name: 'Benjamín Aceval',
        departmentId: 'presidente-hayes',
        departmentName: 'Presidente Hayes',
        lat: -24.9800,
        lng: -57.5600,
        nickname: 'Cuna del Azúcar Orgánico y los Quesos Suizos',
        description: 'Tradición quesera, azucarera e investigación agropecuaria en el Bajo Chaco.',
        isCapital: false
      },
      {
        id: 'nanawa',
        name: 'Nanawa (Puerto Elsa)',
        departmentId: 'presidente-hayes',
        departmentName: 'Presidente Hayes',
        lat: -25.2800,
        lng: -57.6900,
        nickname: 'Frontera Comercial con Clorinda (Argentina)',
        description: 'Punto de intercambio vecinal y comercial intenso con la provincia de Formosa.',
        isCapital: false
      }
    ]
  },
  {
    id: 'boqueron',
    name: 'Boquerón',
    capital: 'Filadelfia',
    lat: -22.3500,
    lng: -60.0300,
    zoom: 7,
    region: 'Región Occidental (Chaco)',
    badge: 'XVI Departamento (Chaco Central)',
    description: 'El corazón del Chaco Central y de las cooperativas menonitas Fernheim, Neuland y Chortitzer, gigantes de la carne y lácteos.',
    cities: [
      {
        id: 'filadelfia',
        name: 'Filadelfia',
        departmentId: 'boqueron',
        departmentName: 'Boquerón',
        lat: -22.3500,
        lng: -60.0300,
        nickname: 'Capital Departamental • Corazón del Chaco Central',
        description: 'Moderna capital chaqueña, centro cooperativo, agroindustrial y médico del Chaco.',
        isCapital: true
      },
      {
        id: 'loma-plata',
        name: 'Loma Plata',
        departmentId: 'boqueron',
        departmentName: 'Boquerón',
        lat: -22.3800,
        lng: -59.8300,
        nickname: 'Polo Lácteo y Frigorífico Trébol',
        description: 'Sede de la cooperativa Chortitzer, pionera en producción lechera en el Chaco.',
        isCapital: false
      },
      {
        id: 'neuland',
        name: 'Neuland',
        departmentId: 'boqueron',
        departmentName: 'Boquerón',
        lat: -22.6500,
        lng: -60.1200,
        nickname: 'Polo Agropecuario y Reforestación',
        description: 'Emblemática colonia con alta tecnificación en carnes y algarrobo.',
        isCapital: false
      },
      {
        id: 'mariscal-estigarribia',
        name: 'Mariscal Estigarribia',
        departmentId: 'boqueron',
        departmentName: 'Boquerón',
        lat: -22.0300,
        lng: -60.6200,
        nickname: 'Eje del Corredor Bioceánico',
        description: 'Punto clave sobre la Ruta Bioceánica que unirá el Atlántico con el Pacífico.',
        isCapital: false
      }
    ]
  },
  {
    id: 'alto-paraguay',
    name: 'Alto Paraguay',
    capital: 'Fuerte Olimpo',
    lat: -20.5000,
    lng: -59.5000,
    zoom: 7,
    region: 'Región Occidental (Chaco)',
    badge: 'XVII Departamento (Pantanal)',
    description: 'El Gran Pantanal paraguayo, naturaleza pura sobre el alto Río Paraguay y ganadería de vanguardia.',
    cities: [
      {
        id: 'fuerte-olimpo',
        name: 'Fuerte Olimpo',
        departmentId: 'alto-paraguay',
        departmentName: 'Alto Paraguay',
        lat: -21.0400,
        lng: -57.8700,
        nickname: 'Capital Departamental • Puerta de Entrada al Pantanal',
        description: 'Histórico fuerte del siglo XVIII y santuario ecológico sobre el Río Paraguay.',
        isCapital: true
      },
      {
        id: 'carmelo-peralta',
        name: 'Carmelo Peralta',
        departmentId: 'alto-paraguay',
        departmentName: 'Alto Paraguay',
        lat: -21.6800,
        lng: -57.9000,
        nickname: 'Portal de la Ruta Bioceánica',
        description: 'Conectada por el nuevo Puente Bioceánico con Porto Murtinho (Brasil).',
        isCapital: false
      },
      {
        id: 'bahia-negra',
        name: 'Bahía Negra',
        departmentId: 'alto-paraguay',
        departmentName: 'Alto Paraguay',
        lat: -20.2300,
        lng: -58.1700,
        nickname: 'El Extremo Norte del Paraguay',
        description: 'Epicentro de expediciones ecoturísticas en el Pantanal del Río Negro.',
        isCapital: false
      }
    ]
  }
];

// Flat array of all cities in Paraguay
export const ALL_PARAGUAY_CITIES: ParaguayCity[] = PARAGUAY_DEPARTMENTS.flatMap(d => d.cities);

// Flat list of city names for search and dropdowns
export const PARAGUAY_CITY_NAMES: string[] = ALL_PARAGUAY_CITIES.map(c => c.name);

// All department names
export const PARAGUAY_DEPARTMENT_NAMES: string[] = PARAGUAY_DEPARTMENTS.map(d => d.name);
