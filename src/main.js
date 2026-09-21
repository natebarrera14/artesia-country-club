const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-navigation');
function closeMenu(returnFocus = false) { header?.classList.remove('menu-open'); menuButton?.setAttribute('aria-expanded','false'); menuButton?.setAttribute('aria-label','Open navigation'); if (returnFocus) menuButton?.focus(); }
menuButton?.addEventListener('click',()=>{const open = menuButton.getAttribute('aria-expanded') !== 'true'; header.classList.toggle('menu-open',open); menuButton.setAttribute('aria-expanded',String(open)); menuButton.setAttribute('aria-label',open?'Close navigation':'Open navigation');});
nav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu(true);});
document.addEventListener('click',event=>{if(!header?.contains(event.target))closeMenu();});
window.matchMedia('(min-width:901px)').addEventListener('change',event=>{if(event.matches)closeMenu();});

const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)');
let scrollPending = false;
function updateScroll(){scrollPending=false;header?.classList.toggle('scrolled',window.scrollY>40);const image=document.querySelector('.hero-image');if(image&&!reducedMotion.matches&&window.scrollY<window.innerHeight+200){image.style.transform=`translateY(${window.scrollY*.14}px) scale(1.02)`;}}
window.addEventListener('scroll',()=>{if(!scrollPending){scrollPending=true;requestAnimationFrame(updateScroll);}},{passive:true});updateScroll();

const calendar = document.querySelector('#club-calendar, .resource-content iframe[src*="calendar.google.com"]');
function calendarView(mode){if(!calendar)return;const next=new URL(calendar.src);next.searchParams.set('mode',mode);if(calendar.src!==next.toString())calendar.src=next.toString();document.querySelectorAll('[data-calendar-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.calendarView===mode)));}
document.querySelectorAll('[data-calendar-view]').forEach(button=>button.addEventListener('click',()=>calendarView(button.dataset.calendarView)));
const narrowCalendar = window.matchMedia('(max-width:600px)');
if(narrowCalendar.matches)calendarView('AGENDA');
narrowCalendar.addEventListener('change',event=>calendarView(event.matches?'AGENDA':'MONTH'));

function openLinkedSection(){const hash=location.hash;if(!hash)return;const target=document.getElementById(hash.slice(1));const disclosure=target?.querySelector('details');if(disclosure)disclosure.open=true;}
window.addEventListener('hashchange',openLinkedSection);openLinkedSection();

const flight = document.querySelector('#course-flight');
if(flight){
  const start = async()=>{try{const {initDroneTour}=await import('./drone-tour.js');await initDroneTour(flight);}catch(error){const status=document.querySelector('#flight-status');if(status)status.textContent='Course film still displayed. The interactive tour could not load.';document.querySelector('#flight-pause')?.setAttribute('hidden','');document.querySelector('#flight-progress')?.setAttribute('disabled','');console.warn('Course film unavailable; still frame retained.',error.message);}};
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();start();}},{rootMargin:'800px'});observer.observe(flight);
}
