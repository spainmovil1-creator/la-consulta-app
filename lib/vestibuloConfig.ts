/**
 * Arquitectura de assets del Vestíbulo por dispositivo (Instrucción 06).
 * 
 * Permite sustituir o añadir cualquiera de las 3 versiones sin alterar
 * la lógica de navegación ni el flujo de la aplicación.
 */

export interface VestibuloAssetConfig {
  id: 'desktop' | 'tablet' | 'mobile';
  name: string;
  src: string;
  mediaQuery: string;
  aspectRatio: string;
  width: number;
  height: number;
}

export const VESTIBULO_ASSETS: Record<'desktop' | 'tablet' | 'mobile', VestibuloAssetConfig> = {
  desktop: {
    id: 'desktop',
    name: 'Vestíbulo Desktop (16:9)',
    src: '/images/vestibulo.png',
    // En escritorio/laptop (paisaje o ancho amplio), siempre aplica la versión 16:9
    mediaQuery: '(orientation: landscape), (min-width: 1024px)',
    aspectRatio: '16/9',
    width: 1672,
    height: 941,
  },
  tablet: {
    id: 'tablet',
    name: 'Vestíbulo Tablet (3:4)',
    src: '/images/vestibulotablet.png',
    // Formato tablet en orientación vertical (ej. iPad 768x1024 portrait)
    mediaQuery: '(orientation: portrait) and (min-width: 600px)',
    aspectRatio: '3/4',
    width: 1086,
    height: 1448,
  },
  mobile: {
    id: 'mobile',
    name: 'Vestíbulo Móvil (9:16)',
    src: '/images/vestibulomovil.png',
    // Formato teléfono móvil vertical (pantallas estrechas < 600px en portrait)
    mediaQuery: '(orientation: portrait) and (max-width: 599px)',
    aspectRatio: '9/16',
    width: 941,
    height: 1672,
  },
};
