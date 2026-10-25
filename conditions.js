// Original condition badges. These are visual markers, without automatic rules effects.
export const STATUS_CATALOG = [
  {id:'poisoned',hu:'Mérgezett',en:'Poisoned',color:'#4f864c'},
  {id:'prone',hu:'Földön fekvő',en:'Prone',color:'#4e7f9b'},
  {id:'stunned',hu:'Kábult',en:'Stunned',color:'#b28a28'},
  {id:'frightened',hu:'Rémült',en:'Frightened',color:'#8a5b9d'},
  {id:'restrained',hu:'Lekötözött',en:'Restrained',color:'#816850'},
  {id:'blinded',hu:'Vak',en:'Blinded',color:'#546373'},
  {id:'deafened',hu:'Süket',en:'Deafened',color:'#756786'},
  {id:'charmed',hu:'Elbűvölt',en:'Charmed',color:'#ac5279'},
  {id:'grappled',hu:'Megragadott',en:'Grappled',color:'#98704c'},
  {id:'incapacitated',hu:'Cselekvőképtelen',en:'Incapacitated',color:'#a4594c'},
  {id:'unconscious',hu:'Eszméletlen',en:'Unconscious',color:'#536d9d'},
  {id:'paralyzed',hu:'Bénult',en:'Paralyzed',color:'#9c7b35'},
  {id:'petrified',hu:'Kővé dermedt',en:'Petrified',color:'#738174'},
  {id:'invisible',hu:'Láthatatlan',en:'Invisible',color:'#4b8d91'},
  {id:'exhaustion',hu:'Kimerültség',en:'Exhaustion',color:'#9a663f'},
  {id:'concentration',hu:'Koncentráció',en:'Concentration',color:'#416eaa'},
  {id:'burning',hu:'Lángoló',en:'Burning',color:'#c16632'},
];

const art = {
  poisoned:'<path d="M6 12a6 6 0 1 1 12 0l-2 2v4H8v-4Z"/><path d="M9 18v3m3-3v3m3-3v3M5 20l-2 1m16-1 2 1"/><circle cx="9.5" cy="10" r="1.4" fill="currentColor" stroke="none"/><circle cx="14.5" cy="10" r="1.4" fill="currentColor" stroke="none"/><path d="m12 12-1 2h2Z"/>',
  prone:'<circle cx="5" cy="13" r="2.2"/><path d="M8 14h5l3-4 4 3m-7 1 3 4h5M3 21h18M9 14l2 4h4"/>',
  stunned:'<path d="m12 3 2.2 5 5.5.5-4.1 3.6 1.3 5.4-4.9-2.8-4.9 2.8 1.3-5.4-4.1-3.6 5.5-.5ZM3 3l2 2m14-2-2 2M3 20l3-1m15 1-3-1"/>',
  frightened:'<path d="M6 9a6 6 0 0 1 12 0v5a6 6 0 0 1-12 0ZM4 4 2 7m18-3 2 3"/><path d="m9 10 1 2m5-2-1 2M9 17a3 3 0 0 1 6 0"/>',
  restrained:'<rect x="3" y="7" width="7" height="11" rx="3.5" transform="rotate(-25 6.5 12.5)"/><rect x="14" y="6" width="7" height="11" rx="3.5" transform="rotate(-25 17.5 11.5)"/><path d="m8 11 8 2M4 4l3-1m10 18 3-1"/>',
  blinded:'<path d="M3 12s3-6 9-6 9 6 9 6-3 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="3"/><path d="M3 3 21 21" stroke-width="2.5"/>',
  deafened:'<path d="M8 8a5 5 0 1 1 9 3c-1 2-4 2-4 5v1a3 3 0 0 1-6 0M11 8a2 2 0 1 1 4 1M3 4l18 17"/>',
  charmed:'<path d="M12 20 4.5 12.5a4.8 4.8 0 0 1 6.8-6.8l.7.8.7-.8a4.8 4.8 0 0 1 6.8 6.8Z"/><path d="m18 2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" fill="currentColor" stroke="none"/>',
  grappled:'<path d="M5 13V9a1.5 1.5 0 0 1 3 0v3-6a1.5 1.5 0 0 1 3 0v6-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v7l2-2a1.5 1.5 0 0 1 2 2l-5 6H9Z"/><path d="M4 16h13M10 20v2m5-2v2"/>',
  incapacitated:'<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12M11 5l-3 8h5l-1 6 5-9h-5l1-5"/>',
  unconscious:'<path d="M8 3a8 8 0 1 0 12 12A8 8 0 0 1 8 3Z"/><path d="M15 3h6l-6 6h6M4 16l2 1m3 2h3"/>',
  paralyzed:'<circle cx="9" cy="5" r="2"/><path d="M9 8v7m-5-4 5-3 4 3M9 15l-4 6m4-6 3 6M19 3l-4 7h5l-5 10"/>',
  petrified:'<path d="m8 3 7 1 3 5-2 5 4 7H4l4-7-2-5ZM8 14h8M13 5l-2 5 3 2-3 5 2 4"/><path d="m6 9 3 1m7-1-2 1"/>',
  invisible:'<g stroke-dasharray="2.5 2.5"><circle cx="12" cy="7" r="4"/><path d="M5 21v-3a7 7 0 0 1 14 0v3Z"/></g><path d="m3 3 18 18"/>',
  exhaustion:'<rect x="3" y="7" width="17" height="11" rx="2"/><path d="M20 10h2v5h-2M6 10v5m0 0h2M8 3l3 1m4-1 3 1"/><path d="m10 11 2 2 2-2"/>',
  concentration:'<path d="m12 2 9 10-9 10L3 12Z"/><path d="m12 6 5 6-5 6-5-6Z"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
  burning:'<path d="M13 2c1 5-4 6-3 10 2-1 3-3 4-4 1 3 5 4 5 8a7 7 0 0 1-14 0c0-4 3-6 3-9 1 1 2 2 2 3 0-4 2-5 3-8Z"/><path d="M12 21a3 3 0 0 1-3-3c0-2 2-3 3-5 0 2 3 3 3 5a3 3 0 0 1-3 3Z"/>',
};

export function statusIcon(id){
  const drawing=Object.prototype.hasOwnProperty.call(art,id)?art[id]:'';
  if(!drawing)return '';
  return `<svg class="status-icon" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${drawing}</g></svg>`;
}
