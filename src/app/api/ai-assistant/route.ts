import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicializar cliente de Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Section-specific writing guidance
const SECTION_GUIDANCE: Record<string, { ES: string; EN: string }> = {
  introduction: {
    ES: "Estás ayudando a redactar la INTRODUCCIÓN. Enfócate en: contexto del problema, gap de conocimiento, revisión de literatura relevante, y objetivos/hipótesis del estudio. Usa un estilo narrativo claro y progresivo.",
    EN: "You are helping write the INTRODUCTION. Focus on: problem context, knowledge gap, relevant literature review, and study objectives/hypotheses. Use a clear, progressive narrative style.",
  },
  methods: {
    ES: "Estás ayudando a redactar los MÉTODOS. Enfócate en: descripción de participantes (criterios inclusión/exclusión), diseño experimental, instrumentos/equipos (EEG, fNIRS, etc.), protocolo paso a paso, y análisis estadístico. Sé preciso y reproducible.",
    EN: "You are helping write the METHODS. Focus on: participant description (inclusion/exclusion criteria), experimental design, instruments/equipment (EEG, fNIRS, etc.), step-by-step protocol, and statistical analysis. Be precise and reproducible.",
  },
  results: {
    ES: "Estás ayudando a redactar los RESULTADOS. Presenta hallazgos de forma objetiva sin interpretación. Incluye: estadísticos descriptivos, pruebas de hipótesis (p-valores, IC, tamaños de efecto), y referencias a figuras/tablas. Usa voz pasiva.",
    EN: "You are helping write the RESULTS. Present findings objectively without interpretation. Include: descriptive statistics, hypothesis tests (p-values, CIs, effect sizes), and references to figures/tables. Use passive voice.",
  },
  discussion: {
    ES: "Estás ayudando a redactar la DISCUSIÓN. Enfócate en: interpretación de resultados principales, comparación con literatura existente, mecanismos explicativos, limitaciones del estudio, implicaciones clínicas/teóricas, y direcciones futuras.",
    EN: "You are helping write the DISCUSSION. Focus on: interpretation of main results, comparison with existing literature, explanatory mechanisms, study limitations, clinical/theoretical implications, and future directions.",
  },
  conclusion: {
    ES: "Estás ayudando a redactar las CONCLUSIONES. Sé conciso. Resume los hallazgos principales sin repetir la discusión. Destaca contribuciones originales y significado práctico.",
    EN: "You are helping write the CONCLUSIONS. Be concise. Summarize main findings without repeating the discussion. Highlight original contributions and practical significance.",
  },
  abstract: {
    ES: "Estás ayudando a redactar el ABSTRACT. Debe contener: Objetivo, Métodos, Resultados y Conclusiones. Máximo 250 palabras. Incluye keywords si es pertinente.",
    EN: "You are helping write the ABSTRACT. It should contain: Objective, Methods, Results, and Conclusions. Maximum 250 words. Include keywords if relevant.",
  },
};

