// UI translations. Static markup uses data-i18n* attributes; scripts call t().

export const LANGUAGES = ['es', 'en'];

const MESSAGES = {
  es: {
    'meta.description': 'Añade marcas de agua resistentes a tu DNI, contratos o facturas antes de compartirlos. Sin subir nada: todo ocurre en tu dispositivo.',
    'app.tagline': 'Marcas de agua para documentos que compartes',
    'top.netTitle': 'Estado de conexión',
    'top.online': 'En línea',
    'top.offline': 'Sin conexión',
    'top.install': 'Instalar app',
    'top.language': 'Idioma',
    'theme.label': 'Tema: {mode}',
    'theme.auto': 'automático',
    'theme.light': 'claro',
    'theme.dark': 'oscuro',

    'controls.aria': 'Opciones de la marca de agua',
    'privacy': '<strong>100&nbsp;% local.</strong> Tus archivos nunca salen de este dispositivo: no hay servidor, ni cuentas, ni subidas.',
    'drop.title': 'Arrastra aquí tu documento',
    'drop.sub': 'o pulsa para elegir · JPG, PNG, WEBP o PDF · también puedes pegar (Ctrl+V)',

    'text.legend': 'Texto de la marca',
    'text.label': '¿Para quién y para qué?',
    'text.placeholder': 'Ej.: Solo para Banco X · apertura de cuenta',
    'text.default': 'Copia protegida · uso exclusivo',
    'presets.aria': 'Sugerencias',
    'preset.identity.label': 'Verificación de identidad',
    'preset.identity': 'Solo para verificación de identidad',
    'preset.rental.label': 'Alquiler',
    'preset.rental': 'Solo para alquiler de vivienda',
    'preset.bank.label': 'Banco',
    'preset.bank': 'Solo para trámite bancario',
    'preset.job.label': 'Empleo',
    'preset.job': 'Solo para proceso de selección',
    'preset.copy.label': 'Copia no válida',
    'preset.copy': 'Copia — no válida para otros fines',
    'opt.date': 'Añadir fecha',
    'opt.trace': 'Código de rastreo',
    'trace.title': 'Código único de esta copia',
    'trace.regen': 'Nuevo código',
    'trace.hint': 'Usa un código distinto para cada destinatario: si aparece una copia filtrada sabrás de dónde salió.',
    'trace.prefix': 'Ref.',

    'look.legend': 'Aspecto',
    'look.color': 'Color',
    'color.red': 'Rojo',
    'color.blue': 'Azul',
    'color.black': 'Negro',
    'color.gray': 'Gris',
    'color.green': 'Verde',
    'look.opacity': 'Opacidad',
    'look.size': 'Tamaño del texto',
    'look.density': 'Densidad',
    'look.angle': 'Ángulo',
    'density.1': 'Baja',
    'density.2': 'Media-baja',
    'density.3': 'Media',
    'density.4': 'Alta',
    'density.5': 'Muy alta',

    'protect.legend': 'Protección',
    'protect.wave': '<strong>Texto ondulado e irregular</strong><br><small>Cada letra varía ligeramente de posición, giro y tono; dificulta borrarla con herramientas automáticas.</small>',
    'protect.guilloche': '<strong>Trama de seguridad</strong><br><small>Líneas finas entrelazadas, como en los billetes, que cruzan todo el documento.</small>',
    'protect.micro': '<strong>Microtexto</strong><br><small>Líneas diminutas con el código de rastreo entre filas.</small>',
    'protect.hint': 'El resultado se “aplana” en una imagen: la marca no es una capa que se pueda quitar del PDF. También se eliminan los metadatos (GPS, cámara…).',

    'export.legend': 'Exportar',
    'export.format': 'Formato',
    'export.download': 'Descargar',
    'export.share': 'Compartir…',

    'preview.aria': 'Vista previa',
    'preview.title': 'Vista previa',
    'preview.prev': 'Página anterior',
    'preview.next': 'Página siguiente',
    'preview.clear': 'Quitar',
    'preview.empty': 'Elige un documento para ver aquí cómo quedará.',
    'busy.default': 'Procesando…',

    'redact.label': 'Ocultar datos',
    'redact.aria': 'Herramienta para ocultar datos',
    'redact.none': 'Ver',
    'redact.none.title': 'Solo ver y seleccionar zonas',
    'redact.box': 'Tapar',
    'redact.box.title': 'Tapar con un bloque opaco (lo más seguro)',
    'redact.blur': 'Desenfocar',
    'redact.blur.title': 'Desenfocar la zona',
    'redact.pixelate': 'Pixelar',
    'redact.pixelate.title': 'Pixelar la zona',
    'redact.undo': 'Deshacer',
    'redact.delete': 'Eliminar zona',
    'redact.hint.none': 'Elige «Tapar», «Desenfocar» o «Pixelar» y arrastra sobre la vista previa para ocultar datos. Toca una zona para seleccionarla.',
    'redact.hint.box': 'Arrastra sobre la zona que quieras tapar. Es la opción más segura: el contenido desaparece por completo.',
    'redact.hint.blur': 'Arrastra sobre la zona que quieras desenfocar. El detalle se descarta de verdad, no es un simple filtro.',
    'redact.hint.pixelate': 'Arrastra sobre la zona que quieras pixelar.',
    'redact.count.one': '1 zona oculta en esta página.',
    'redact.count.other': '{count} zonas ocultas en esta página.',

    'log.aria': 'Registro de copias compartidas',
    'log.title': 'Registro de copias',
    'log.clear': 'Borrar registro',
    'log.hint': 'Se guarda solo en este navegador. Te ayuda a saber a quién diste cada código.',
    'footer.source': 'Código fuente en GitHub',
    'log.empty': 'Aún no has exportado ninguna copia.',
    'log.delete': 'Eliminar {code} del registro',
    'log.confirmClear': '¿Borrar todo el registro de copias?',

    'load.loading': 'Cargando…',
    'load.readingPage': 'Leyendo página {n} de {total}…',
    'load.unsupported': 'Formato no compatible. Usa una imagen o un PDF.',
    'load.noPages': 'El documento no tiene páginas.',
    'load.passwordFailed': 'No se pudo abrir el PDF protegido.',
    'load.failed': 'No se pudo abrir el archivo: {error}',
    'load.passwordPrompt': '«{name}» está protegido. Introduce la contraseña:',
    'load.passwordRetry': 'Contraseña incorrecta. Inténtalo de nuevo:',

    'export.renderingPage': 'Generando página {n} de {total}…',
    'export.renderingImage': 'Generando imagen {n} de {total}…',
    'export.imageFailed': 'No se pudo generar la imagen.',
    'export.failed': 'Error al exportar: {error}',
    'preview.rendering': 'Preparando página…',
    'preview.failed': 'No se pudo mostrar la página: {error}',
    'export.downloadedMany': '{count} archivos descargados',
    'export.downloadedOne': 'Descargado: {name}',
    'export.shareUnsupported': 'Tu navegador no permite compartir estos archivos. Usa «Descargar».',
    'export.shareTitle': 'Documento con marca de agua',

    'file.document': 'documento',
    'file.suffix': 'marca',
    'file.andMore': 'y-{count}-mas',
  },

  en: {
    'meta.description': 'Add tamper-resistant watermarks to your ID, contracts or invoices before sharing them. Nothing is uploaded: everything happens on your device.',
    'app.tagline': 'Watermarks for the documents you share',
    'top.netTitle': 'Connection status',
    'top.online': 'Online',
    'top.offline': 'Offline',
    'top.install': 'Install app',
    'top.language': 'Language',
    'theme.label': 'Theme: {mode}',
    'theme.auto': 'automatic',
    'theme.light': 'light',
    'theme.dark': 'dark',

    'controls.aria': 'Watermark options',
    'privacy': '<strong>100% local.</strong> Your files never leave this device: no server, no accounts, no uploads.',
    'drop.title': 'Drop your document here',
    'drop.sub': 'or tap to choose · JPG, PNG, WEBP or PDF · you can also paste (Ctrl+V)',

    'text.legend': 'Watermark text',
    'text.label': 'Who is it for, and why?',
    'text.placeholder': 'E.g.: Only for Bank X · account opening',
    'text.default': 'Protected copy · restricted use',
    'presets.aria': 'Suggestions',
    'preset.identity.label': 'Identity check',
    'preset.identity': 'Only for identity verification',
    'preset.rental.label': 'Rental',
    'preset.rental': 'Only for a home rental application',
    'preset.bank.label': 'Bank',
    'preset.bank': 'Only for a banking procedure',
    'preset.job.label': 'Job',
    'preset.job': 'Only for a job application',
    'preset.copy.label': 'Invalid copy',
    'preset.copy': 'Copy — not valid for any other purpose',
    'opt.date': 'Add date',
    'opt.trace': 'Tracking code',
    'trace.title': 'Unique code for this copy',
    'trace.regen': 'New code',
    'trace.hint': 'Use a different code for each recipient: if a copy leaks, you will know where it came from.',
    'trace.prefix': 'Ref.',

    'look.legend': 'Appearance',
    'look.color': 'Color',
    'color.red': 'Red',
    'color.blue': 'Blue',
    'color.black': 'Black',
    'color.gray': 'Gray',
    'color.green': 'Green',
    'look.opacity': 'Opacity',
    'look.size': 'Text size',
    'look.density': 'Density',
    'look.angle': 'Angle',
    'density.1': 'Low',
    'density.2': 'Medium-low',
    'density.3': 'Medium',
    'density.4': 'High',
    'density.5': 'Very high',

    'protect.legend': 'Protection',
    'protect.wave': '<strong>Wavy, irregular text</strong><br><small>Each letter varies slightly in position, rotation and tone, which makes automated removal harder.</small>',
    'protect.guilloche': '<strong>Security pattern</strong><br><small>Fine interlaced lines, like on banknotes, across the whole document.</small>',
    'protect.micro': '<strong>Microtext</strong><br><small>Tiny lines with the tracking code between rows.</small>',
    'protect.hint': 'The result is “flattened” into an image: the watermark is not a layer that can be removed from the PDF. Metadata (GPS, camera…) is stripped too.',

    'export.legend': 'Export',
    'export.format': 'Format',
    'export.download': 'Download',
    'export.share': 'Share…',

    'preview.aria': 'Preview',
    'preview.title': 'Preview',
    'preview.prev': 'Previous page',
    'preview.next': 'Next page',
    'preview.clear': 'Remove',
    'preview.empty': 'Choose a document to see how it will look.',
    'busy.default': 'Processing…',

    'redact.label': 'Hide data',
    'redact.aria': 'Tool for hiding data',
    'redact.none': 'View',
    'redact.none.title': 'Only view and select areas',
    'redact.box': 'Cover',
    'redact.box.title': 'Cover with a solid block (safest)',
    'redact.blur': 'Blur',
    'redact.blur.title': 'Blur the area',
    'redact.pixelate': 'Pixelate',
    'redact.pixelate.title': 'Pixelate the area',
    'redact.undo': 'Undo',
    'redact.delete': 'Delete area',
    'redact.hint.none': 'Choose “Cover”, “Blur” or “Pixelate” and drag over the preview to hide data. Tap an area to select it.',
    'redact.hint.box': 'Drag over the area you want to cover. This is the safest option: the content is removed completely.',
    'redact.hint.blur': 'Drag over the area you want to blur. The detail is really discarded, not just filtered.',
    'redact.hint.pixelate': 'Drag over the area you want to pixelate.',
    'redact.count.one': '1 hidden area on this page.',
    'redact.count.other': '{count} hidden areas on this page.',

    'log.aria': 'Log of shared copies',
    'log.title': 'Copy log',
    'log.clear': 'Clear log',
    'log.hint': 'Stored only in this browser. It helps you remember who got each code.',
    'footer.source': 'Source code on GitHub',
    'log.empty': 'You have not exported any copies yet.',
    'log.delete': 'Remove {code} from the log',
    'log.confirmClear': 'Clear the whole copy log?',

    'load.loading': 'Loading…',
    'load.readingPage': 'Reading page {n} of {total}…',
    'load.unsupported': 'Unsupported format. Use an image or a PDF.',
    'load.noPages': 'The document has no pages.',
    'load.passwordFailed': 'Could not open the protected PDF.',
    'load.failed': 'Could not open the file: {error}',
    'load.passwordPrompt': '“{name}” is password-protected. Enter the password:',
    'load.passwordRetry': 'Wrong password. Try again:',

    'export.renderingPage': 'Generating page {n} of {total}…',
    'export.renderingImage': 'Generating image {n} of {total}…',
    'export.imageFailed': 'Could not generate the image.',
    'export.failed': 'Export failed: {error}',
    'preview.rendering': 'Preparing page…',
    'preview.failed': 'Could not show the page: {error}',
    'export.downloadedMany': '{count} files downloaded',
    'export.downloadedOne': 'Downloaded: {name}',
    'export.shareUnsupported': 'Your browser cannot share these files. Use “Download”.',
    'export.shareTitle': 'Watermarked document',

    'file.document': 'document',
    'file.suffix': 'watermark',
    'file.andMore': 'and-{count}-more',
  },
};

