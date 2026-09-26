# Documentación de la intranet

Mapa de la documentación, organizado por **lo que necesita hacer quien lee** (modelo Seven-Action).

| Documento | El lector necesita… | Acción principal | Señal de que funcionó |
| --- | --- | --- | --- |
| [../README.md](../README.md) | levantar el proyecto en su equipo | **Explore / Practice** | La intranet abre en `localhost:5173` y puede iniciar sesión |
| [erd.md](erd.md) | saber qué se guarda y cómo se relaciona | **Understand / Remember** | Sabe en qué archivo está cada dato y qué campo lo enlaza |
| [reglas-de-negocio.md](reglas-de-negocio.md) | conocer las reglas que el código no deja ver | **Understand / Remember** | Puede cambiar una regla sin romper otra |
| [despliegue.md](despliegue.md) | publicar, reiniciar o diagnosticar | **Practice / Troubleshoot** | Despliega un cambio y sabe qué mirar si falla |
| [usuarios-y-permisos.md](usuarios-y-permisos.md) | saber quién puede hacer qué y por qué | **Remember / Understand** | Puede auditar un permiso y explicar el diseño |

## Diagramas

Fuente editable en [Excalidraw](https://excalidraw.com) (abre el `.excalidraw`) y vista previa PNG:

- [arquitectura](diagramas/arquitectura.excalidraw) — servidor, volumen y servicios externos
- [erd](diagramas/erd.excalidraw) — modelo de datos lógico
- [roles-y-accesos](diagramas/roles-y-accesos.excalidraw) — roles anidados y guardias del servidor

## Vacíos conocidos (por documentar cuando existan)

- Runbook de respaldo y restauración de `DATA_DIR` (hoy no hay respaldo automático ni volumen).
- Guía de usuario final por módulo (Solicitudes, Salas, Noticias).
- Referencia de la API (rutas, cuerpos y errores); hoy está resumida en la tabla de guardias de
  [usuarios-y-permisos.md](usuarios-y-permisos.md#cómo-se-aplica-en-el-servidor).
