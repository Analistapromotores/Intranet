/* Configuración de la intranet.
   Reemplaza estos valores por los reales del entorno de Gestión y Servicios. */

// URL de la mesa de ayuda GLPI (reemplazar por la instancia real).
export const GLPI_URL =
  import.meta.env.VITE_GLPI_URL || 'https://glpi.gestionyservicios.com.co/'

// Perfil público de Instagram (enlace "Ver todas" del bloque de noticias).
export const IG_PROFILE_URL =
  import.meta.env.VITE_IG_PROFILE_URL || 'https://www.instagram.com/'

// Token de acceso de Instagram (Instagram API con Instagram Login).
// Ver instrucciones en .env.example. Sin token se muestran ejemplos.
export const IG_TOKEN = import.meta.env.VITE_IG_TOKEN || ''
