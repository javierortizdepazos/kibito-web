/**
 * Diccionario bilingüe (ES/EN) del portal. Los nombres propios (restaurantes,
 * personas, empresas, platos de menú, tags de sector/etapa) NO se traducen —
 * solo la interfaz y los textos narrativos.
 */
export type Lang = "es" | "en";

type Dict = Record<string, { es: string; en: string }>;

export const I18N: Dict = {
  // ---------- Sidebar nav ----------
  "nav.welcome": { es: "Welcome", en: "Welcome" },
  "nav.chat": { es: "Kibito AI", en: "Kibito AI" },
  "nav.meetkibo": { es: "Meet Kibo", en: "Meet Kibo" },
  "nav.meetkibo_principles": { es: "Our Principles", en: "Our Principles" },
  "nav.meetkibo_team": { es: "Team", en: "Team" },
  "nav.meetkibo_alumni": { es: "Alumni", en: "Alumni" },
  "nav.meetkibo_portfolio": { es: "Portfolio founders", en: "Portfolio founders" },
  "nav.network": { es: "Red profesional", en: "Professional Network" },
  "nav.network_vc": { es: "Fondos VC", en: "VC Funds" },
  "nav.network_vd": { es: "Venture Debt", en: "Venture Debt" },
  "nav.network_pf": { es: "Financiación pública", en: "Public Funding" },
  "nav.network_legal": { es: "Legal", en: "Legal" },
  "nav.network_rec": { es: "Recruiters", en: "Recruiters" },
  "nav.network_press": { es: "Prensa", en: "Press" },
  "nav.network_adv": { es: "Advisors", en: "Advisors" },
  "nav.network_other": { es: "Otras solicitudes", en: "Other requests" },
  "nav.guides": { es: "Guías & Playbooks", en: "Guides & Playbooks" },
  "nav.guides_reporting": { es: "Reporting", en: "Reporting" },
  "nav.guides_board": { es: "Board Meetings", en: "Board Meetings" },
  "nav.guides_pitch": { es: "Pitch Deck", en: "Pitch Deck" },
  "nav.guides_fund": { es: "Fundraising", en: "Fundraising" },
  "nav.guides_vc101": { es: "VC 101", en: "VC 101" },
  "nav.guides_inst": { es: "Institucional", en: "Institutional" },
  "nav.restaurants": { es: "Restaurantes", en: "Restaurants" },
  "nav.perks": { es: "Perks & Beneficios", en: "Perks & Benefits" },
  "nav.calendar": { es: "Calendar & Events", en: "Calendar & Events" },
  "nav.cal_future": { es: "Ecosystem & Kibo Events", en: "Ecosystem & Kibo Events" },
  "nav.cal_hosted": { es: "Kibo Hosted Events", en: "Kibo Hosted Events" },
  "nav.other": { es: "Other", en: "Other" },
  "nav.other_ai": { es: "AI Repository", en: "AI Repository" },
  "nav.other_recs": { es: "Our top recommendations for you", en: "Our top recommendations for you" },
  "nav.logout": { es: "Cerrar sesión", en: "Log out" },
  "nav.footer": { es: "Portal de la comunidad de founders de Kibo Ventures", en: "Kibo Ventures founder community portal" },

  // ---------- Common UI ----------
  "common.search": { es: "Buscar…", en: "Search…" },
  "common.searchNamePosition": { es: "Buscar por nombre o puesto…", en: "Search by name or role…" },
  "common.searchNameCuisine": { es: "Buscar por nombre o cocina…", en: "Search by name or cuisine…" },
  "common.searchNameCompany": { es: "Buscar por nombre o empresa…", en: "Search by name or company…" },
  "common.allSectors": { es: "Todos los sectores", en: "All sectors" },
  "common.allFunds": { es: "Todos los fondos", en: "All funds" },
  "common.allLocations": { es: "Todas las ubicaciones", en: "All locations" },
  "common.allFormality": { es: "Cualquier formalidad", en: "Any dress code" },
  "common.allYears": { es: "Todos los años", en: "All years" },
  "common.allTags": { es: "Todas las etiquetas", en: "All tags" },
  "common.all": { es: "Todos", en: "All" },
  "common.noResults": { es: "Sin resultados", en: "No results" },
  "common.noResultsPeriod": { es: "Sin resultados.", en: "No results." },
  "common.of": { es: "de", en: "of" },
  "common.openDoc": { es: "Ver documento", en: "View document" },
  "common.linkedin": { es: "LinkedIn", en: "LinkedIn" },
  "common.website": { es: "Sitio web", en: "Website" },
  "common.address": { es: "Dirección", en: "Address" },
  "common.close": { es: "Cerrar", en: "Close" },
  "common.send": { es: "Enviar", en: "Send" },
  "common.sending": { es: "Enviando…", en: "Sending…" },
  "common.sectionNotFound": { es: "Sección no encontrada.", en: "Section not found." },
  "common.error": { es: "No se pudo enviar la solicitud. Inténtalo de nuevo.", en: "Couldn't send the request. Please try again." },

  // ---------- Table headers ----------
  "th.name": { es: "Nombre", en: "Name" },
  "th.position": { es: "Posición", en: "Position" },
  "th.contact": { es: "Contacto", en: "Contact" },
  "th.currently": { es: "Actualmente", en: "Currently" },
  "th.founder": { es: "Founder", en: "Founder" },
  "th.company": { es: "Empresa", en: "Company" },
  "th.sector": { es: "Sector", en: "Sector" },
  "th.fund": { es: "Fondo", en: "Fund" },
  "th.location": { es: "Ubicación", en: "Location" },
  "th.date": { es: "Fecha", en: "Date" },
  "th.title": { es: "Título", en: "Title" },
  "th.tags": { es: "Etiquetas", en: "Tags" },
  "th.notes": { es: "Notas", en: "Notes" },

  // ---------- Welcome (content pane) ----------
  "welcome.badge": { es: "Kibo Ventures · Founder Community", en: "Kibo Ventures · Founder Community" },
  "welcome.titleHtml": {
    es: 'BIENVENIDO A LA FAMILIA <span class="hl hl-yellow">KIBO</span>',
    en: 'WELCOME TO THE <span class="hl hl-yellow">KIBO FAMILY</span>',
  },
  "welcome.lead": {
    es: "Nuestra prioridad como inversores es ayudaros con todos los recursos que tenemos para que las cosas avancen de forma más inteligente y rápida. Por eso hemos creado este portal, donde reunimos recomendaciones, buenas prácticas y materiales útiles que os pueden ayudar en cualquier etapa. Seguimos trabajando en nuevas secciones y estamos abiertos a mejorar, ¡así que no dudéis en compartir vuestro feedback con nosotros!",
    en: "Our priority as investors is to help you with all the resources we have for things to move smarter and faster. Hence, we have created this portal to put together recommendations, best practices and helpful materials which can help you at all stages. We are continuously working on new sections and open to improvement, so please feel free to share your feedback with us!",
  },
  "welcome.resourcesTitle": { es: "Recursos Clave para Founders", en: "Key Resources for Founders" },
  "welcome.resourcesDesc": { es: "Todo lo que necesitas para escalar tu startup con el respaldo de Kibo Ventures.", en: "Everything you need to scale your startup backed by Kibo Ventures." },
  "welcome.card1.title": { es: "Meet Kibo & Team", en: "Meet Kibo & Team" },
  "welcome.card1.desc": { es: "Conoce los principios que nos guían, nuestro equipo inversor, red de alumni y founders del portfolio.", en: "Get to know the principles that guide us, our investment team, alumni network and portfolio founders." },
  "welcome.card1.link": { es: "Explorar Kibo", en: "Explore Kibo" },
  "welcome.card2.title": { es: "Red Profesional", en: "Professional Network" },
  "welcome.card2.desc": { es: "Accede a contactos de fondos VC amigos, venture debt, ayudas públicas, despachos legales y recruiters.", en: "Access contacts from friendly VC funds, venture debt, public funding, law firms and recruiters." },
  "welcome.card2.link": { es: "Ver red de contactos", en: "View network" },
  "welcome.card3.title": { es: "Guías & Playbooks", en: "Guides & Playbooks" },
  "welcome.card3.desc": { es: "Plantillas de board meetings, guía para preparar tu ronda Series A/B y mejores prácticas de reporting.", en: "Board meeting templates, a guide to prepare your Series A/B round, and reporting best practices." },
  "welcome.card3.link": { es: "Consultar guías", en: "Browse guides" },
  "welcome.card4.title": { es: "Perks & Descuentos", en: "Perks & Discounts" },
  "welcome.card4.desc": { es: "Beneficios exclusivos negociados por Kibo con proveedores de cloud (AWS), SaaS y herramientas de escala.", en: "Exclusive perks negotiated by Kibo with cloud (AWS), SaaS and scaling tool providers." },
  "welcome.card4.link": { es: "Ver beneficios", en: "View perks" },
  "welcome.card5.title": { es: "The Kibo List (Restaurantes)", en: "The Kibo List (Restaurants)" },
  "welcome.card5.desc": { es: "Recomendaciones seleccionadas por el equipo para comidas de trabajo y cenas de founders por ciudad.", en: "Team-curated recommendations for business meals and founder dinners, by city." },
  "welcome.card5.link": { es: "Ver restaurantes", en: "View restaurants" },
  "welcome.card6.title": { es: "Asistente IA Kibito", en: "Kibito AI Assistant" },
  "welcome.card6.desc": { es: "Pregunta cualquier duda sobre el portafolio, pide recomendaciones o solicita introducciones al equipo.", en: "Ask anything about the portfolio, get recommendations, or request introductions from the team." },
  "welcome.card6.link": { es: "Abrir Kibito", en: "Open Kibito" },
  "welcome.feedbackTitle": { es: "Estamos continuamente trabajando en nuevas secciones", en: "We're continuously working on new sections" },
  "welcome.feedbackText": {
    es: "Tu feedback nos ayuda a mejorar. ¿Echas en falta algún contacto o recurso? Puedes comentárselo a Kibito o a tu contacto en Kibo.",
    en: "Your feedback helps us improve. Missing a contact or resource? Let Kibito know, or reach out to your contact at Kibo.",
  },
  "welcome.askKibito": { es: "Preguntar a Kibito", en: "Ask Kibito" },

  // ---------- Chat welcome (Kibito AI tab) ----------
  "chat.titleHtml": {
    es: 'Bienvenido a tu <span class="hl hl-red">Camino</span> con Kibo',
    en: 'Welcome to your <span class="hl hl-red">Path</span> with Kibo',
  },
  "chat.subtitle": {
    es: "Contactos, restaurantes, guías y documentos de Kibo. Si quieres contactar a alguien, Kibito prepara la solicitud para que el equipo la apruebe.",
    en: "Kibo's contacts, restaurants, guides and documents. If you want to reach out to someone, Kibito prepares the request for the team to approve.",
  },
  "chat.suggestion1": { es: "¿Qué fondos VC hay en USA?", en: "What VC funds are there in the US?" },
  "chat.suggestion2": { es: "Sitios para cenar en Madrid, algo formal", en: "Places to have dinner in Madrid, somewhere formal" },
  "chat.suggestion3": { es: "Pásame la plantilla de board deck", en: "Send me the board deck template" },
  "chat.suggestion4": { es: "Quiero pedir una intro con Sequoia", en: "I'd like to request an intro to Sequoia" },
  "chat.suggestion1Short": { es: "¿Qué fondos VC hay en USA?", en: "VC funds in the US?" },
  "chat.suggestion2Short": { es: "Cenar en Madrid, formal", en: "Dinner in Madrid, formal" },
  "chat.suggestion3Short": { es: "La plantilla de board deck", en: "The board deck template" },
  "chat.suggestion4Short": { es: "Pedir una intro con un fondo", en: "Request an intro to a fund" },
  "chat.placeholder": { es: "Escribe tu pregunta a Kibito…", en: "Type your question for Kibito…" },
  "chat.thinking": { es: "Pensando…", en: "Thinking…" },
  "chat.noReply": { es: "No he podido responder ahora mismo.", en: "I couldn't reply right now." },
  "chat.noBackend": { es: "No he podido conectar con el backend todavía.", en: "Couldn't connect to the backend yet." },

  // ---------- Our Principles ----------
  "principles.subtitle": { es: "El manifiesto y los valores que guían a Kibo Ventures.", en: "The manifesto and values that guide Kibo Ventures." },
  "principles.manifesto": { es: "Manifiesto", en: "Manifesto" },
  "principles.pullquote": {
    es: "Emprender no consiste en ser poco convencional; consiste en demostrar un coraje excepcional.",
    en: "Entrepreneurship isn't about being unconventional; it's about showcasing exceptional courage.",
  },
  "principles.p1": {
    es: "Esta creencia tiene sus raíces en nuestra propia experiencia como founders. Nos alimentamos de la pasión que nuestros founders sienten por sus empresas. Sentimos que sus empresas son también nuestras empresas. Hacemos los deberes e investigamos a fondo —su market fit, su preparación para escalar, su impacto social y ambiental— antes de sumarlas a nuestra cartera. Una vez dentro, las cosas suelen moverse rápido. Y si no es así, seguimos con nuestros founders a largo plazo. De verdad.",
    en: "This belief is rooted in our own experiences as founders. We thrive on the passion our founders have for their companies. We feel their companies are also our companies. We do our homework and research the hell out of them — their market fit, their readiness to scale, their social and environmental impact — before we add them to our portfolios. Once in, things tend to move fast. And, if they don't, we stick with our founders for the long haul. Really.",
  },
  "principles.p2": {
    es: "Nuestra tesis de inversión funciona. Nuestro track record lo demuestra. Nuestros founders serán los primeros en confirmarlo. Tras una salida a bolsa o convertirse en unicornio, muchos de ellos han pasado a invertir en nuestros otros fondos, devolviendo algo al ecosistema.",
    en: "Our investment thesis works. Our track record proves it. Our founders will be the first to confirm it. After IPO or unicorning, many of them have gone on to become investors in our other funds, giving back to the ecosystem.",
  },
  "principles.p3": {
    es: "Sabemos que, en última instancia, depende del founder encontrar al inversor adecuado. Y que nosotros no somos los únicos. Pero tenernos en el cap table, liderando o co-liderando, es un sello de aprobación.",
    en: "We know it is ultimately up to the founder to find the right investor. And that we are not the only one. But having us at the cap table, to lead or co-lead, is a stamp of approval.",
  },
  "principles.p4": {
    es: "En resumen, somos el socio sólido en el que puedes confiar. Nuestros valores fundamentales de Pasión, Confianza, Ayuda y Ambición no son un adorno. Son hechos que nos han guiado desde ser una pequeña firma hasta crear una gestora de venture capital que nos enorgullece dirigir y en la que nos enorgullece trabajar. Una familia. Estamos deseando conocer a la próxima década de emprendedores 'locos' que quieran formar parte de ella.",
    en: "In short, we're the solid partner you can trust. Our core values of Passion, Trust, Help, and Ambition are not fluff. They are facts that have guided us from being a small shop to creating a VC firm we're proud to run and work for. A family. We look forward to meeting the next decade of 'crazy' entrepreneurs who want to be a part of it.",
  },
  "principles.visionLabel": { es: "Visión y Misión", en: "Vision & Mission" },
  "principles.visionText": {
    es: "Financiar y apoyar a founders excepcionales que aporten soluciones positivas a los mayores retos de la humanidad a través de la tecnología, generando a la vez rentabilidades de primer cuartil para nuestros inversores.",
    en: "To fund and support outstanding founders who bring positive solutions to humanity's biggest challenges through technology, while generating top quartile returns for our investors.",
  },
  "principles.col1Title": { es: "Cómo trabajamos en Kibo", en: "How do we work @ Kibo" },
  "principles.col1.li1": { es: "Jugamos en equipo, ganando y perdiendo juntos", en: "Team players, succeeding and failing together" },
  "principles.col1.li2": { es: "Capital paciente: no hay atajos y los grandes resultados tardan años en materializarse", en: "Patient capital, there are no shortcuts and big outcomes take years to materialize" },
  "principles.col1.li3": { es: "Socios de apoyo, no gestionamos las empresas", en: "Supporting partners, we do not manage companies" },
  "principles.col1.li4": { es: "Abiertos a co-inversores: los inversores relevantes siempre son bienvenidos", en: "Co-investor friendly, relevant investors are always welcome" },
  "principles.col1.li5": { es: "Humildes y con los pies en la tierra – los mejores LPs y founders nos eligen", en: "Humble and grounded – best LPs and founders choose us" },
  "principles.col1.li6": { es: "Negocio de relaciones con visión a largo plazo", en: "Relationship business with a long-term vision" },
  "principles.col1.li7": { es: "La integridad, la honestidad y la confianza son clave para construir nuestro negocio", en: "Integrity, honesty and trust are key to building our business" },
  "principles.col2Title": { es: "Cómo trabajamos con nuestra comunidad", en: "How do we work with our community" },
  "principles.col2.li1": { es: "Creemos en el poder de nuestra red y comunidad", en: "We believe in the power of our network and community" },
  "principles.col2.li2": { es: "Papel activo usando todos los recursos que tenemos para ayudar a nuestras empresas a trabajar de forma más inteligente", en: "Active role in using all the resources we have to help our companies work smarter" },
  "principles.col2.li3": { es: "Amigos de las empresas, alineando los intereses entre founders, inversores y empleados", en: "Company friendly, aligning interests amongst founders, investors and employees" },
  "principles.col2.li4": { es: "Construir las mejores empresas requiere contratar al mejor talento", en: "Building best companies requires recruiting the best talent" },
  "principles.col2.li5": { es: "Ser buenos no es suficiente: buscamos un posicionamiento realmente único", en: "Great just isn't good enough, we look for truly and unique positioning" },
  "principles.col2.li6": { es: "Comprometidos a devolver algo a nuestra comunidad", en: "Committed to giving back to our community" },
  "principles.col2.li7": { es: "Impulsamos un impacto positivo global a la vez que logramos rentabilidades superiores para nuestros LPs", en: "Driving global positive impact while achieving superior returns to our LP's" },
  "principles.sustainability": { es: "Sostenibilidad y Gobernanza", en: "Sustainability & Governance" },
  "principles.sustain1": {
    es: "En Kibo Ventures somos muy conscientes de los retos a los que se enfrentan nuestro planeta y nuestra sociedad, y creemos que podemos ayudar a construir un futuro mejor.",
    en: "At Kibo Ventures we are very aware of the challenges faced by our planet and society, and we believe we can help shape a better future.",
  },
  "principles.sustain2": {
    es: "Desde el principio, hemos asumido la responsabilidad de invertir en proyectos que no solo sean rentables, sino también éticamente sólidos, respetuosos con el medio ambiente y socialmente responsables. Con un compromiso inquebrantable, nos aseguramos de que nuestras inversiones estén alineadas con el bien común, dejando una huella positiva y duradera en el mundo. Por eso, para nosotros ESG no es una palabra de moda, sino un principio rector.",
    en: "From the very beginning, we have embraced the responsibility of investing in ventures that are not only financially rewarding but also ethically sound, environmentally conscious, and socially responsible. With unwavering commitment, we ensure that our investments align with the greater good, leaving a positive and lasting imprint on the world. Thus, for us ESG is not a buzzword, but a guiding principle.",
  },

  // ---------- Team / Alumni / Portfolio ----------
  "team.subtitle": { es: "El equipo actual de Kibo Ventures.", en: "Kibo Ventures' current team." },
  "team.photoAlt": { es: "Equipo de Kibo Ventures", en: "Kibo Ventures team" },
  "alumni.title": { es: "Kibo Alumni", en: "Kibo Alumni" },
  "alumni.subtitle": { es: "Antiguos analistas e interns de Kibo, y en qué andan ahora.", en: "Former Kibo analysts and interns, and what they're up to now." },
  "portfolio.subtitle": { es: "Founders y co-founders de las startups del portfolio.", en: "Founders and co-founders of portfolio startups." },

  // ---------- Network pages ----------
  "network.subtitle": { es: "{n} contactos en esta lista. Por privacidad, los datos de contacto no son visibles — pide una intro y el equipo de Kibo os pone en contacto.", en: "{n} contacts in this list. For privacy, contact details aren't visible — request an intro and the Kibo team will connect you." },
  "network.vc.title": { es: "Conoce a nuestros fondos VC amigos", en: "Meet our VC friends" },
  "network.vd.title": { es: "Conoce a nuestros amigos de Venture Debt", en: "Meet our Venture Debt friends" },
  "network.pf.title": { es: "Desbloquea financiación pública", en: "Unlock Public Funding" },
  "network.legal.title": { es: "Abogados expertos a tu servicio", en: "Expert Legal Advisors at Your Service" },
  "network.rec.title": { es: "… y Recruiters", en: "… and Recruiters" },
  "network.press.title": { es: "… incluso Prensa & Medios", en: "… even Press & Media" },
  "network.adv.title": { es: "… y otros advisors", en: "… and any other advisors" },
  "th.fund2": { es: "Fondo", en: "Fund" },
  "th.stage": { es: "Etapa", en: "Stage" },
  "th.hqCountry": { es: "País HQ", en: "HQ Country" },
  "th.geoFocus": { es: "Foco geo", en: "Geo focus" },
  "th.ticket": { es: "Ticket", en: "Ticket" },
  "th.type": { es: "Tipo", en: "Type" },
  "th.lawFirm": { es: "Despacho", en: "Law firm" },
  "th.specialization": { es: "Especialidad", en: "Specialization" },
  "th.media": { es: "Medio", en: "Media" },
  "th.requestIntro": { es: "Request intro", en: "Request intro" },

  // ---------- Request intro / Other requests ----------
  "intro.title": { es: "Request intro", en: "Request intro" },
  "intro.contactLabel": { es: "Contacto solicitado:", en: "Requested contact:" },
  "intro.yourName": { es: "Tu nombre", en: "Your name" },
  "intro.startup": { es: "Startup", en: "Startup" },
  "intro.yourEmail": { es: "Tu email", en: "Your email" },
  "intro.reason": { es: "¿Por qué quieres esta intro?", en: "Why do you want this intro?" },
  "intro.submit": { es: "Enviar solicitud", en: "Send request" },
  "intro.success.title": { es: "¡Solicitud enviada!", en: "Request sent!" },
  "intro.success.text": { es: "El equipo de Kibo la revisará y os pondrá en contacto con {contact} lo antes posible.", en: "The Kibo team will review it and put you in touch with {contact} as soon as possible." },
  "other.subtitle": { es: "¿Necesitas un contacto, un tipo de recurso o una intro que no ves en el portal? Cuéntanoslo aquí y el equipo de Kibo lo revisa.", en: "Need a contact, a type of resource, or an intro you don't see in the portal? Tell us here and the Kibo team will review it." },
  "other.callout": { es: "Esto no es un chat automático — tu mensaje llega directo al equipo de Kibo por Slack, y os contactamos nosotros para gestionarlo.", en: "This isn't an automated chat — your message goes straight to the Kibo team on Slack, and we'll reach out to handle it." },
  "other.whatNeed": { es: "¿Qué necesitas?", en: "What do you need?" },
  "other.whatNeedPlaceholder": { es: "Ej: un despacho especializado en propiedad intelectual", en: "E.g.: a law firm specialized in intellectual property" },
  "other.tellMore": { es: "Cuéntanos más", en: "Tell us more" },
  "other.success.title": { es: "¡Solicitud enviada!", en: "Request sent!" },
  "other.success.text": { es: "El equipo de Kibo la ha recibido y os contactará en cuanto pueda gestionarla.", en: "The Kibo team has received it and will reach out as soon as they can handle it." },

  // ---------- Guides ----------
  "guides.subtitle": { es: "Guías y plantillas para fundraising, board meetings y reporting.", en: "Guides and templates for fundraising, board meetings and reporting." },
  "guides.docsCount": { es: "{n} documentos", en: "{n} documents" },
  "guides.checklistComplete": { es: "Checklist completo", en: "Complete checklist" },
  "guides.fund.title": { es: "Cómo bordar tu nueva ronda", en: "How to nail your new round" },
  "guides.fund.callout": {
    es: 'Preparar una nueva ronda puede ser duro. Se necesitan muchos documentos y hay que prepararlos con antelación. Aquí tienes una guía para preparar la tuya.<br><br>Para consejos sobre cómo preparar un deck visita <a href="#" data-goto="guides-pitch" style="font-weight:600;">Your Guide to a Winning Deck (Series A/B)</a>.',
    en: 'Preparing a new round can be tough. Lots of documents are needed and they have to be prepared ahead of time. Here you can find a guide for preparing yours.<br><br>For tips on how to prepare a deck visit <a href="#" data-goto="guides-pitch" style="font-weight:600;">Your Guide to a Winning Deck (Series A/B)</a>.',
  },
  "guides.fund.nutshell": { es: "Preparar la ronda en pocas palabras", en: "Preparing the round in a nutshell" },
  "guides.dataRoom": { es: "Data Room", en: "Data Room" },
  "guides.pitch.title": { es: "Tu Guía para un Deck Ganador (Series A/B)", en: "Your Guide to a Winning Deck (Series A/B)" },
  "guides.pitch.callout": {
    es: "Levantar una ronda con éxito siempre empieza con un deck, y es la piedra angular de cualquier data-room. Para nosotros la clave está en ser simples pero con contenido. Aquí tienes una plantilla y buenas prácticas para hacer un deck que impacte.",
    en: "Successful fundraising always starts with a deck, and it is the cornerstone of any data-room. For us the key, is to be simple, yet insightful. Here you can find a template and some best practices for making insightful board deck.",
  },
  "guides.pitch.li1": {
    es: "Esta plantilla está pensada para que founders / CEOs preparen cualquier pitch deck para levantar una ronda. La hemos construido teniendo en cuenta las mejores prácticas de algunas empresas del portfolio de Kibo Ventures.",
    en: "This template is intended to be used by founders / CEOs to help prepare any pitch deck for fundraising. We have built it taking into account the best practices from some of Kibo Ventures' portfolio companies.",
  },
  "guides.contactUs": { es: "Como siempre, ¡si tienes cualquier duda o petición, contáctanos!", en: "As always, if any doubt/request arises, just contact us!" },
  "guides.howToUse": { es: "¿Cómo usar esta plantilla?", en: "How to use this template?" },
  "guides.pitch.li2a": { es: "Puede servir como base para crear tu primer deck.", en: "This could serve as a base for creating your first deck." },
  "guides.pitch.li2b": {
    es: "Aun así, no es exhaustiva y siempre debe adaptarse al mensaje que quieras transmitir.",
    en: "Nonetheless, it is non-exhaustive and it should always be tailored to the message that you want to share.",
  },
  "guides.copyUse": { es: "Puedes copiar, cambiar, reordenar y usar esta plantilla como quieras", en: "You can copy, change, re-order and use this template as you want" },
  "guides.download": { es: "Descargar", en: "Download" },
  "guides.otherReads": { es: "Otras lecturas", en: "Other reads" },
  "guides.board.title": { es: "Cómo hacer board meetings de primer nivel", en: "How to do first-class board meetings" },
  "guides.board.callout": {
    es: "Los board meetings exitosos son una de las piedras angulares para construir empresas de alto rendimiento. Y para tener discusiones de board de primer nivel, hay que preparar materiales de primer nivel. Aquí tienes una plantilla y buenas prácticas para hacer un board deck que aporte valor.",
    en: "Successful board meetings are one of the cornerstones to building top-performing companies. And in order to have first-class board discussions, first-class materials should be prepared. Here you can find a template and some best practices for making insightful board deck.",
  },
  "guides.board.li1": {
    es: "Esta plantilla está pensada para que founders / CEOs preparen cualquier board meeting. La hemos construido teniendo en cuenta las mejores prácticas de algunas empresas del portfolio de Kibo Ventures.",
    en: "This template is intended to be used by founders / CEOs to help prepare any board meeting. We have built it taking into account the best practices from some of Kibo Ventures' portfolio companies.",
  },
  "guides.board.li2a": { es: "Puede servir como base para crear tu primer board deck.", en: "This could serve as a base for creating your first board deck." },
  "guides.board.li2b": {
    es: "Aun así, no es exhaustiva y siempre debe adaptarse al mensaje que quieras transmitir. Cada board es distinto y el board deck se reconstruirá una y otra vez a medida que tu empresa crezca.",
    en: "Nonetheless, it is non-exhaustive and it should always be tailored to the message that you want to share. Each board is different and the board deck will be re-built again and again while your company grows.",
  },
  "guides.board.li3": {
    es: "Algunos comentarios se incluyen entre corchetes y en cursiva. Cuando la uses, simplemente elimínalos.",
    en: "Some comments will be included between brackets and in italics. When you use it, just remove them.",
  },
  "guides.pitchOtherLink": { es: "Plantilla de Creandum para Series A", en: "Creandum Series A template" },
  "guides.boardOtherLink": { es: "Los boards están infravalorados", en: "Boards are underrated" },
  "guides.reporting.title": { es: "Cómo mejorar mis habilidades de reporting", en: "How can I improve my reporting skills" },
  "guides.reporting.callout": {
    es: "Sabemos que el reporting puede ser tedioso. Aquí tienes plantillas sencillas que puedes usar. Además, algunas empresas de nuestro portfolio han perfeccionado el arte del reporting — ¡hemos añadido sus plantillas como ejemplo!",
    en: "We know that reporting can be tedious. Here you can find easy templates you can use. Furthermore, some of our portfolio companies have perfected the art of reporting — we've added their templates as examples!",
  },
  "guides.reporting.lead": {
    es: "El reporting no solo es importante para nosotros. Está demostrado que las empresas que mejor reportan, mejor rinden. Tener buenas técnicas de reporting ayuda a los founders a hacer un seguimiento fiel del desarrollo del negocio y tomar decisiones mejores y más sólidas. Un mejor reporting nos da una imagen más clara de la empresa, permitiéndonos daros mejores consejos y perspectivas.",
    en: "Reporting is not only important for us. It is proven that companies who report best, perform best. Having strong reporting techniques helps founders to faithfully track the development of the business and make better and sounder decisions. Better reporting gives us a clearer picture of the company, allowing us to give you better insights and advice.",
  },
  "guides.reporting.kiboTemplates": { es: "Plantillas de Kibo", en: "Kibo templates" },
  "guides.reporting.kiboTemplatesDesc": { es: "Nuestras plantillas propias, listas para usar desde ya.", en: "Our own templates, ready to use right away." },
  "guides.reporting.emailExamples": { es: "Ejemplos de email", en: "Email template examples" },
  "guides.reporting.emailExamplesDesc": { es: "Cómo comunican sus resultados otras compañías del portfolio.", en: "How other portfolio companies communicate their results." },
  "guides.reporting.kpiExamples": { es: "Ejemplos de KPIs y financials", en: "KPI & financials examples" },
  "guides.reporting.kpiExamplesDesc": { es: "Cuadros de mando reales de startups del portfolio.", en: "Real dashboards from portfolio startups." },
  "guides.vc101.title": { es: "Venture Capital 101: Tus primeros pasos en VC", en: "Venture Capital 101: Your First Steps in VC" },
  "guides.vc101.subtitle": {
    es: "Un curso completo sobre cómo funciona el venture capital, de principio a fin.",
    en: "A complete course on how venture capital works, from start to finish.",
  },
  "guides.vc101.intro": {
    es: "Este es el temario completo de un curso universitario de Venture Capital (MGMT 264): sesiones en orden, casos prácticos (\"caselettes\") y lecturas esenciales sobre cómo se estructuran, evalúan y negocian las inversiones de VC. Ideal tanto si eres founder por primera vez como si quieres entender mejor cómo pensamos los inversores.",
    en: "This is the full syllabus of a university Venture Capital course (MGMT 264): sessions in order, hands-on case studies (\"caselettes\"), and essential readings on how VC investments are structured, evaluated and negotiated. Useful whether you're a first-time founder or just want to understand how investors think.",
  },
  "guides.vc101.sessions": { es: "Sesiones del curso", en: "Course sessions" },
  "guides.vc101.sessionsDesc": { es: "15 sesiones, en orden, desde la industria del VC hasta la negociación del term sheet.", en: "15 sessions, in order, from the VC industry to negotiating the term sheet." },
  "guides.vc101.caselettes": { es: "Caselettes", en: "Caselettes" },
  "guides.vc101.caselettesDesc": { es: "Casos prácticos para aplicar lo aprendido en cada etapa de una ronda.", en: "Hands-on case studies applying what you've learned at each stage of a round." },
  "guides.vc101.readings": { es: "Lecturas esenciales", en: "Essential readings" },
  "guides.vc101.readingsDesc": { es: "Artículos y notas de referencia sobre la industria, valoración y documentos legales.", en: "Reference articles and notes on the industry, valuation and legal documents." },

  // ---------- Overview pages ----------
  "ov.meetkibo.subtitle": { es: "El equipo, los alumni y los founders del portfolio.", en: "The team, alumni and portfolio founders." },
  "ov.meetkibo.principles": { es: "Manifesto y valores", en: "Manifesto & values" },
  "ov.people": { es: "{n} personas", en: "{n} people" },
  "ov.alumni": { es: "{n} alumni", en: "{n} alumni" },
  "ov.founders": { es: "{n} founders", en: "{n} founders" },
  "ov.contacts": { es: "{n} contactos", en: "{n} contacts" },
  "ov.documents": { es: "{n} documentos", en: "{n} documents" },
  "ov.restaurants": { es: "{n} restaurantes", en: "{n} restaurants" },
  "ov.events": { es: "{n} eventos", en: "{n} events" },
  "ov.resources": { es: "{n} recursos", en: "{n} resources" },
  "ov.recommendations": { es: "{n} recomendaciones", en: "{n} recommendations" },
  "ov.pending": { es: "Pendiente", en: "Pending" },
  "ov.network.subtitle": { es: "Fondos, venture debt, legal, recruiters, prensa y advisors.", en: "Funds, venture debt, legal, recruiters, press and advisors." },
  "ov.network.other": { es: "Pide lo que no encuentres", en: "Ask for what you can't find" },
  "ov.restaurants.title": { es: "Restaurantes", en: "Restaurants" },
  "ov.restaurants.subtitle": { es: "The Kibo List, por ciudad.", en: "The Kibo List, by city." },
  "ov.calendar.subtitle": { es: "Eventos pasados y futuros de Kibo y el ecosistema.", en: "Past and future events from Kibo and the ecosystem." },
  "ov.other.subtitle": { es: "Otros recursos: IA y recomendaciones del equipo.", en: "Other resources: AI and team recommendations." },

  // ---------- Restaurants ----------
  "rest.subtitle": { es: "{n} restaurantes recomendados por Kibo en {city}.", en: "{n} restaurants recommended by Kibo in {city}." },
  "rest.whatToOrder": { es: "Qué pedir", en: "What to order" },
  "rest.website": { es: "Sitio web", en: "Website" },
  "rest.bookTable": { es: "Reservar mesa", en: "Book a table" },

  // ---------- Perks ----------
  "perks.title": { es: "Descubre tus beneficios de la familia Kibo", en: "Discover your Kibo family perks" },
  "perks.subtitle": { es: "Beneficios exclusivos negociados por Kibo para las startups del portfolio.", en: "Exclusive perks negotiated by Kibo for portfolio startups." },
  "perks.open": { es: "Abrir", en: "Open" },
  "perks.getproven": { es: "¿Alguna duda o problema con el acceso a GetProven? Escribe a {email} y os ayudamos.", en: "Any questions or issues accessing GetProven? Email {email} and we'll help." },
  "perks.getproven.title": { es: "GetProven", en: "GetProven" },
  "perks.getproven.intro": {
    es: "🤑 Kibo Ventures se ha asociado con GetProven, una plataforma de perks que da a nuestras empresas del portfolio acceso a cientos de descuentos y ofertas exclusivas de proveedores, totalmente gratis de usar.<br><br>La mayoría de los perks están disponibles a través de GetProven. Para la oferta de créditos de la API de Anthropic, consulta la sección dedicada más abajo.",
    en: "🤑 Kibo Ventures has partnered with GetProven, a perks platform that gives our portfolio companies access to hundreds of exclusive vendor discounts and offers, completely free to use.<br><br>Most perks are available through GetProven. For the Anthropic API credits offer, please see the dedicated section below.",
  },
  "perks.getproven.stepsTitle": { es: "Cómo darte de alta", en: "How to sign up" },
  "perks.getproven.step1": { es: 'Ve a <strong>https://kiboventures.getproven.com</strong>', en: 'Go to <strong>https://kiboventures.getproven.com</strong>' },
  "perks.getproven.step2": { es: 'Haz clic en <strong>"Sign up"</strong>', en: 'Click <strong>"Sign up"</strong>' },
  "perks.getproven.step3": {
    es: "Introduce tu <strong>email profesional/de empresa</strong>: es importante, ya que solo se aceptan dominios de empresa autorizados",
    en: "Enter your <strong>professional/work email address</strong>: this is important, as only authorized company domains will be accepted",
  },
  "perks.getproven.step4": { es: "Completa el formulario de registro y verifica tu email si te lo piden", en: "Complete the registration form and verify your email if prompted" },
  "perks.getproven.step5": {
    es: "Una vez dentro, haz clic en el <strong>logo de Kibo</strong> en la esquina superior izquierda",
    en: 'Once logged in, click the <strong>Kibo logo</strong> in the top-left corner',
  },
  "perks.getproven.step6": { es: "Explora todos los vendors, perks y ofertas disponibles", en: "Browse all available vendors, perks, and offers" },
  "perks.getproven.openBtn": { es: "Abrir GetProven", en: "Open GetProven" },
  "perks.anthropic.title": { es: "Anthropic API Credits", en: "Anthropic API Credits" },
  "perks.anthropic.intro": {
    es: "Las empresas del portfolio de Kibo son elegibles para <strong>$15,000 en créditos de la API de Anthropic</strong>, límites de rate elevados, y acceso a un buzón de soporte dedicado.",
    en: "Kibo portfolio companies are eligible for <strong>$15,000 in Anthropic API credits</strong>, elevated rate limits, and access to a dedicated support inbox.",
  },
  "perks.anthropic.whatYouGet": { es: "Qué obtienes", en: "What you get" },
  "perks.anthropic.whatYouGetText": {
    es: 'Límites de rate elevados + soporte dedicado en: <a href="mailto:portfolio+kiboventures@anthropic.com">portfolio+kiboventures@anthropic.com</a>',
    en: 'Elevated rate limits + dedicated support at: <a href="mailto:portfolio+kiboventures@anthropic.com">portfolio+kiboventures@anthropic.com</a>',
  },
  "perks.anthropic.howToClaim": { es: "Cómo reclamar tus créditos", en: "How to claim your credits" },
  "perks.anthropic.claimText": { es: "Reclama la oferta a través del link dedicado de Anthropic:", en: "Claim the offer through the dedicated Anthropic link:" },
  "perks.anthropic.signInNote": {
    es: "Se te pedirá iniciar sesión en <strong>platform.claude.com</strong> o crear una cuenta de plataforma. Usa el email asociado a la cuenta de plataforma donde quieras que se apliquen los créditos.",
    en: "You will be asked to sign in to <strong>platform.claude.com</strong> or create a platform account. Please use the email associated with the platform account where you want the credits to be applied.",
  },
  "perks.anthropic.separateAccountNote": {
    es: "Ten en cuenta que tu cuenta de <strong>platform.claude.com</strong> es independiente de cualquier cuenta de <strong>claude.ai</strong> usada para suscripciones de Claude.",
    en: "Please note that your <strong>platform.claude.com</strong> account is separate from any <strong>claude.ai</strong> account used for Claude subscriptions.",
  },
  "perks.anthropic.whatCovers": { es: "Qué cubren los créditos", en: "What the credits cover" },
  "perks.anthropic.finalNote": {
    es: "Ten en cuenta que estos créditos no se pueden combinar con otros créditos de Anthropic y no se pueden usar para suscripciones de Claude Max o Claude for Teams.",
    en: "Note that these credits cannot be combined with other Anthropic credits and cannot be used for Claude Max or Claude for Teams subscriptions.",
  },

  // ---------- Calendar & Events ----------
  "cal.future.title": { es: "Marca tu calendario: Ecosystem & Kibo Events", en: "Mark your calendar: Ecosystem & Kibo Events" },
  "cal.future.callout": { es: "Este calendario todavía no está migrado — en Notion vivía como un calendario de Google embebido en vivo. Lo añadiremos más adelante.", en: "This calendar hasn't been migrated yet — in Notion it lived as a live embedded Google calendar. We'll add it soon." },
  "cal.hosted.subtitle": { es: "{n} eventos organizados o co-organizados por Kibo.", en: "{n} events organized or co-organized by Kibo." },

  // ---------- AI Repository / Top recommendations ----------
  "ai.subtitle": { es: "Lo último en IA compartido por la comunidad Kibo: herramientas, artículos, reports y vídeos.", en: "The latest in AI shared by the Kibo community: tools, articles, reports and videos." },
  "recs.subtitle": { es: "Abrimos las puertas a nuestro mundo de entretenimiento y conocimiento: libros, podcasts, series y más.", en: "We open the doors to our world of entertainment and knowledge: books, podcasts, shows and more." },
  "recs.toRead": { es: "Para leer", en: "To Read" },
  "recs.toReadDesc": { es: "Libros que nos han marcado, recomendados por el equipo.", en: "Books that have marked us, recommended by the team." },
  "recs.toListen": { es: "Para escuchar", en: "To Listen" },
  "recs.toListenDesc": { es: "Podcasts que escuchamos y os recomendamos.", en: "Podcasts we listen to and recommend." },
  "recs.toWatch": { es: "Para ver", en: "To Watch" },
  "recs.toWatchDesc": { es: "Series y documentales que merecen la pena.", en: "Shows and documentaries worth watching." },
  "recs.recommends": { es: "recomienda", en: "recommends" },
  "recs.by": { es: "de", en: "by" },
};

let currentLang: Lang = "es";

export function getLang(): Lang {
  return currentLang;
}

export function setCurrentLang(l: Lang) {
  currentLang = l;
}

export function t(key: string, vars?: Record<string, string>): string {
  const entry = I18N[key];
  let s = entry ? entry[currentLang] : key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  }
  return s;
}

/** Devuelve el campo traducido de un registro de datos si existe (`field + "_en"`), o el original. */
export function loc(record: any, field: string): string {
  if (!record) return "";
  if (currentLang === "en" && record[field + "_en"]) return record[field + "_en"];
  return record[field] ?? "";
}
