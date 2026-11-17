# Guía breve para defender el challenge

**¿Por qué Selenium y JavaScript?**
Porque RIA indica Selenium como preferido, y JavaScript es uno de los lenguajes permitidos. Mocha aporta ciclos `beforeEach`/`afterEach` y reportes fáciles de leer.

**¿Por qué Page Object Model?**
Los tests expresan el *qué* se valida; el Page Object encapsula el *cómo* interactuar con la web. Si el DOM cambia, mantenemos los selectores en un lugar.

**¿Por qué una sesión nueva por test?**
Para que los casos sean independientes y reproducibles. El costo de arranque es asumible para un challenge pequeño.

**¿Por qué no fijar el HTG esperado en 3.500 o una cifra exacta?**
La tasa de cambio es variable. Es mejor contrastar el resultado contra la tasa cotizada por la propia aplicación, contemplando su precisión visual. Es distinto de la tasa interbancaria.

**¿Qué haces si el UI filtra letras y no muestra `Please enter a valid amount`?**
El test falla, y documento la diferencia entre aceptación y comportamiento. Confirmo con producto cuál es la regla vigente. No modifico la aserción para fingir cumplimiento.

**¿Por qué esperas explícitas?**
Porque la conversión depende de renderizado/cálculo asíncrono. Las esperas por condición son más robustas que `sleep`.

**¿Qué se valida en Postman?**
El código HTTP y la respuesta recibida: todos los posts contienen título y cuerpo no vacíos, sin la palabra `zombie`; en POST se inspecciona el JSON reflejado por httpbin para comprobar los toppings.

**¿Qué mejorarías en un equipo real?**
Contratos de API y mocks controlados para datos repetibles; `data-testid` acordados con desarrollo; reporter CI; pipeline con resultados históricos; separación de smoke/regresión; pruebas de accesibilidad; ambientes de test para integraciones financieras sensibles.
