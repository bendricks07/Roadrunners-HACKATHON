import { AREAS, DESTINATIONS } from './data.js';

const roads = [
  'M-100 259 C180 245 275 186 455 170 S841 113 1400 172',
  'M158 -80 C210 168 259 277 281 455 S387 789 308 1160',
  'M-100 765 C180 703 311 679 484 666 S940 814 1390 765',
  'M1098 -80 C1127 144 1047 296 1094 510 S1172 824 1085 1140',
  'M267 428 C435 397 458 375 587 344 S902 279 1091 327',
  'M317 865 C592 872 813 972 1100 946',
  'M700 158 C707 311 765 428 788 545 S786 727 804 958',
];
const buildings = [
  [354, 54, 111, 58, -8], [536, 47, 132, 67, -8], [823, 47, 180, 63, 4],
  [337, 342, 111, 46, -13], [509, 222, 94, 71, -10], [619, 205, 85, 72, -10],
  [800, 193, 103, 70, 3], [927, 192, 94, 73, 7], [539, 413, 73, 118, -8],
  [643, 384, 137, 103, -7], [832, 357, 104, 61, 6], [936, 420, 103, 108, 7],
  [341, 557, 120, 67, -10], [502, 554, 96, 54, -10], [635, 548, 93, 62, -2],
  [814, 568, 98, 108, 5], [928, 595, 104, 64, 7], [467, 713, 108, 70, 1],
  [569, 722, 140, 124, 2], [825, 811, 85, 77, 5], [448, 915, 112, 66, 6],
  [620, 937, 123, 62, 5], [844, 1022, 123, 62, 5], [1185, 525, 132, 82, -8],
];

function parking(x, y, w, h, rotate = 0) {
  const stripes = Array.from({ length: Math.floor(w / 17) }, (_, i) => `<path d="M${x + 10 + i * 17} ${y + 7}v${h / 2 - 17}m0 19v${h / 2 - 17}"/>`).join('');
  return `<g transform="rotate(${rotate} ${x + w / 2} ${y + h / 2})"><rect class="parking-surface" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/><g class="parking-stripes">${stripes}</g><path class="parking-lane" d="M${x + 9} ${y + h / 2}h${w - 18}"/></g>`;
}

