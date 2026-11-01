import { publicAssetPath } from '@/lib/utils';
import type { WorkCode } from '@/engine/selectionEngine';
import type { AlignedWord } from '@/components/consultation/elPesoAudioWords';
import { EL_PESO_ALIGNED_WORDS } from '@/components/consultation/elPesoAudioWords';
import { EL_DIA_ALIGNED_WORDS } from '@/components/consultation/elDiaAudioWords';
import { EL_ESPEJO_ALIGNED_WORDS } from '@/components/consultation/elEspejoAudioWords';
import { CUANDO_EL_MANANA_ALIGNED_WORDS } from '@/components/consultation/cuandoElMananaAudioWords';
import { EL_ECO_DEL_SILENCIO_ALIGNED_WORDS } from '@/components/consultation/elEcoDelSilencioAudioWords';
import { LA_UNICA_CERTEZA_ALIGNED_WORDS } from '@/components/consultation/laUnicaCertezaAudioWords';

export interface BookEditorialPillar {
  icon: 'book' | 'compass' | 'leaf';
  text: string;
}

export interface BookPageData {
  workCode: WorkCode;
  volumeLabel: string;
  title: string;
  subtitle: string;
  mockupPath: string;
  mockupAlt: string;
  leadPhrase: string;
  presentationParagraphs: string[];
  excerptKicker: string;
  excerptTitle: string;
  excerptIntro: string;
  excerptParagraphs?: string[];
  audioPath?: string;
  alignedWords?: AlignedWord[];
  closingQuestion: string;
  closingText: string;
  ctaLabel: string;
  ctaUrl?: string;
  secondaryLinkLabel: string;
  pillars: BookEditorialPillar[];
}

/**
 * CATÁLOGO OFICIAL DE LAS SEIS OBRAS DE LA CONSULTA
 *
 * «El peso que no se ve» (PP) constituye la plantilla visual y funcional
 * de referencia aprobada. Las otras cinco obras reutilizan esta misma
 * estructura de 3 secciones, tipografía, paleta cromática, controles de
 * audio y adaptabilidad responsive.
 */
