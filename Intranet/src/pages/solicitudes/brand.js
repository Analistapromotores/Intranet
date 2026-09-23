/* Recursos de marca y fotografías del equipo de Gestión y Servicios usados en el centro de servicios. */
import monograma from '../../assets/gys/GyS Logo(1).png'
import logoHorizontal from '../../assets/gys/logo_principa.png'
import logoVertical from '../../assets/gys/GyS_Imagotipo_Vertical.png'
import equipoOficina from '../../assets/gys/trbajadoras_gys.png'
import equipoBanner from '../../assets/gys/unnamed.png'
import soporte from '../../assets/tics/soporte.png'
import anydesk from '../../assets/tics/anydesk.png'
import ipscanner from '../../assets/tics/ipscaner.png'
import speedtest from '../../assets/tics/speedtest.jpg'
import glpiInfo from '../../assets/tics/glpi.png'

export const MARCA = { monograma, logoHorizontal, logoVertical }

export const FOTOS = {
  equipoOficina: { src: equipoOficina, alt: 'Colaboradoras de Gestión y Servicios sonriendo en la oficina', pos: '55% 30%' },
  equipoBanner: { src: equipoBanner, alt: 'Equipo de Gestión y Servicios con uniforme institucional', pos: '0% 40%' },
  soporte: { src: soporte, alt: 'Equipo de Gestión y Servicios revisando un caso de soporte en el computador', pos: '62% 100%' },
  prestamo: { src: equipoOficina, alt: 'Colaboradora de Gestión y Servicios trabajando con un portátil', pos: '92% 60%' },
}

export const HERRAMIENTAS_LOGOS = { anydesk, ipscanner, speedtest, glpiInfo }