export function campusMap({ selectedId = 'north', destinationId = 'library', route = true, mode = 'drive', compact = false, reports = [] } = {}) {
  const selected = AREAS.find(a => a.id === selectedId) || AREAS[0];
  const dest = DESTINATIONS.find(d => d.id === destinationId) || DESTINATIONS[0];
  const routePath = `M${selected.x} ${selected.y} C${selected.x + 35} ${selected.y + 65}, ${dest.x - 90} ${dest.y - 40}, ${dest.x} ${dest.y}`;
  const closedIds = reports.filter(r => r.type === 'closure' && r.active !== false && r.expiresAt > Date.now()).map(r => r.areaId);
  return `<svg class="campus-map ${compact ? 'compact-map' : ''}" viewBox="0 0 1280 1040" preserveAspectRatio="xMidYMid slice" aria-label="Illustrative Cal Poly campus map${compact ? '' : ', select a parking marker to view details'}" role="img">
    <defs>
      <pattern id="map-dots${compact ? '-small' : ''}" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".7" fill="currentColor" opacity=".055"/></pattern>
      <filter id="pin-shadow${compact ? '-small' : ''}" x="-100%" y="-100%" width="300%" height="300%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-opacity=".16"/></filter>
    </defs>
    <rect class="map-ground" width="1280" height="1040"/>
    <path class="parkland" d="M0 0H260L209 119 141 205 0 235ZM1133 0H1280V1040H1166L1205 853 1189 663 1161 503 1170 307Z"/>
    <path class="parkland inner-park" d="M476 337L572 314 635 333 611 387 537 396ZM818 444L912 447 912 533 828 526ZM369 799L426 794 463 854 361 851ZM908 883L1024 873 1042 918 934 935Z"/>
    <path class="field-fill" d="M30 805L199 765 242 908 77 949Z"/>
    <g class="field-lines" transform="rotate(-14 137 857)"><rect x="64" y="790" width="136" height="151" rx="34"/><rect x="78" y="806" width="108" height="119" rx="25"/><path d="M78 865h108"/></g>
    <path class="map-creek" d="M1273 -30C1159 167 1268 274 1231 426S1303 697 1233 1071"/>
    <g class="road-edge">${roads.map(d => `<path d="${d}"/>`).join('')}</g>
    <g class="road-fill">${roads.map(d => `<path d="${d}"/>`).join('')}</g>
    <g class="walkway"><path d="M460 280L524 338 596 366 686 424 746 512 808 638 689 685 600 755"/><path d="M421 506L507 506 570 483 684 426M809 638L950 675 1010 778"/></g>
    <g>${parking(357, 215, 145, 109, -12)}${parking(332, 451, 141, 92, -10)}${parking(949, 719, 126, 102, 5)}</g>
    <g class="buildings">${buildings.map(([x,y,w,h,r]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" transform="rotate(${r} ${x+w/2} ${y+h/2})"/>`).join('')}</g>
    <g class="trees">${[[171,356],[191,397],[214,558],[203,602],[546,176],[583,160],[636,157],[862,300],[901,303],[979,306],[850,466],[875,494],[903,514],[936,868],[972,889],[1015,905],[393,809],[415,828],[430,849],[1139,387],[1161,438],[1179,481]].map(([x,y],i) => `<circle cx="${x}" cy="${y}" r="${9+i%4*2}"/>`).join('')}</g>
    <rect width="1280" height="1040" fill="url(#map-dots${compact ? '-small' : ''})" pointer-events="none"/>
    <g class="street-labels"><text x="476" y="145" transform="rotate(-9 476 145)">Highland Drive</text><text x="229" y="560" transform="rotate(76 229 560)">California Boulevard</text><text x="870" y="755" transform="rotate(8 870 755)">Campus Way</text><text x="1152" y="676" transform="rotate(81 1152 676)">Grand Avenue</text><text x="521" y="903" transform="rotate(7 521 903)">College Avenue</text></g>
    <text class="campus-label" x="794" y="106" text-anchor="middle">CAL POLY</text>
    <g class="landmark-labels"><text x="711" y="524" text-anchor="middle">Kennedy Library</text><text x="869" y="696" text-anchor="middle">University Union</text><text x="625" y="873" text-anchor="middle">Recreation Center</text><text x="984" y="686" text-anchor="middle">Performing Arts</text></g>
    ${route ? `<path class="route-casing" d="${routePath}"/><path class="map-route" d="${routePath}"/><circle class="route-start" cx="${selected.x}" cy="${selected.y}" r="6"/>` : ''}
    <g transform="translate(${dest.x} ${dest.y})"><circle class="destination-halo" r="32"/><circle class="destination-circle" r="19"/><path class="destination-symbol" d="M-9-7Q-4-9 0-5Q4-9 9-7v15Q4 6 0 10Q-4 6-9 8Z M0-5v15"/></g>
    ${AREAS.map(a => `<g class="map-pin ${a.id === selected.id ? 'is-selected' : ''} ${closedIds.includes(a.id) ? 'is-closed' : ''}" transform="translate(${a.x} ${a.y})" ${compact ? '' : `tabindex="0" role="button" aria-label="Select ${a.name}" data-select-area="${a.id}"`}><g filter="url(#pin-shadow${compact ? '-small' : ''})"><path class="pin-shape" d="M0 11C-9-2-23-12-23-27a23 23 0 1146 0C23-12 9-2 0 11Z"/><text x="0" y="-19" text-anchor="middle">${mode === 'car' && a.id === selected.id ? 'P' : 'P'}</text></g>${!compact ? `<text class="pin-label" x="0" y="36" text-anchor="middle">${a.name}</text>` : ''}</g>`).join('')}
    <g class="you-marker" transform="translate(372 680)"><circle class="you-halo" r="27"/><circle class="you-dot" r="9"/></g>
  </svg>`;
}
