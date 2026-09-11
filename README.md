# Grupo Estrella · Flappy Guardia v3

Juego arcade para celular y computadora. Interfaz reconstruida con HTML, CSS y controles accesibles: los botones, títulos, tarjetas, instrucciones y paneles ya no son recortes de una captura. Las caras de Amir, Florencia, Angela y Aline se conservan de la referencia original.

## Jugar

Tocá la pantalla o presioná Espacio / Flecha arriba para saltar. Evitá jeringas, techo y piso. Pasar una pareja de jeringas suma 1 punto; recoger un corazón suma 3. El botón de pausa, P o Escape pausa la partida.

## Qué cambió

- Diseño separado del motor: interfaz nativa, logo tipográfico, botones, paneles, tarjetas y tabla de récords.
- Jeringas dibujadas dentro del motor, con colisiones más estrechas en la aguja.
- Física a paso fijo, obstáculos progresivos y menor variación entre huecos consecutivos.
- Corazones, partículas, sonido y melodía electrónica originales sintetizados en el navegador.
- Pantallas adaptables, áreas seguras de celular, controles de teclado y preferencia de movimiento reducido.
- Pausa al ocultar la pestaña o cambiar sustancialmente la orientación.
- Retratos con proporciones conservadas.
- Conservación de los récords y preferencias existentes con la clave `estrella-v1`.

## Archivos

- `index.html`: entrada y estructura accesible.
- `app.js`: pantallas, navegación y persistencia local.
- `engine.js`: física, dibujo y colisiones.
- `sound.js`: música y efectos.
- `style.css`: sistema visual y adaptación de pantallas.
- `sw.js`: retira el antiguo caché del juego; la v3 no registra un nuevo service worker.
- `assets/reference.png`: se usa exclusivamente para los rostros.
- `assets/hospital.png`: fondo ilustrado del hospital.

No necesita compilación, dependencias, cuentas ni claves. Las rutas son relativas y compatibles con GitHub Pages. Se publica desde la raíz de `main`.

## Datos y sonido

Los récords son de este dispositivo y navegador, no globales. Se conservan las mejores 20 partidas y se muestran las mejores 10. El nombre se cambia en Récords. Borrar datos del navegador elimina esos resultados. La música comienza tras la primera interacción; música y efectos se controlan por separado.

## Verificación

Se revisó el código de diseño, navegación y motor por separado. Se comprobaron la sintaxis, los recursos, los cuatro retratos, inicio/pausa/continuación, puntos, corazones, colisiones de aguja, cambio de orientación, fin de partida y movimiento reducido. Se inspeccionó un render real del motor Canvas. No se realizó una prueba completa de la interfaz en Safari/Chrome de un teléfono físico.