const LOCALES = { es: 'es-ES', en: 'en-GB' };

let current = 'es';

export function detectLanguage() {
  const preferred = navigator.languages ?? [navigator.language];
  for (const tag of preferred) {
    const base = tag?.slice(0, 2).toLowerCase();
    if (LANGUAGES.includes(base)) return base;
  }
  return 'en';
}

export function setLanguage(lang) {
  current = LANGUAGES.includes(lang) ? lang : 'es';
  document.documentElement.lang = current;
}

export function getLanguage() {
  return current;
}

/** BCP 47 locale used for dates and numbers. */
export function getLocale() {
  return LOCALES[current];
}

/** Translates `key`, replacing `{name}` placeholders with `vars`. Falls back to Spanish, then the key. */
export function t(key, vars = {}) {
  const template = MESSAGES[current][key] ?? MESSAGES.es[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

/**
 * Applies translations to static markup:
 *   data-i18n="key"                  → textContent
 *   data-i18n-html="key"             → innerHTML (trusted strings from MESSAGES only)
 *   data-i18n-attr="attr:key;attr2:key2" → attributes
 */
export function translateDom(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  for (const el of root.querySelectorAll('[data-i18n-html]')) el.innerHTML = t(el.dataset.i18nHtml);
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(';')) {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
}
