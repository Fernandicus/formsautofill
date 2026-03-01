# Documentación Arquitectónica: Implementación de "Set-of-Mark" en el Sistema de Autocompletado de PDFs

Este documento detalla la actualización arquitectónica realizada en el módulo de autocompletado de PDFs (`app/features/autofill/`), migrando de un sistema de inferencia espacial basado en coordenadas a un sistema de comprensión visual basado en el método **Set-of-Mark (Marcado Visual)**.

---

## 1. El Problema: Limitaciones de la Inferencia Espacial

En la versión anterior del sistema, el flujo extraía las coordenadas físicas (`rect`) y los nombres internos de los campos interactivos mediante `pdf-lib` y enviaba esta metadata directamente al modelo Gemini (LLM). 

Este enfoque presentaba tres problemas principales:
* **Alucinaciones Espaciales:** A los modelos de lenguaje multimodales les cuesta traducir números abstractos de coordenadas (`{x: 100, y: 200}`) a ubicaciones exactas de píxeles en una imagen.
* **Nombres Internos Confusos:** Los formularios PDF a menudo contienen IDs autogenerados y sin contexto (ej. `Text_1`, `1_1`).
* **Sobrecarga del Prompt:** Enviar listas extensas de coordenadas en formato JSON aumentaba innecesariamente el tamaño del payload y el consumo de tokens.

---

## 2. La Solución: Estrategia "Set-of-Mark" (Marcado Visual)



Para resolver estos problemas, hemos adoptado la estrategia **Set-of-Mark**. En lugar de pedirle a la IA que calcule dónde está un campo en base a coordenadas abstractas, el sistema ahora dibuja marcadores visuales explícitos (índices numéricos como `[0]`, `[1]`) directamente sobre la imagen del documento *antes* de enviarlo al modelo.

De esta forma, la IA no necesita hacer matemáticas; simplemente "lee" el documento de forma natural, asociando el texto adyacente (ej. "Nombre:") con el marcador visual (ej. `[3]`).

---

## 3. Nuevo Flujo de Trabajo Técnico

El proceso ahora se divide en las siguientes etapas dentro de nuestros servicios aislados:

1. **Extracción ( `pdfService.ts` ):**
   * Se lee el PDF original y se extraen los campos interactivos en un Array.
   * La posición en el Array (`index`) se convierte en la fuente de verdad.

2. **Marcado Visual ( `pdfService.ts` ):**
   * Se ejecuta una nueva función (`generateMarkedPdfBase64`) que itera sobre el Array de campos.
   * Utilizando `pdf-lib`, se dibuja texto rojo brillante (ej. `[0]`, `[1]`) exactamente en las coordenadas `rect` de cada campo.
   * Se renderiza este PDF temporal modificado y se convierte a Base64.

3. **Inferencia Visual de la IA ( `geminiService.ts` ):**
   * Se envía a Gemini el PDF **marcado** junto con los datos del usuario.
   * El prompt instruye al modelo a relacionar los datos del usuario basándose exclusivamente en el contexto visual que rodea a cada marcador numérico (`[0]`, `[1]`, etc.).
   * El modelo responde con un mapeo limpio: `{ "0": "Lukas", "1": "Müller" }`.

4. **Inyección de Datos ( `pdfService.ts` ):**
   * El sistema mapea los índices devueltos por la IA de vuelta a los objetos de campo originales de `pdf-lib`.
   * Se autocompleta el PDF original de forma precisa y determinista.

---

## 4. Motivos y Beneficios Clave

* **Precisión Drásticamente Superior:** Elimina casi por completo las confusiones de campos superpuestos o nombres internos redundantes, mejorando la experiencia del usuario en la etapa de revisión.
* **Menor Latencia de la API:** Al reducir la carga cognitiva geométrica del modelo `gemini-3-flash-preview`, el *Time-to-First-Token* (TTFT) disminuye.
* **Reducción del Payload:** El JSON enviado en el prompt es mucho más ligero, ya que se eliminan las coordenadas `rect` y los nombres internos de la petición a la API.
* **Independencia del Formato:** El sistema se vuelve totalmente inmune a cómo el creador del PDF haya nombrado las variables internas.