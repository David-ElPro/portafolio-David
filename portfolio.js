(() => {
'use strict';
const translations = {
'Hi, welcome to my portfolio!':'¡Hola bienvenid@ a mi portafolio!',
'DESIGN · STRATEGY · DATA':'DISEÑO · ESTRATEGIA · DATOS','Projects':'Proyectos','Websites':'Sitios web','Organic Social':'Redes sociales','Other Designs':'Más diseños','Contact':'Contacto',
'Business Innovation & Marketing Specialist':'Especialista en innovación de negocios y marketing',"Hi, I'm":'Hola, soy',
'I combine creativity and data. I design campaigns and digital experiences focused on results, connecting branding, UX/UI, and advanced analytics. I work with GA4, Tag Manager, Google Ads, and SEO to transform metrics into decisions that drive brands.':'Combino creatividad y datos. Diseño campañas y experiencias digitales orientadas a resultados, conectando branding, UX/UI y analítica avanzada. Trabajo con GA4, Tag Manager, Google Ads y SEO para transformar métricas en decisiones que impulsan marcas.',
'View Videos':'Ver videos','Skip to videos':'Ir a videos','Contact Me':'Hablemos','View Projects':'Ver proyectos','My Projects':'Creatividad con estrategia',
"Here are some of the projects I've worked on, from ads to prototypes.":'Una selección de mis proyectos: desde campañas publicitarias hasta prototipos digitales.',
"Banners and display ads designed for Linntae's Google campaigns.":'Banners y anuncios de display diseñados para las campañas de Google de Linntae.',
"Creatives for the Google Display Network, following Móvil Conecta's brand identity.":'Piezas para la Red de Display de Google, alineadas con la identidad de Móvil Conecta.',
'Examples of display ads for Linnegocios, focused on lead generation.':'Anuncios de display para Linnegocios, enfocados en la generación de clientes potenciales.',
'Ads in Context: Mobile View':'Anuncios en contexto: experiencia móvil',
'This is how some of the ads appear in a mobile environment, such as news sites or blogs.':'Así se presentan los anuncios en dispositivos móviles, dentro de sitios de noticias y blogs.',
'Ad for Linntae':'Anuncio para Linntae','Ad for Linnegocios':'Anuncio para Linnegocios','Ad for Móvil Conecta':'Anuncio para Móvil Conecta',
'Advertising Design: Facebook Ads':'Diseño publicitario: Facebook Ads',
'Creatives for Meta campaigns (Facebook & Instagram) focused on engagement and conversion.':'Piezas para campañas de Meta (Facebook e Instagram) enfocadas en interacción y conversión.',
'UX/UI and Prototyping in Figma':'UX/UI y prototipos en Figma',
'Interface design for landing pages and mobile apps, focused on user experience.':'Diseño de interfaces para landing pages y aplicaciones móviles, centrado en la experiencia de usuario.',
'Websites and Landing Pages':'Sitios web y landing pages',
'Design and layout of responsive websites. This is how I present the desktop vs mobile comparison.':'Diseño y maquetación de sitios responsivos. Comparación de las experiencias en computadora y móvil.',
'Project: Linnegocios POS Landing Page':'Proyecto: landing page de Linnegocios POS','Project: Linntae Landing page':'Proyecto: landing page de Linntae',
'Photoshop Editing':'Edición en Photoshop','Logo creation, photo editing, and digital manipulation.':'Creación de logotipos, edición fotográfica y composición digital.',
'Case Study: Branding':'Caso de estudio: identidad de marca',
'Comprehensive brand identity development, from the logo to Google Play Store presence and card design.':'Desarrollo integral de identidad de marca: desde el logotipo hasta la presencia en Google Play y el diseño de tarjetas.',
'Logo and Color Palette':'Logotipo y paleta de color','Definition of visual identity.':'Definición de la identidad visual.',
'Design for Google Play':'Diseño para Google Play','Screenshots and graphic assets for the store.':'Capturas de pantalla y recursos gráficos para la tienda.',
'Landing Page and Cards':'Landing page y tarjetas','Landing page design and Google Play cards.':'Diseño de landing page y tarjetas de Google Play.',
'Content management and feed design. Hover over the phones to see the full feed.':'Gestión de contenido y diseño de perfiles. Abre las imágenes para explorar cada feed completo.',
'Exploration in other areas such as email marketing and merchandise.':'Exploración en otras áreas: email marketing y productos personalizados.',
'Email Templates':'Plantillas de correo','Design of transactional emails (welcome and reactivation) for system users.':'Diseño de correos transaccionales de bienvenida y reactivación para usuarios del sistema.',
'Merchandise Design':'Diseño de productos','Conceptual designs for t-shirts and other products.':'Diseños conceptuales para playeras y otros productos.',
"Let's Work Together!":'Hagamos algo que conecte.',
"Available to collaborate on design, web development, and digital analytics projects. Let's connect and create something impactful.":'Disponible para colaborar en proyectos de diseño, desarrollo web y analítica digital. Conectemos y creemos algo que genere impacto.',
'Designed and developed by David Jesús Guerrero © 2025':'Diseñado y desarrollado por David Jesús Guerrero © 2025',
'Portfolio settings':'Ajustes del portafolio','Choose the language for this browser. Your preference is saved on this device.':'Elige el idioma para este navegador. Tu preferencia se guarda en este dispositivo.',
'Language':'Idioma','Apply language':'Aplicar idioma','Close':'Cerrar','Previous project':'Proyecto anterior','Next project':'Proyecto siguiente',
'Open navigation':'Abrir navegación','Close image':'Cerrar imagen','Skip to projects':'Ir a proyectos',
'My LinkedIn profile':'Mi perfil de LinkedIn','Contact via WhatsApp':'Contactar por WhatsApp','Zoomed view':'Vista ampliada','Interactive Figma prototype':'Prototipo interactivo en Figma','Expertise':'Especialidades',
'[David Jesús Guerrero Profile Photo]':'Foto de perfil de David Jesús Guerrero'
};
const normalize = s => s.replace(/\s+/g,' ').trim();
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {acceptNode:n => n.parentElement.closest('script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
const texts=[];
while(walker.nextNode()){const n=walker.currentNode;const key=normalize(n.nodeValue);if(translations[key]) texts.push({node:n,en:n.nodeValue,es:n.nodeValue.replace(/\S[\s\S]*\S|\S/,translations[key])});}
const attrs=[];
document.querySelectorAll('[aria-label],[alt],[title]').forEach(el => ['aria-label','alt','title'].forEach(attr=>{const value=el.getAttribute(attr);if(value && translations[value]) attrs.push({el,attr,en:value,es:translations[value]});}));
const dialog=document.getElementById('admin-settings');
const admin=document.getElementById('admin-button');
let language='es-419';
try{const saved=localStorage.getItem('portfolio-language');if(saved==='en'||saved==='es-419') language=saved;}catch{}
function applyLanguage(lang){language=lang;document.querySelector('meta[name=description]').content=lang==='en'?'David Jesús Guerrero’s portfolio: digital marketing, branding, UX/UI, web development and analytics. Explore projects and get in touch.':'Portafolio de David Jesús Guerrero: marketing digital, branding, UX/UI, desarrollo web y analítica. Explora proyectos y conecta para colaborar.';const imageClose=document.querySelector('.modal-close');if(imageClose)imageClose.setAttribute('aria-label',lang==='en'?'Close image':'Cerrar imagen');document.getElementById('image-modal').setAttribute('aria-label',lang==='en'?'Zoomed view':'Vista ampliada');document.documentElement.lang=lang;for(const item of texts)item.node.nodeValue=lang==='en'?item.en:item.es;for(const item of attrs)item.el.setAttribute(item.attr,lang==='en'?item.en:item.es);document.title=lang==='en'?'David Jesús Guerrero — Business Innovation & Marketing':'David Jesús Guerrero — Innovación de negocios y marketing';document.querySelector(`input[name="language"][value="${lang}"]`).checked=true;admin.textContent=lang==='en'?'Admin · EN':'Admin · ES';try{localStorage.setItem('portfolio-language',lang);}catch{}}
admin.addEventListener('click',()=>{document.querySelector(`input[name="language"][value="${language}"]`).checked=true;dialog.showModal();});
document.getElementById('language-form').addEventListener('submit',e=>{e.preventDefault();applyLanguage(new FormData(e.currentTarget).get('language'));dialog.close();});
document.getElementById('close-settings').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
applyLanguage(language);
const profile = document.querySelector('.profile-portrait');
const welcome = document.getElementById('profile-welcome');
if (profile && welcome) {
  // Start the brief greeting when the photo is visible, including below the fold on mobile.
  const welcomeObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    welcomeObserver.disconnect();
    welcome.hidden = false;
    setTimeout(() => { welcome.hidden = true; }, 4500);
  }, {threshold: 0.4});
  welcomeObserver.observe(profile);
}
const menuButton=document.getElementById('mobile-menu-button');
menuButton.setAttribute('aria-controls','mobile-menu');menuButton.setAttribute('aria-expanded','false');
new MutationObserver(()=>menuButton.setAttribute('aria-expanded',String(!document.getElementById('mobile-menu').classList.contains('hidden')))).observe(document.getElementById('mobile-menu'),{attributes:true,attributeFilter:['class']});
const modal=document.getElementById('image-modal');let lastImage=null;
function closeImage(){modal.classList.remove('visible');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';lastImage?.focus();}
const close=document.createElement('button');close.className='modal-close';close.textContent='×';close.setAttribute('aria-label',language==='en'?'Close image':'Cerrar imagen');modal.append(close);close.addEventListener('click',closeImage);
modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',language==='en'?'Zoomed view':'Vista ampliada');modal.setAttribute('aria-hidden','true');
document.querySelectorAll('.modal-trigger').forEach(img=>{img.tabIndex=0;img.setAttribute('role','button');img.addEventListener('click',()=>{lastImage=img;document.getElementById('modal-image-content').alt=img.alt;modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';close.focus();});img.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();img.click();}});});
modal.addEventListener('click',e=>{if(e.target===modal)closeImage();});
document.addEventListener('keydown',e=>{if(!modal.classList.contains('visible'))return;if(e.key==='Escape')closeImage();if(e.key==='Tab'){e.preventDefault();close.focus();}});
document.querySelectorAll('.carousel-container:not([data-deck])').forEach(carousel=>{carousel.tabIndex=0;carousel.addEventListener('keydown',e=>{if(e.target!==carousel)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();carousel.scrollBy({left:(e.key==='ArrowRight'?1:-1)*carousel.clientWidth*.8,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}});});
})();
