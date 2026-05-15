Voy a crear un checklist detallado con los pasos ejecutables para implementar la web.

Iniciando: *Configurar entorno local* (2/17)

Progreso: he creado un checklist detallado y empecé la configuración del entorno.

Aquí tienes el paso a paso ejecutable (prioridad y comandos mínimos):

1) Preparar el repo local
- Asegúrate de estar en el directorio del proyecto.
- Ejecuta:
```bash
npm install
```

2) Instalar dependencias requeridas
- Añade Firebase, Recharts y utilidades:
```bash
npm install firebase recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3) Configurar Tailwind + shadcn/ui
- Añade la configuración de Tailwind (si no existe) y sigue la guía de `shadcn/ui` para integrarlo.

4) Inicializar Firebase
- Crea `firebase.ts` en la raíz de `lib` o `utils` con la configuración de tu proyecto Firebase.
- Exporta Firestore y helpers para consultas.

5) Implementar filtrado global por `guildId`
- Añade un provider/Context (o hook) en layout.tsx para guardar `guildId`.
- Topbar mostrará selector y actualizará el state global.

6) Añadir layout global
- Crear layout.tsx con `Sidebar` izquierdo y `Topbar` superior.
- Zona principal dinámica para las páginas.

7) Crear componentes base
- `components/StatCard` — KPI simple.
- `components/ChartCard` — contenedor para Recharts.
- `components/DataTable` — tabla reutilizable.
- `components/FilterBar` — filtros por usuario/topic/fecha.

8) Conectar Firestore y servicios
- Crear `services/stats.ts` y `services/topics.ts` con funciones que acepten `guildId` y devuelvan agregados (total quizzes, users únicos, accuracy, etc).

9) Implementar páginas (una por una)
- `/dashboard`: usar KPIs, gráficos de evolución, rankings.
- `/students`: tabla agrupada por `user_id`, métricas por usuario.
- `/topics`: tabla por topic; opcional lista de preguntas con fallos.
- `/quiz-analytics`: tabla de intentos crudos con filtros.

10) Integrar Recharts en `ChartCard`
- Gráficos de series temporales, comparaciones por topic/usuario.

11) Optimizar consultas y caché
- Paginación para tablas grandes, memoización de cálculos, evitar over-fetching.

12) Tests y lint
- Añadir scripts: `npm run lint`, `npm test` (si aplica). Validar TypeScript.

13) Pulir UI y responsive
- Revisar estilos Tailwind, soporte dark mode opcional.

14) Documentación
- Actualiza README.md con pasos de configuración (Firebase env vars), cómo ejecutar y estructura de project.

15) Preparar despliegue
- Configurar variables de entorno en la plataforma elegida (Vercel/Netlify).
- Probar despliegue.

¿Quieres que cree ahora la estructura inicial de archivos y los componentes base (`layout`, `Sidebar`, `Topbar`, `firebase.ts`) y actualice el `todo` marcando tareas hechas mientras avanzo?