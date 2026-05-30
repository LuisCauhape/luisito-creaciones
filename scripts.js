/* ─────────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────────── */

const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');

function activarHoverCursor(scope = document) {
  scope.querySelectorAll(
    'a, button, .size-chip, .color-dot, .thumb, .cat-pill, .product-card, .offer-card, .brand-item, .scroll-btn, .slider-btn'
  ).forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering');
    });

    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering');
    });
  });
}

if (cursor && cursorRing) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    cursorRing.style.left = e.clientX + 'px';
    cursorRing.style.top = e.clientY + 'px';
  });

  activarHoverCursor();
}

/* ─────────────────────────────────────────────
   NAVBAR SCROLL
───────────────────────────────────────────── */

const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
});

/* ─────────────────────────────────────────────
   HAMBURGER MENU
───────────────────────────────────────────── */

const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

function closeMenu() {
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
  }
}

/* ─────────────────────────────────────────────
   HERO THUMB SWITCH
───────────────────────────────────────────── */

function changeHero(el, src) {
  document.querySelectorAll('.thumb').forEach(t => {
    t.classList.remove('active');
  });

  el.classList.add('active');

  const img = document.getElementById('heroMainImg');

  if (img) {
    img.src = src;
  }
}

/* ─────────────────────────────────────────────
   SIZE CHIPS
───────────────────────────────────────────── */

document.querySelectorAll('.size-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.size-chip').forEach(c => {
      c.classList.remove('active');
    });

    chip.classList.add('active');
  });
});

/* ─────────────────────────────────────────────
   COLOR DOTS
───────────────────────────────────────────── */

document.querySelectorAll('.color-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    document.querySelectorAll('.color-dot').forEach(d => {
      d.classList.remove('active');
    });

    dot.classList.add('active');
  });
});

/* ─────────────────────────────────────────────
   CATEGORY PILLS
───────────────────────────────────────────── */

function setActive(el) {
  // Marcar activo visualmente
  document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
 
  // Leer el slug de la categoría del atributo data-cat
  const cat = el.dataset.cat;
  if (cat) {
    // Pequeño delay para que el usuario vea el estado activo antes de navegar
    setTimeout(() => {
      window.location.href = `category.html?cat=${cat}`;
    }, 180);
  }
}
/* ─────────────────────────────────────────────
   CATEGORY SCROLL
───────────────────────────────────────────── */

const catsTrack = document.getElementById('cats-track');

const nextCat = document.getElementById('next-cat');
const prevCat = document.getElementById('prev-cat');

if (nextCat && catsTrack) {
  nextCat.addEventListener('click', () => {
    catsTrack.scrollBy({
      left: 240,
      behavior: 'smooth'
    });
  });
}

if (prevCat && catsTrack) {
  prevCat.addEventListener('click', () => {
    catsTrack.scrollBy({
      left: -240,
      behavior: 'smooth'
    });
  });
}

/* ─────────────────────────────────────────────
   PRODUCTS SLIDER
───────────────────────────────────────────── */

function slideProducts(dir) {
  const track = document.getElementById('productsTrack');

  if (track) {
    track.scrollBy({
      left: dir * 310,
      behavior: 'smooth'
    });
  }
}

/* ─────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────── */

const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1
});

revealEls.forEach(el => observer.observe(el));

/* ─────────────────────────────────────────────
   PARSE CSV
───────────────────────────────────────────── */

function parsearCSV(texto) {
  const filas = [];
  const lineas = texto.trim().split(/\r?\n/);

  lineas.forEach(linea => {
    const cols = [];
    let actual = '';
    let dentroComillas = false;

    for (let i = 0; i < linea.length; i++) {
      const c = linea[i];
      const siguiente = linea[i + 1];

      if (c === '"' && dentroComillas && siguiente === '"') {
        actual += '"';
        i++;
      } else if (c === '"') {
        dentroComillas = !dentroComillas;
      } else if (c === ',' && !dentroComillas) {
        cols.push(actual.trim());
        actual = '';
      } else {
        actual += c;
      }
    }

    cols.push(actual.trim());
    filas.push(cols);
  });

  return filas;
}

/* ─────────────────────────────────────────────
   GOOGLE SHEETS URLS
───────────────────────────────────────────── */

const SHEET_ID =
  '2PACX-1vSVUmYHOcXytQ6R2uJjjiajRPMsYgP-HdNIBrIkKLKfR0G6wQRADsZuoX66a_ixK5QUBQBwPUWNOcJt';

const HERO_GID = '0';
const OFFERS_GID = '860634940';

const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${HERO_GID}&single=true&output=csv`;

const OFFERS_URL =
  `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${OFFERS_GID}&single=true&output=csv`;


  // URL de la nueva hoja
const COLECCION_GID = '1202954954'; // <-- reemplazá
const COLECCION_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?gid=${COLECCION_GID}&single=true&output=csv`;
/* ─────────────────────────────────────────────
   HERO PRODUCT
───────────────────────────────────────────── */

