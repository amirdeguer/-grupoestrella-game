# Grupo Estrella · Flappy Guardia — v2

Segunda versión para celulares, tablets y computadora, con una reproducción mucho más cercana de la referencia de Amir. Incluye los cuatro retratos originales: Amir, Florencia, Angela y Aline. No requiere instalar paquetes, compilar ni usar claves.

## Qué cambia en esta versión

- Botones ilustrados originales: Jugar, Personajes, Récords, Instrucciones, Créditos y los controles de pausa.
- Tarjetas completas de los cuatro personajes, conservando sus caras y colores.
- Taza, notas de papel, láminas de instrucciones y créditos tomadas del ejemplo.
- Menús recompuestos para adaptarse a la pantalla; retratos con proporciones conservadas.
- Monitor “Sin límites”, cartel “Aquí también hay héroes” y estela de corazones durante el juego.
- Ajustes de sonido desde el engranaje del menú, además de la pausa.
- Tabla de récords con los rostros de los personajes y edición de tu nombre.

Los elementos ilustrados se dibujan desde la imagen original dentro de controles reales. Los menús no son una captura estática: los botones, personajes, interruptores, puntos y récords funcionan.

## Subir a GitHub Pages

1. Descomprimí el ZIP en tu computadora.
2. Abrí el repositorio de GitHub que quieras usar.
3. Elegí **Add file → Upload files**.
4. Subí **el contenido** de la carpeta: `index.html`, `style.css`, `game.js`, `assets` y los demás archivos. `index.html` tiene que estar en la raíz del repositorio, no dentro de otra carpeta.
5. Guardá con **Commit changes**.
6. En **Settings → Pages**, elegí **Deploy from a branch**, rama **main**, carpeta **/(root)** y guardá.
7. Esperá que termine la publicación y abrí la dirección que muestra GitHub Pages.

Si ya tenés un juego en ese repositorio, podés reemplazar los archivos del mismo nombre. No hace falta borrar el repositorio. Conservá una copia de la versión anterior si querés volver atrás. Si seguís viendo la versión vieja, recargá sin caché (Ctrl + F5) o abrí la dirección en una pestaña privada.

## Probar antes de subir

Abrí `index.html` en una computadora. También podés servir la carpeta con `python -m http.server 8000` y abrir `http://localhost:8000`.

## Cómo jugar

- Tocá la pantalla, hacé clic en el área de juego o presioná Espacio / Flecha arriba para saltar.
- Pasar una pareja de jeringas suma 1 punto.
- Recoger un corazón suma 3 puntos. Los corazones son puntos extra, no vidas.
- Chocar con una jeringa, el techo o el piso termina la partida.
- Botón de pausa, P o Escape para pausar y continuar.
- Al cambiar de pestaña, el juego se pausa automáticamente.
- La dificultad aumenta gradualmente. Los personajes tienen pequeñas diferencias de gravedad, impulso, velocidad y tolerancia de colisión.

## Sonido y datos

La melodía electrónica y los sonidos se sintetizan en el navegador. Por las restricciones de reproducción automática, empiezan después del primer toque. Se pueden apagar por separado desde Pausa.

Se conserva la compatibilidad con los récords de la primera versión cuando se reemplazan los archivos en la misma dirección. La selección de personaje, las preferencias y los mejores 20 resultados se guardan en este navegador con localStorage. La pantalla muestra los mejores 10. El nombre se cambia en Récords. No hay tabla global ni resultados inventados: cada dispositivo guarda sus propias partidas. Borrar los datos del navegador borra esos resultados.

## Archivos

- `index.html`: entrada del juego.
- `style.css`: diseño adaptable a pantalla y menús.
- `game.js`: física, interacción, sonido, récords y dibujo.
- `assets/reference.png`: referencia aportada por Amir; se usa directamente para dibujar las caras, las tarjetas, el logo y las jeringas con recortes y máscaras en tiempo de ejecución. También contiene el arte original de los botones, carteles y láminas de menú.
- `assets/hospital.png`: fondo de Emergencia creado para el juego, basado en la estética de la referencia.
- `.nojekyll`: evita el procesamiento de Jekyll en Pages.

No se necesita backend ni dependencias externas. Todas las rutas son relativas, compatibles con una dirección de GitHub Pages que incluya el nombre del repositorio. No se usa service worker para evitar versiones viejas retenidas por una caché propia.

## Alcance visual

Se conservan los dibujos de las caras presentes en la imagen, sin regenerarlos. La interfaz es funcional y adaptable, inspirada en las ocho pantallas de la referencia; no incluye los marcos de teléfono ni los indicadores de batería ficticios del montaje. El fondo se creó por separado para dejar libre el área jugable. Las caras están limitadas por la resolución de la ilustración original. Para más detalle se pueden incorporar retratos individuales de mayor resolución.

## Verificación realizada

Se verificó la sintaxis JavaScript, la existencia de recursos y la integridad del ZIP. Se probaron, con un entorno simulado y renderizado real de Canvas, los cuatro personajes, inicio, pausa, continuación, puntuación, recogida de corazones, colisión, fin de partida y persistencia de récords. También se inspeccionaron visualmente los elementos gráficos dibujados. Esto no sustituye una prueba completa en Safari o Chrome de un celular real; esa prueba sigue pendiente.