// System prompts según el tipo de asistencia
const getSystemPrompt = (language: string, type?: string, context?: string, sectionType?: string) => {
  const researchContext = `
Esta plataforma de investigación en neurociencia combina tecnología avanzada 
(EEG de alta densidad, fNIRS, etc.) con un enfoque humanista, explorando la mente, el cerebro y la consciencia 
más allá de los límites tradicionales. Las líneas de investigación incluyen:
- Generación del pensamiento y las emociones
- Sincronía cerebral entre personas
- Efectos del agradecimiento y del silencio en el organismo
- Visión extraocular en niños
- Sonobiología (influencia de las ondas sonoras en células)
- Presencia mindful en el trabajo

El lema es "la neurociencia de lo posible y lo imposible".
`;

  if (type === "publication") {
    const sectionGuidance = sectionType && SECTION_GUIDANCE[sectionType]
      ? `\n\n${SECTION_GUIDANCE[sectionType][language === "ES" ? "ES" : "EN"]}`
      : "";

    return language === "ES"
      ? `Eres un asistente de IA especializado en la redacción de documentos científicos y de divulgación en el campo de la neurociencia.

${researchContext}

Tu rol es actuar como un redactor experto en neurociencia y divulgación científica. Debes:
- Mantener el rigor científico: usar terminología adecuada sin inventar información.
- Ser claro y didáctico: explicar conceptos técnicos de forma accesible, usando analogías cuando sea útil.
- Mantener un tono entusiasta pero objetivo, mostrando curiosidad, con enfoque humanista.
- Estructurar bien el texto: usar títulos, subtítulos descriptivos, párrafos cortos.
- Generar contenido que sea atractivo, informativo y fiel a la ciencia.
- Formatea la respuesta en HTML válido (usa <p>, <strong>, <em>, <ul>, <li>, etc.) compatible con un editor de texto enriquecido Tiptap.
${sectionGuidance}
${context ? `\nContexto del documento actual:\n${context}\n` : ""}

Responde en español. Si el usuario te pide generar contenido, hazlo directamente sin preámbulos innecesarios.`
      : `You are an AI assistant specialized in writing scientific and popular science documents in the field of neuroscience.

${researchContext}

Your role is to act as an expert writer in neuroscience and science communication. You must:
- Maintain scientific rigor: use appropriate terminology without inventing information.
- Be clear and didactic: explain technical concepts accessibly, using analogies when helpful.
- Maintain an enthusiastic but objective tone, showing curiosity, with humanistic focus.
- Structure text well: use titles, descriptive subtitles, short paragraphs.
- Generate content that is engaging, informative, and true to science.
- Format your response in valid HTML (use <p>, <strong>, <em>, <ul>, <li>, etc.) compatible with a Tiptap rich text editor.
${sectionGuidance}
${context ? `\nCurrent document context:\n${context}\n` : ""}

Respond in English. If the user asks you to generate content, do so directly without unnecessary preambles.`;
  }

  // Prompt por defecto para chat general
  return language === "ES"
    ? `Eres un asistente experto en neurociencia especializado en:
- Desarrollo de tesis doctorales en neurociencia
- Metodología de investigación científica
- Análisis de datos neurofisiológicos
- Redacción científica y divulgación
- Diseño experimental y protocolos de investigación

${researchContext}

Proporciona respuestas académicas, precisas y fundamentadas en las mejores prácticas de la investigación científica internacional.
Mantén un tono profesional pero accesible, coherente con la filosofía de la investigación en neurociencia.
Responde siempre en español.`
    : `You are an expert neuroscience research assistant specialized in:
- Development of doctoral theses in neuroscience
- Scientific research methodology
- Neurophysiological data analysis
- Scientific writing and science communication
- Experimental design and research protocols

${researchContext}

Provide academic, precise responses grounded in the best practices of international scientific research.
Maintain a professional but accessible tone, consistent with a humanistic neuroscience research philosophy.
Always respond in English.`;
};

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.approved) {
      return NextResponse.json(
        { error: "Unauthorized - Aprobación requerida" },
        { status: 401 }
      );
    }

    const { message, language, type, context, sectionType } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Verificar si hay API key configurada
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.log("GOOGLE_AI_API_KEY no configurada, usando respuesta simulada");
      const response = await getSimulatedResponse(message, language || "ES", type);
      return NextResponse.json({ response });
    }

    try {
      // Llamar a la API de Google Gemini
      const systemPrompt = getSystemPrompt(language || "ES", type, context, sectionType);
      
      // Usar Gemini 1.5 Pro para mejores resultados
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-pro",
        systemInstruction: systemPrompt,
      });

      const result = await model.generateContent(message);
      const responseText = result.response.text();

      return NextResponse.json({ response: responseText });
    } catch (apiError) {
      console.error("Error calling Google AI API:", apiError);
      // Fallback a respuesta simulada si falla la API
      const response = await getSimulatedResponse(message, language || "ES", type);
      return NextResponse.json({ response });
    }
  } catch (error) {
    console.error("Error in AI assistant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Función de respuesta simulada como fallback
async function getSimulatedResponse(
  message: string,
  language: string,
  type?: string
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (type === "publication") {
    return language === "ES"
      ? `## Contenido Generado

Basándome en tu solicitud, aquí tienes un borrador inicial:

${message.includes("introducción") || message.includes("intro") 
  ? `La neurociencia contemporánea nos invita a explorar territorios que antes parecían reservados a la ciencia ficción. En nuestra línea de investigación, adoptamos un enfoque que combina el rigor metodológico con la apertura hacia fenómenos que desafían nuestras concepciones tradicionales.

### Nuestro Enfoque

Nuestra investigación se distingue por explorar no solo lo que conocemos, sino también lo que consideramos "imposible". Utilizando tecnologías como EEG de alta densidad y fNIRS, estudiamos fenómenos como la sincronía cerebral entre personas, los efectos del silencio en el organismo, y los potenciales inexplorados de la mente humana.`
  : `El presente estudio examina aspectos fundamentales de la neurociencia cognitiva desde nuestra perspectiva de investigación. Nuestro objetivo es contribuir al entendimiento de los procesos cerebrales que subyacen a la experiencia humana.

### Metodología

Empleamos un enfoque multidisciplinario que integra técnicas de neuroimagen, análisis de señales cerebrales y paradigmas experimentales innovadores.`}

*[Este es un contenido de ejemplo. Verifica que GOOGLE_AI_API_KEY esté correctamente configurada.]*`
      : `## Generated Content

Based on your request, here's an initial draft:

${message.includes("introduction") || message.includes("intro")
  ? `Contemporary neuroscience invites us to explore territories that once seemed reserved for science fiction. In our research, we adopt an approach that combines methodological rigor with openness to phenomena that challenge our traditional conceptions.

### Our Approach

Our research distinguishes itself by investigating not only what we know, but also what we consider "impossible". Using technologies such as high-density EEG and fNIRS, we study phenomena like brain synchrony between people, the effects of silence on the body, and the unexplored potentials of the human mind.`
  : `This study examines fundamental aspects of cognitive neuroscience from our research perspective. Our goal is to contribute to understanding the brain processes underlying human experience.

### Methodology

We employ a multidisciplinary approach that integrates neuroimaging techniques, brain signal analysis, and innovative experimental paradigms.`}

*[This is sample content. Verify that GOOGLE_AI_API_KEY is correctly configured.]*`;
  }

  return language === "ES"
    ? `Como asistente de investigación en neurociencia, puedo ayudarte con:

🔬 **Metodología**: Diseño experimental, selección de participantes, protocolos de investigación
📊 **Análisis de datos**: Estadística inferencial, análisis de neuroimágenes, procesamiento de señales EEG/fNIRS
📝 **Redacción científica**: Estructura de papers, revisión de literatura, argumentación científica
🎯 **Planificación**: Timeline de investigación, objetivos específicos, hipótesis

**Áreas de especialización en neurociencia:**
- Sincronía cerebral interpersonal
- Efectos del agradecimiento y silencio
- Sonobiología
- Mindfulness y presencia
- Consciencia y fenómenos extraordinarios

¿Sobre qué aspecto específico de tu investigación necesitas asesoría?

*[Verifica que GOOGLE_AI_API_KEY esté correctamente configurada para respuestas completas con Gemini.]*`
    : `As a neuroscience research assistant, I can help you with:

🔬 **Methodology**: Experimental design, participant selection, research protocols
📊 **Data analysis**: Inferential statistics, neuroimaging analysis, EEG/fNIRS signal processing
📝 **Scientific writing**: Paper structure, literature review, scientific argumentation
🎯 **Planning**: Research timeline, specific objectives, hypotheses

**Neuroscience specialty areas:**
- Interpersonal brain synchrony
- Effects of gratitude and silence
- Sonobiology
- Mindfulness and presence
- Consciousness and extraordinary phenomena

What specific aspect of your research do you need guidance on?

*[Verify that GOOGLE_AI_API_KEY is correctly configured for complete responses with Gemini.]*`;
}
