# Presentación del Proyecto: Ecommerce Backend

---

## Slide 1: Nombre y definición del proyecto

- Nombre: Ecommerce Backend
- Problema que resuelve:
  - Proveer un backend funcional para gestión de productos y carritos en un ecommerce.
  - Permite persistir datos en MongoDB y ofrece respaldo con FileSystem.
- Público objetivo:
  - Estudiantes y evaluadores de desarrollo backend.
  - Desarrolladores que quieren aprender CRUD, APIs y WebSockets.
- Funcionalidades principales:
  - CRUD completo de productos.
  - Gestión de carritos de compra.
  - Vistas con paginación y filtros.
  - Actualización en tiempo real con WebSockets.

---

## Slide 2: Organización y arquitectura

- Servidor Express en `index.js`.
- Rutas con Express Router:
  - `/api/products`
  - `/api/carts`
  - `/products`, `/products/:pid`, `/carts/:cid`
- Controladores en `src/controllers`.
- Persistencia en `src/dao`.
- Modelos Mongoose en `src/dao/mongo/models`.
- Vistas EJS en `views`.
- Cliente WebSocket en `public/js/products-client.js`.

---

## Slide 3: Estructura de carpetas

- `index.js`
- `package.json`
- `src/routes/`
- `src/controllers/`
- `src/dao/`
  - `fileSystem/`
  - `mongo/`
- `views/`
- `public/`

---

## Slide 4: Endpoint de productos

- `GET /api/products`
  - Query params: `limit`, `page`, `query`, `category`, `status`, `sort`.
  - Respuesta paginada con enlaces `prevLink` y `nextLink`.
- `GET /api/products/:pid`
- `POST /api/products`
- `PUT /api/products/:pid`
- `DELETE /api/products/:pid`

---

## Slide 5: Ejemplo de respuesta de productos

```json
{
  "status": "success",
  "payload": [],
  "totalPages": 0,
  "prevPage": null,
  "nextPage": null,
  "page": 1,
  "hasPrevPage": false,
  "hasNextPage": false,
  "prevLink": null,
  "nextLink": null
}
```

---

## Slide 6: Endpoint de carritos

- `POST /api/carts`
- `GET /api/carts/:cid`
- `POST /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid/products/:pid`
- `PUT /api/carts/:cid`
- `PUT /api/carts/:cid/products/:pid`
- `DELETE /api/carts/:cid`

---

## Slide 7: Persistencia de datos

- MongoDB usando Mongoose.
- Base de datos: `ecommerce`.
- Colecciones: `products`, `carts`.
- Modelos:
  - `src/dao/mongo/models/Product.js`
  - `src/dao/mongo/models/Cart.js`
- Alternativa FileSystem:
  - `src/dao/fileSystem/ProductDaoFS.js`
  - `src/dao/fileSystem/CartDaoFS.js`
- Fábrica en `src/dao/daoFactory.js` para usar `mongo` o `fs`.

---

## Slide 8: Vistas y tiempo real

- `/products`: listado con filtros y paginación.
- `/products/:pid`: vista de detalle.
- `/carts/:cid`: vista del carrito.
- WebSockets con `socket.io`.
- Evento `productListUpdated` recarga la vista en tiempo real.

---

## Slide 9: Evidencia técnica

- Capturas sugeridas:
  - Código de `index.js` y controladores.
  - Estructura de carpetas.
  - Ejecución del servidor en terminal.
  - Consultas en Postman/Thunder Client.
  - Uso de las vistas en el navegador.
- Explica cada captura brevemente.

---

## Slide 10: Cierre del proyecto

- Dificultades:
  - Gestionar persistencia dual MongoDB/FileSystem.
  - Sincronizar datos y vistas en tiempo real.
- Soluciones:
  - Fábrica dinámica de DAO.
  - Modularización de controladores.
  - WebSockets para actualización automática.
- Mejoras futuras:
  - Autenticación y roles.
  - Pruebas automáticas.
  - UI más completa.
