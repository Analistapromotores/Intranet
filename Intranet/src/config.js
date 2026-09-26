/* Configuración de la intranet.
   Reemplaza estos valores por los reales del entorno de Gestión y Servicios. */

// URL de la mesa de ayuda GLPI (reemplazar por la instancia real).
export const GLPI_URL =
  import.meta.env.VITE_GLPI_URL || 'https://glpi.gestionyservicios.com.co/'
