// app/ui/src/components/MarkerIcon.tsx

// SVG path from Heroicons banknotes icon (24x24 solid)
const BANKNOTES_SVG_PATHS = [
  'M12 7.5a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z',
  'M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 14.625v-9.75ZM8.25 9.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM18.75 9a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V9.75a.75.75 0 0 0-.75-.75h-.008ZM4.5 9.75A.75.75 0 0 1 5.25 9h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V9.75Z',
  'M2.25 18a.75.75 0 0 0 0 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 0 0-.75-.75H2.25Z',
];

export interface MarkerIconOptions {
  color?: string;
  scale?: number;
  ariaLabel?: string;
}

export function createMarkerContent(options: MarkerIconOptions = {}): HTMLElement {
  const {
    color = '#28a745',
    scale = 1,
    ariaLabel = 'Marcador de lote'
  } = options;

  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${34 * scale}px;
    height: ${34 * scale}px;
    background-color: ${color};
    border-radius: 50%;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
  `;
  container.setAttribute('role', 'button');
  container.setAttribute('tabindex', '0');
  container.setAttribute('aria-label', ariaLabel);

  // Create SVG element with Heroicons banknotes icon
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  const iconSize = 20 * scale;
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', '#ffffff');
  svg.setAttribute('width', `${iconSize}`);
  svg.setAttribute('height', `${iconSize}`);
  svg.setAttribute('aria-hidden', 'true');
  
  // Add paths
  BANKNOTES_SVG_PATHS.forEach((d, index) => {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    if (index === 1) {
      path.setAttribute('fill-rule', 'evenodd');
      path.setAttribute('clip-rule', 'evenodd');
    }
    svg.appendChild(path);
  });

  container.appendChild(svg);

  container.addEventListener('mouseenter', () => {
    container.style.transform = 'scale(1.1)';
  });

  container.addEventListener('mouseleave', () => {
    container.style.transform = 'scale(1)';
  });

  return container;
}

export function createPinElement(
  PinElement: typeof google.maps.marker.PinElement,
  options: MarkerIconOptions = {}
): google.maps.marker.PinElement {
  const {
    color = '#28a745',
  } = options;

  // Create inline SVG for PinElement glyph using Heroicons banknotes
  const glyphSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
      <path d="${BANKNOTES_SVG_PATHS[0]}"/>
      <path fill-rule="evenodd" d="${BANKNOTES_SVG_PATHS[1]}" clip-rule="evenodd"/>
      <path d="${BANKNOTES_SVG_PATHS[2]}"/>
    </svg>
  `.trim();

  return new PinElement({
    glyph: glyphSvg,
    background: color,
    borderColor: color,
    glyphColor: '#ffffff',
    scale: 0.84,
  });
}

export function createSvgDataUrl(color: string = '#28a745'): string {
  const svg = `
    <svg width="34" height="34" viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="14" fill="${color}" stroke="${color}" stroke-width="2"/>
      <svg x="7" y="7" width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="${BANKNOTES_SVG_PATHS[0]}"/>
        <path fill-rule="evenodd" d="${BANKNOTES_SVG_PATHS[1]}" clip-rule="evenodd"/>
        <path d="${BANKNOTES_SVG_PATHS[2]}"/>
      </svg>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
