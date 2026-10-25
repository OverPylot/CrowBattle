// Original polyhedral die line art. Each silhouette and face layout is distinct.
const label=(value,x=32,y=35,size=15)=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="currentColor" stroke="none" font-family="ui-sans-serif,system-ui,sans-serif" font-weight="650" font-size="${size}">${value}</text>`;
const faces={
  4:`<path d="M32 4 5 53l27 8 27-8Z"/><path d="M32 4v39M5 53l27-10 27 10M32 43v18"/>${label(4,32,31,15)}`,
  6:`<path d="m32 4 26 15v29L32 62 6 48V19Z"/><path d="m6 19 26 15 26-15M32 34v28"/><g fill="currentColor" stroke="none"><ellipse cx="32" cy="19" rx="3.5" ry="2"/><ellipse cx="16" cy="34" rx="2.4" ry="3.2"/><ellipse cx="23" cy="47" rx="2.4" ry="3.2"/><ellipse cx="41" cy="35" rx="2.4" ry="3.2"/><ellipse cx="46" cy="41" rx="2.4" ry="3.2"/><ellipse cx="51" cy="47" rx="2.4" ry="3.2"/></g>`,
  8:`<path d="M32 3 59 31 32 61 5 31Z"/><path d="m32 13 16 27H16ZM5 31l11 9 16 21 16-21 11-9M32 3v10"/>${label(8,32,31,15)}`,
  10:`<path d="M32 3 58 22 54 44 32 61 10 44 6 22Z"/><path d="M32 3v15L14 32l6 16h24l6-16-18-14M6 22l8 10-4 12M58 22l-8 10 4 12M20 48l12 13 12-13"/>${label(10,32,34,13)}`,
  12:`<path d="m32 3 22 11 7 22-14 22-25 3L5 44V20Z"/><path d="m32 16 16 12-6 19H22l-6-19ZM32 3v13M54 14l-6 14M61 36l-19 11 5 11M22 61V47M5 44l11-16L5 20"/>${label(12,32,33,14)}`,
  20:`<path d="m32 3 25 15v28L32 61 7 46V18Z"/><path d="M32 3 17 23h30ZM7 18l10 5-10 23 25 2L7 46M57 18l-10 5 10 23-25 2M17 23l15 25 15-25M7 46l25 15 25-15M32 48v13"/>${label(20,32,33,13)}`,
  100:`<path d="M21 4 39 18 36 38 21 51 6 38 3 18Z"/><path d="M21 4v12L9 27l4 13h16l4-13-12-11M3 18l6 9M13 40l8 11"/>${label('00',20,28,11)}<path d="m42 15 19 14-4 20-15 12-16-12-3-20Z" fill="var(--paper,#f6f5f0)"/><path d="M42 15v12L29 38l5 13h16l5-13-13-11M23 29l6 9-3 11M61 29l-6 9 2 11M34 51l8 10 8-10"/>${label(0,42,40,13)}`
};
export function diceIcon(sides){
  const art=faces[sides];
  if(!art)throw new RangeError('Unsupported die');
  return `<svg class="die-shape" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${art}</g></svg>`;
}
