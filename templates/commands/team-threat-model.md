---
name: team-threat-model
description: Threat modeling STRIDE interactivo con security-engineer. Pregunta primero qué modelar, luego ejecuta.
---

# /team-threat-model — Threat model interactivo

El usuario invocó `/team-threat-model`. **NO leas código, NO invoques al security-engineer todavía.**

## Paso 1 — Saludo + primera pregunta (PRIMER mensaje)

Si `$ARGUMENTS` está vacío, envía:

```
🛡️ **Threat modeling** — voy a coordinar security-engineer para hacer un STRIDE completo.

Para empezar:

  **1. ¿Qué quieres modelar?**
       (a) Una feature nueva (aún en diseño)
       (b) Un componente ya implementado
       (c) Un endpoint o API específico
       (d) Un flujo completo end-to-end (ej: "el flujo de pago")
       (e) Toda la app (alto nivel)

  **2. Descríbelo en 1-3 frases:**
       Ej: "Endpoint POST /admin/users que recibe JSON con email y role, admin-only"
       Ej: "El flujo de signup con magic link via email"
```

**Espera respuesta. NO inventes lo que el usuario tiene en mente.**

## Paso 2 — Aclara el contexto (una tanda más)

Con el target identificado:

```
Tres preguntas más para afinar el threat model:

  **3. ¿Hay datos sensibles en juego?**
       (PII, credenciales, financieros, salud, propiedad intelectual, "no estoy seguro")

  **4. ¿Quiénes interactúan con esto?**
       (usuarios anónimos, autenticados, admins, sistemas internos, terceros vía API)

  **5. ¿Está en producción?**
       (no, aún en diseño / staging / producción con N usuarios)
```

**Espera respuestas.**

## Paso 3 — Lectura focalizada (solo si ya implementado)

- Si la respuesta a (1) es (b/c/d) y la respuesta a (5) es "staging/producción": pide el path del código relevante:
  ```
  ¿Dónde vive el código? Dame el path o módulo, así security-engineer lo lee directamente.
  ```
- Si no está implementado aún: salta este paso, security-engineer hará pure threat-model.

## Paso 4 — Invoca `security-engineer` en modo threat-modeling

Pásale **todo el contexto** estructurado:

```
Target: <feature/componente/endpoint/flujo>
Descripción: <1-3 frases del usuario>
Datos sensibles: <sí/no/cuáles>
Actores: <lista>
Estado: <diseño/staging/producción>
Código: <path si aplica>
```

Pídele el reporte STRIDE estándar (assets, trust boundaries, amenazas por categoría, controles requeridos, residual risk).

## Paso 5 — Entrega del modelo + decisión del usuario

Cuando security-engineer vuelva, presenta el resumen:

```
🎯 **Threat model — <target>**

### Assets identificados
  • <asset 1> — <criticidad>
  • <asset 2> — <criticidad>

### Trust boundaries
  • <boundary 1> — qué cruza
  • <boundary 2> — qué cruza

### Amenazas críticas (N)
  • [CRITICAL] <amenaza> — <mitigation>
  • [HIGH]     <amenaza> — <mitigation>
  • [MEDIUM]   <amenaza> — <mitigation>

### Controles requeridos (N)
  1. <control concreto y testeable>
  2. ...

### Out of scope / aceptados
  • <riesgo aceptado> — razón

---

**¿Qué quieres hacer ahora?**
  (a) Convertir los controles requeridos en tareas → invoco tech-lead para el blueprint
  (b) Si ya está implementado: invoco security-engineer en modo review para verificar que los controles existen en el código
  (c) Solo guardar el modelo, lo trabajo yo
```

## Paso 6 — Acción según respuesta

- (a) → invoca `tech-lead` con los controles requeridos como input. Produce blueprint de tareas asignadas a backend/frontend/devops según corresponda.
- (b) → invoca `security-engineer` otra vez, ahora en **modo review**, pasando el path del código y la lista de controles esperados. Reporta gaps.
- (c) → confirma "modelo entregado" y termina. Sugiere guardar el output en `docs/threat-models/<target>.md` si el proyecto tiene esa convención.

## Si $ARGUMENTS llega no vacío

Trata el contenido como respuesta a la pregunta 2 (descripción del target). Continúa con Paso 2 para los detalles.

## Reglas duras

- **NUNCA publiques un threat model sin assets y trust boundaries explícitos.**
- **Severidad disciplinada:** Critical = business-existential (RCE, exfiltración masiva). No infles para crear urgencia.
- **Cada mitigation debe ser testeable** (PASS/FAIL), no aspiracional ("ser más cuidadoso" no es un control).
- **Re-evaluación:** marca trigger de re-threat-model si cambian trust boundaries, auth, datos sensibles o deps externas.