async function cargarProductoHero() {
  try {
    const res = await fetch(SHEET_URL);

    if (!res.ok) {
      throw new Error('No se pudo cargar hero');
    }

    const texto = await res.text();
    const filas = parsearCSV(texto);

    const encabezados = filas[0];
    const valores = filas[1];

    if (!valores) {
      throw new Error('No hay datos');
    }

    const p = {};

    encabezados.forEach((col, i) => {
      p[col.toLowerCase().trim()] = (valores[i] || '').trim();
    });

    console.log('HERO', p);

    if (p.nombre) {
      const partes = p.nombre.split(' ');
      const primera = partes[0];
      const resto = partes.slice(1).join(' ');

      const heroTitle = document.querySelector('.hero-title');

      if (heroTitle) {
        heroTitle.innerHTML =
          primera + (resto ? `<br><em>${resto}</em>` : '');
      }
    }

    const subtitle = document.querySelector('.hero-subtitle');
    const desc = document.querySelector('.hero-desc');
    const price = document.querySelector('.hero-price');
    const oldPrice = document.querySelector('.hero-price-old');
    const sale = document.querySelector('.hero-sale');

    if (subtitle && p.subtitulo) subtitle.textContent = p.subtitulo;
    if (desc && p.descripcion) desc.textContent = p.descripcion;
    if (price && p.precio) price.textContent = p.precio;
    if (oldPrice && p.precio_old) oldPrice.textContent = p.precio_old;
    if (sale && p.descuento) sale.textContent = p.descuento;

  const imgs = [p.imagen, p.imagen2, p.imagen3].filter(Boolean);
if (imgs[0]) {
  const heroImg = document.getElementById('heroMainImg');
  if (heroImg) heroImg.src = imgs[0];
  document.querySelectorAll('.thumb img').forEach((thumb, i) => {
    if (imgs[i]) thumb.src = imgs[i];
  });
}
    const talles = [35, 36, 37, 38, 39, 40];

    document.querySelectorAll('.size-chip').forEach((chip, i) => {
      const disponible =
        p['talle' + talles[i]]?.toLowerCase() === 'si';

      chip.classList.toggle('agotado', !disponible);
    });

    const dots = document.querySelectorAll('.color-dot');

    ['color1', 'color2', 'color3'].forEach((key, i) => {
      if (dots[i] && p[key]) {
        dots[i].style.background = p[key];
      }
    });

    const btnWa = document.querySelector('.hero-actions .btn-primary');

    if (btnWa && p.link_wa) {
      btnWa.href = p.link_wa;
    }

  } catch (err) {
    console.error('HERO:', err.message);
  }
}

/* ─────────────────────────────────────────────
   OFFERS
───────────────────────────────────────────── */

async function cargarOfertas() {
  try {
    const res = await fetch(OFFERS_URL);

    if (!res.ok) {
      throw new Error('Error cargando ofertas');
    }

    const texto = await res.text();
    const filas = parsearCSV(texto);

    console.log('OFERTAS CSV:', filas);

    const encabezados = filas[0].map(h =>
      h.toLowerCase().trim()
    );

    const grid = document.getElementById('offersGrid');

    if (!grid) {
      console.error('No existe offersGrid');
      return;
    }

    grid.innerHTML = '';

    const delays = [
      '',
      'reveal-delay-1',
      'reveal-delay-2'
    ];

    filas.slice(1).forEach((fila, idx) => {
      const o = {};

      encabezados.forEach((col, i) => {
        o[col] = (fila[i] || '').trim();
      });

      console.log('Oferta:', o);

      const esSale =
        o.etiqueta_tipo?.trim().toLowerCase() === 'sale';

      const card = document.createElement('div');

      card.className =
        `offer-card reveal ${delays[idx] || ''}`;

      card.innerHTML = `
        <div class="offer-img-wrap">
          <img
            class="offer-img"
            src="${convertirDrive(o.imagen)}"
            alt="${o.nombre || ''}"
          >

          <div class="offer-tag${esSale ? ' sale' : ''}">
            ${o.etiqueta || ''}
          </div>
        </div>

        <div class="offer-info">
          <div class="offer-name">
            ${o.nombre || ''}
          </div>

          <div class="offer-prices">
            <span class="offer-price-now">
              ${o.precio || ''}
            </span>

            ${o.precio_old
              ? `<span class="offer-price-old">${o.precio_old}</span>`
              : ''
            }

            ${o.ahorro
              ? `<span class="offer-discount">${o.ahorro}</span>`
              : ''
            }
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    grid.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
    });

    activarHoverCursor(grid);

    console.log('Ofertas cargadas');

  } catch (err) {
    console.error('OFERTAS:', err.message);
  }
}

/* ─────────────────────────────────────────────
   INIT
───────────────────────────────────────────── */

/* ─────────────────────────────────────────────
   COLECCION
───────────────────────────────────────────── */
async function cargarColeccion() {
  try {
    const res = await fetch(COLECCION_URL);
    if (!res.ok) throw new Error('Error cargando colección');

    const texto = await res.text();
    const filas = parsearCSV(texto);
    const encabezados = filas[0].map(h => h.toLowerCase().trim());
    const track = document.getElementById('productsTrack');
    if (!track) return;

    track.innerHTML = '';
    const delays = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3', 'reveal-delay-4'];

    filas.slice(1).forEach((fila, idx) => {
      const p = {};
      encabezados.forEach((col, i) => { p[col] = (fila[i] || '').trim(); });

      const card = document.createElement('div');
      card.className = `product-card reveal ${delays[idx % 5] || ''}`;

      card.innerHTML = `
        <div class="product-img-wrap">
          <img class="product-img" src="${convertirDrive(p.imagen)}" alt="${p.nombre || ''}">
          <div class="product-overlay"><span class="product-quick">Ver modelo</span></div>
        </div>
        <div class="product-info">
          <div class="product-name">${p.nombre || ''}</div>
          <div class="product-prices">
            <span class="product-price">${p.precio || ''}</span>
            ${p.precio_old ? `<span class="product-price-old">${p.precio_old}</span>` : ''}
          </div>
        </div>
      `;

      track.appendChild(card);
    });

    track.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    activarHoverCursor(track);

  } catch (err) {
    console.error('COLECCION:', err.message);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  cargarProductoHero();
  cargarOfertas();
  cargarColeccion();
});

function convertirDrive(url) {
  if (!url) return '';

  const match = url.match(/\/d\/([^/]+)/);

  if (match) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  }

  return url;
}