export const BOOKS_CATALOG: Record<WorkCode, BookPageData> = {
  // =========================================================================
  // OBRA CANÓNICA DE REFERENCIA (APROBADA)
  // =========================================================================
  PP: {
    workCode: 'PP',
    volumeLabel: 'La Consulta · Volumen II',
    title: 'El peso\nque no se ve',
    subtitle: 'Cómo reconocer, nombrar y liberarte del Síndrome de la Carga Total',
    mockupPath: publicAssetPath('/images/MOCKUPelpesoquenoseve.PNG'),
    mockupAlt: 'Mockup de El peso que no se ve, de Elena Vargas',
    leadPhrase: 'Hay cosas que haces todos los días y que casi nadie ve.',
    presentationParagraphs: [
      'Recordar lo que falta. Anticiparte a lo que puede ocurrir. Estar pendiente de los demás, organizar lo que viene y procurar que todo siga funcionando.',
      'A veces, el día termina y todavía queda en la cabeza una lista que nadie más conoce.',
      'El peso que no se ve se detiene en esa parte de la vida que rara vez aparece en las cuentas: todo lo que sostienes, incluso cuando desde fuera parece que no pasa nada.',
      'Una obra para poner palabras a esa carga y empezar a mirar de otra manera lo que llevas contigo.',
    ],
    excerptKicker: 'Una página del libro',
    excerptTitle: 'Anatomía\nde la sobrecarga',
    excerptIntro:
      'Hay tareas que parecen pequeñas cuando se miran por separado. El trabajo cambia cuando alguien tiene que recordarlas todas, anticiparse a ellas y procurar que ninguna quede atrás.',
    audioPath: publicAssetPath('/audio/audioelpeso.mp3'),
    alignedWords: EL_PESO_ALIGNED_WORDS,
    closingQuestion: '¿Te reconoces\nen estas líneas?',
    closingText:
      'Este pasaje pertenece a una obra que se detiene en todo ese trabajo que hacemos sin que siempre se vea.',
    ctaLabel: 'Descubrir el libro',
    secondaryLinkLabel: 'Explorar las seis obras',
    pillars: [
      { icon: 'book', text: 'Una mirada profunda\ny cercana' },
      { icon: 'compass', text: 'Herramientas para\nentender lo que vives' },
      { icon: 'leaf', text: 'Un acompañamiento\npara tu día a día' },
    ],
  },

  // =========================================================================
  // LAS OTRAS CINCO OBRAS DE LA COLECCIÓN (ESTRUCTURA DE PLANTILLA LISTA)
  // =========================================================================
  DD: {
    workCode: 'DD',
    volumeLabel: 'La Consulta · Volumen I',
    title: 'El día que\ndejé de ser',
    subtitle: 'El desvanecimiento y la reconstrucción de la propia identidad',
    mockupPath: publicAssetPath('/images/mockupeldia.png'),
    mockupAlt: 'Mockup de El día que dejé de ser, de Elena Vargas',
    leadPhrase: '«Hay un momento en el que dejas de ser lo que siempre has sido. Y necesitas descubrir quién eres ahora.»',
    presentationParagraphs: [
      'Durante mucho tiempo has sabido cuál era tu lugar. Había personas que contaban contigo, cosas que dependían de ti y una vida organizada alrededor de todo aquello que hacías.',
      'Después, algo cambia. Los hijos se marchan, termina una relación, llega la jubilación o dejas atrás un trabajo que durante años ha formado parte de ti.',
      'Y un día te encuentras con un tiempo distinto, unas rutinas que ya no son las mismas y una pregunta que no esperabas tener que hacerte: quién eres cuando ese lugar deja de ser tuyo.',
      'Este libro habla de ese momento. De lo que ocurre cuando el papel que has desempeñado durante años deja de definirte y de cómo empezar a reconocerte más allá de todo lo que has sido para los demás.',
    ],
    excerptKicker: 'Una página del libro',
    excerptTitle: 'Cuando el papel\nque ocupabas desaparece',
    excerptIntro:
      'Hay pérdidas que no se ven desde fuera. La vida sigue, pero algo cambia en la manera de reconocerte.',
    excerptParagraphs: [
      'La crisis no es que hayas perdido el rol.',
      'La crisis es descubrir que habías construido tu valor sobre él.',
      'Y eso, aunque duele, es también la información más importante que podías recibir para empezar a construir algo más sólido.',
    ],
    audioPath: publicAssetPath('/audio/audioeldia.mp3'),
    alignedWords: EL_DIA_ALIGNED_WORDS,
    closingQuestion: '¿Te reconoces\nen estas líneas?',
    closingText:
      'Este pasaje pertenece a una obra sobre la reconstrucción y la valentía de volver a mirarse de frente.',
    ctaLabel: 'Descubrir el libro',
    secondaryLinkLabel: 'Explorar las seis obras',
    pillars: [
      { icon: 'book', text: 'Una mirada profunda\ny cercana' },
      { icon: 'compass', text: 'Herramientas para\nentender lo que vives' },
      { icon: 'leaf', text: 'Un acompañamiento\npara tu día a día' },
    ],
  },

  EM: {
    workCode: 'EM',
    volumeLabel: 'La Consulta · Volumen III',
    title: 'El espejo\nque miente',
    subtitle: 'El miedo a dejar de importar y la mirada con la que aprendiste a medir tu valor.',
    mockupPath: publicAssetPath('/images/mockupelespejo.png'),
    mockupAlt: 'Mockup de El espejo que miente, de Elena Vargas',
    leadPhrase: '«A veces no ha cambiado tanto lo que eres como la forma en la que el mundo te devuelve tu propia imagen.»',
    presentationParagraphs: [
      'Mirarse al espejo y no ver quién eres, sino lo que los demás esperan o juzgan de ti.',
      'El juicio constante, la autoexigencia y el reflejo distorsionado que construimos con los ojos ajenos.',
      'El espejo que miente desmonta las trampas de la autoevaluación externa para devolverte una mirada limpia y compasiva.',
      'Una obra para reconciliarte con lo que de verdad eres.',
    ],
    excerptKicker: 'Una página del libro',
    excerptTitle: 'Cuando el mundo empieza\na mirar hacia otro lado',
    excerptIntro:
      '«A veces no ocurre nada concreto. Solo empiezas a notar que ya no te miran de la misma manera. Y cuesta admitir cuánto te afecta.»',
    excerptParagraphs: [
      'El miedo a la irrelevancia no es vanidad. No es egoísmo. No es que estés obsesionada con los años que tienes. Es algo mucho más profundo: es el terror a perder tu lugar en el mundo. A que lo que eres, lo que aportas, lo que representas, vaya dejando de importar.',
      'En palabras más sencillas: el miedo a que, poco a poco, vayas pasando de ser vista a ser ignorada.',
      'El problema no eres tú. El problema es el espejo que te están poniendo delante, porque ese espejo miente.',
    ],
    audioPath: publicAssetPath('/audio/audioelespejo.mp3'),
    alignedWords: EL_ESPEJO_ALIGNED_WORDS,
    closingQuestion: '¿Te reconoces\nen estas líneas?',
    closingText:
      'Este pasaje pertenece a una obra que desmonta el juicio ajeno para devolverte el valor que te corresponde.',
    ctaLabel: 'Descubrir el libro',
    secondaryLinkLabel: 'Explorar las seis obras',
    pillars: [
      { icon: 'book', text: 'Una mirada profunda\ny cercana' },
      { icon: 'compass', text: 'Herramientas para\nentender lo que vives' },
      { icon: 'leaf', text: 'Un acompañamiento\npara tu día a día' },
    ],
  },

  CM: {
    workCode: 'CM',
    volumeLabel: 'La Consulta · Volumen IV',
    title: 'Cuando el mañana\nte secuestra',
    subtitle: 'Cómo dejar de vivir anticipando lo que aún no ha ocurrido.',
    mockupPath: publicAssetPath('/images/mockupcuando.png'),
    mockupAlt: 'Mockup de Cuando el mañana te secuestra, de Elena Vargas',
    leadPhrase: '«Tu cuerpo está en esa mesa. Pero tu mente está en otro sitio.»',
    presentationParagraphs: [
      'Hay días en los que todo parece estar bien. Estás en casa, compartes una comida con personas que quieres o intentas descansar después del trabajo. Sin embargo, una parte de tu cabeza ya está en otra parte.',
      'Repasas esa conversación que tendrás mañana. Piensas en lo que podría salir mal en el trabajo. Te preguntas qué significará aquella molestia, aquel silencio o aquella noticia que todavía no ha llegado.',
      'Y mientras intentas prepararte para todo lo que podría ocurrir, el día sigue pasando.',
      'A veces, preocuparte parece una manera de mantener las cosas bajo control. Como si pensar lo suficiente en un problema pudiera evitar que sucediera. Pero hay un momento en el que esa vigilancia deja de ayudarte y empieza a quitarte tiempo, descanso y presencia.',
      'Este libro habla de esa forma de vivir pendiente del mañana. De la incertidumbre, de los escenarios que la mente construye y del cansancio de intentar resolver hoy todo lo que quizá nunca ocurra.',
      'Porque el futuro importa. Pero tu vida también está sucediendo ahora.',
    ],
    excerptKicker: 'Una página del libro',
    excerptTitle: 'Dejar de intentar\nadivinar el futuro',
    excerptIntro:
      'A veces creemos que necesitamos saber cómo van a salir las cosas para poder estar tranquilas. Pero quizá no necesitamos tener todas las respuestas para seguir adelante.',
    excerptParagraphs: [
      'Una de las distinciones más liberadoras que puedes hacer es la diferencia entre predecir y prepararse.',
      'La ansiedad anticipatoria te lleva a predecir: a intentar saber de antemano qué va a pasar, para poder controlarlo. La preparación efectiva hace algo diferente: acepta que no sabes qué va a pasar, e identifica qué puedes hacer ahora para estar en mejor posición, independientemente de lo que ocurra.',
      'La predicción consume energía sin producir seguridad real. La preparación produce seguridad real sin necesitar certeza. Son estrategias completamente diferentes, aunque a veces se confunden.',
    ],
    audioPath: publicAssetPath('/audio/audioelmañana.mp3'),
    alignedWords: CUANDO_EL_MANANA_ALIGNED_WORDS,
    closingQuestion: '¿Te reconoces\nen estas líneas?',
    closingText:
      'Este pasaje pertenece a una obra sobre cómo regresar al presente y desarmar la prisa constante.',
    ctaLabel: 'Descubrir el libro',
    secondaryLinkLabel: 'Explorar las seis obras',
    pillars: [
      { icon: 'book', text: 'Una mirada profunda\ny cercana' },
      { icon: 'compass', text: 'Herramientas para\nentender lo que vives' },
      { icon: 'leaf', text: 'Un acompañamiento\npara tu día a día' },
    ],
  },

  ES: {
    workCode: 'ES',
    volumeLabel: 'La Consulta · Volumen III',
    title: 'El eco del\nsilencio',
    subtitle: 'Cómo salir de relaciones que te dejan vacía aunque no estés sola.',
    mockupPath: publicAssetPath('/images/mockupeleco.png'),
    mockupAlt: 'Mockup de El eco del silencio, de Elena Vargas',
    leadPhrase: '«El silencio dentro de una relación no es solo la ausencia de palabras. Es la presencia de algo que necesita ser dicho y que todavía no ha encontrado el momento.»',
    presentationParagraphs: [
      'Desde fuera, vuestra relación parece funcionar. Compartís la casa, las rutinas, las decisiones de cada día. No hay grandes discusiones ni sucede nada que puedas señalar como el origen de tu malestar.',
      'Pero hace tiempo que hay cosas que no cuentas. Necesidades que has dejado de expresar, conversaciones que aplazas y momentos en los que te gustaría sentirte más cerca de la otra persona, pero no sabes cómo llegar hasta ella.',
      'Quizá has intentado hablar y no ha servido de mucho. Quizá te has acostumbrado a pensar que tampoco es para tanto, que todas las parejas pasan por etapas así o que es mejor no remover las cosas.',
      'Mientras tanto, la distancia crece. Y puedes acabar sintiéndote sola precisamente en el lugar donde esperabas encontrar compañía.',
      'Este libro habla de lo que ocurre cuando el silencio se instala en una relación, de las razones por las que cuesta tanto romperlo y de cómo empezar a expresar lo que necesitas sin perderte a ti misma por el camino.',
      'Porque una relación no tiene que ser perfecta. Pero tú también necesitas tener un lugar dentro de ella.',
    ],
    excerptKicker: 'Una página del libro',
    excerptTitle: 'Cuando todavía es posible\nvolver a encontrarse',
    excerptIntro:
      'A veces, después de mucho tiempo sin hablar de lo que de verdad importa, cuesta imaginar que algo pueda cambiar. Pero el silencio no siempre significa que todo se haya terminado.',
    excerptParagraphs: [
      'Y sin embargo, he visto también lo otro: parejas que creían que ya no había nada que recuperar y que, cuando finalmente se dijeron lo que llevaban años callando, descubrieron que seguía habiendo algo.',
      'Que el amor no había desaparecido, sino que se había sepultado bajo el peso del silencio y del resentimiento acumulado.',
      'Y que, con trabajo y voluntad de ambas partes, era posible volver a encontrarse.',
    ],
    audioPath: publicAssetPath('/audio/audioeleco.mp3'),
    alignedWords: EL_ECO_DEL_SILENCIO_ALIGNED_WORDS,
    closingQuestion: '¿Te reconoces\nen estas líneas?',
    closingText:
      'Este pasaje pertenece a una obra que acompaña a quienes necesitan romper el silencio y recuperar su lugar en la relación.',
    ctaLabel: 'Descubrir el libro',
    secondaryLinkLabel: 'Explorar las seis obras',
    pillars: [
      { icon: 'book', text: 'Una mirada profunda\ny cercana' },
      { icon: 'compass', text: 'Herramientas para\nentender lo que vives' },
      { icon: 'leaf', text: 'Un acompañamiento\npara tu día a día' },
    ],
  },

  UC: {
    workCode: 'UC',
    volumeLabel: 'La Consulta · Volumen VI',
    title: 'La única\ncerteza',
    subtitle: 'Vivir con el miedo a la enfermedad, a la muerte y a perder a quienes amamos.',
    mockupPath: publicAssetPath('/images/mockuplaunica.png'),
    mockupAlt: 'Mockup de La única certeza, de Elena Vargas',
    leadPhrase: '«La sombra del mañana siempre estará ahí. Pero la luz también está aquí, ahora.»',
    presentationParagraphs: [
      'Hay miedos que cuesta reconocer, incluso ante las personas que tenemos más cerca. El temor a enfermar, a que algo le ocurra a alguien a quien queremos o a pensar que un día nuestra vida tendrá que terminar.',
      'A veces aparecen después de un diagnóstico. Otras, cuando vemos envejecer a nuestros padres, cuando alguien cercano enferma o cuando una noticia nos recuerda lo frágil que puede ser todo.',
      'Y otras veces no hace falta que ocurra nada. Basta una noche de insomnio, una molestia que no sabemos interpretar o ese pensamiento que llega sin avisar y nos hace imaginar todo lo que podríamos perder.',
      'Intentamos apartarlo, buscar respuestas o convencernos de que no deberíamos pensar en esas cosas. Pero el miedo no desaparece por no hablar de él. Y cuando ocupa demasiado espacio, puede acabar quitándonos precisamente aquello que queremos proteger: la posibilidad de vivir con tranquilidad el tiempo que tenemos.',
      'Este libro habla de ese miedo. De por qué aparece, de cómo afecta a nuestra manera de vivir y de las herramientas que pueden ayudarnos a mirarlo sin dejar que decida por nosotras.',
      'Porque no podemos tener todas las certezas. Pero todavía podemos elegir qué hacemos con la vida que está ocurriendo ahora.',
    ],
    excerptKicker: 'Una página del libro',
    excerptTitle: 'Cuando el miedo te lleva\ndemasiado lejos',
    excerptIntro:
      'Hay momentos en los que la mente se adelanta a todo lo que podría ocurrir. Y mientras intenta prepararse para un futuro incierto, deja de prestar atención a lo que todavía está aquí.',
    excerptParagraphs: [
      'El miedo a la muerte vive en el futuro. El presente es el único lugar donde la muerte no está todavía. Y paradójicamente, es también el lugar donde la vida está completamente.',
      'El mindfulness no resuelve el miedo. Pero sí lo devuelve a su lugar: algo que existe en la mente, no algo que está ocurriendo ahora.',
    ],
    audioPath: publicAssetPath('/audio/audiolaunica.mp3'),
    alignedWords: LA_UNICA_CERTEZA_ALIGNED_WORDS,
    closingQuestion: '¿Te reconoces\nen estas líneas?',
    closingText:
      'Este pasaje pertenece a una obra que enseña a habitar el presente sin dejar que el miedo al futuro decida por nosotras.',
    ctaLabel: 'Descubrir el libro',
    secondaryLinkLabel: 'Explorar las seis obras',
    pillars: [
      { icon: 'book', text: 'Una mirada profunda\ny cercana' },
      { icon: 'compass', text: 'Herramientas para\nentender lo que vives' },
      { icon: 'leaf', text: 'Un acompañamiento\npara tu día a día' },
    ],
  },
};
