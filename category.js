/* ══════════════════════════════════════════
   CATEGORY.JS
   Lógica de la página de categoría dinámica
   Lee ?cat= de la URL y filtra el Google Sheet
══════════════════════════════════════════ */

/* ─────────────────────────────────────────
   CONFIGURACIÓN
   Reemplazá SHEET_ID con el ID de tu planilla
   y PRODUCTOS_GID con el ID de la hoja "productos"
───────────────────────────────────────────
   Estructura de columnas esperada en el Sheet:
   categoria | nombre | descripcion | materiales |
   precio | precio_old | descuento | talles |
   color1_nombre | color1_hex | color2_nombre |
   color2_hex | color3_nombre | color3_hex |
   imagen1 | imagen2 | imagen3 | imagen4 | link_wa
   
   Valor de "categoria" para cada página:
   tacones | zapatos-planos | sandalias |
   zapatillas | botas-botines | fiesta |
   verano | deportivo
───────────────────────────────────────────*/

// ← Usá el mismo SHEET_ID de tu scripts.js
const CAT_SHEET_ID =
  '2PACX-1vSVUmYHOcXytQ6R2uJjjiajRPMsYgP-HdNIBrIkKLKfR0G6wQRADsZuoX66a_ixK5QUBQBwPUWNOcJt';

// ← ID de la nueva hoja "productos" en Google Sheets
const PRODUCTOS_GID = '127848751';

const PRODUCTOS_URL =
  `https://docs.google.com/spreadsheets/d/e/${CAT_SHEET_ID}/pub?gid=${PRODUCTOS_GID}&single=true&output=csv`;

/* ─────────────────────────────────────────
   MAPA DE CATEGORÍAS
   slug → nombre mostrado en pantalla
───────────────────────────────────────────*/
const CATEGORIAS = {
  'zapatos-planos': { label: 'Zapatos planos', eyebrow: 'Colección 2025 · Comodidad sin renunciar al estilo' },
  'tacones':        { label: 'Tacones',         eyebrow: 'Colección 2025 · Elegancia en cada paso' },
  'sandalias':      { label: 'Sandalias',        eyebrow: 'Temporada verano · Frescura y diseño' },
  'zapatillas':     { label: 'Zapatillas',       eyebrow: 'Colección 2025 · Deporte y cotidiano' },
  'botas-botines':  { label: 'Botas y botines',  eyebrow: 'Otoño 2025 · Cuero genuino y confort' },
  'fiesta':         { label: 'Fiesta',            eyebrow: 'Colección fiesta · Brillá en cada ocasión' },
  'verano':         { label: 'Verano',            eyebrow: 'Temporada caliente · Livianos y vibrantes' },
  'deportivo':      { label: 'Deportivo',         eyebrow: 'Active wear · Movimiento sin límites' },
};

/* ─────────────────────────────────────────
   ESTADO GLOBAL
───────────────────────────────────────────*/
let todosLosProductos = [];
let productosFiltrados = [];
let categoriaActual = '';

/* ─────────────────────────────────────────
   PARSEAR CSV (reutilizamos la función de scripts.js)
   — Si scripts.js ya tiene parsearCSV, no duplicar
───────────────────────────────────────────*/
function parsearCSVcat(texto) {
  const filas = [];
  const lineas = texto.trim().split(/\r?\n/);
  lineas.forEach(linea => {
    const cols = [];
    let actual = ''; let dentroComillas = false;
    for (let i = 0; i < linea.length; i++) {
      const c = linea[i]; const sig = linea[i + 1];
      if (c === '"' && dentroComillas && sig === '"') { actual += '"'; i++; }
      else if (c === '"') { dentroComillas = !dentroComillas; }
      else if (c === ',' && !dentroComillas) { cols.push(actual.trim()); actual = ''; }
      else { actual += c; }
    }
    cols.push(actual.trim());
    filas.push(cols);
  });
  return filas;
}

/* ─────────────────────────────────────────
   LEER ?cat= DE LA URL
───────────────────────────────────────────*/
function getCatParam() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('cat') || '').toLowerCase().trim();
}

/* ─────────────────────────────────────────
   RENDERIZAR PILLS DE NAVEGACIÓN
───────────────────────────────────────────*/
function renderPillsNav(catActual) {
  const wrap = document.getElementById('catPillsNav');
  const footer = document.getElementById('footerCats');
  if (!wrap) return;
  wrap.innerHTML = '';
  if (footer) footer.innerHTML = '';

  Object.entries(CATEGORIAS).forEach(([slug, info]) => {
    const a = document.createElement('a');
    a.className = 'cat-pill-nav' + (slug === catActual ? ' active' : '');
    a.href = `category.html?cat=${slug}`;
    a.textContent = info.label;
    wrap.appendChild(a);

    if (footer) {
      const li = document.createElement('li');
      const af = document.createElement('a');
      af.href = `category.html?cat=${slug}`;
      af.textContent = info.label;
      li.appendChild(af);
      footer.appendChild(li);
    }
  });
}

/* ─────────────────────────────────────────
   PARSEAR TALLES
   "35,36,37-agotado,38,39" 
   → [{talle:"35",disponible:true}, ...]
───────────────────────────────────────────*/
function parsearTalles(str) {
  if (!str) return [];
  return str.split(',').map(t => {
    t = t.trim();
    const agotado = t.toLowerCase().includes('agotado');
    const num = t.replace(/-?agotado/gi, '').trim();
    return { talle: num, disponible: !agotado };
  }).filter(t => t.talle);
}

/* ─────────────────────────────────────────
   PARSEAR COLORES
   Del objeto producto leer color1_nombre, color1_hex, etc.
───────────────────────────────────────────*/
function parsearColores(p) {
  const colores = [];
  for (let i = 1; i <= 5; i++) {
    const nombre = p[`color${i}_nombre`];
    const hex = p[`color${i}_hex`];
    if (nombre || hex) {
      colores.push({ nombre: nombre || '', hex: hex || '#ccc' });
    }
  }
  return colores;
}

/* ─────────────────────────────────────────
   PARSEAR IMÁGENES
   imagen1, imagen2, imagen3, imagen4
───────────────────────────────────────────*/
function parsearImagenes(p) {
  const imgs = [];
  for (let i = 1; i <= 4; i++) {
    if (p[`imagen${i}`]) imgs.push(p[`imagen${i}`]);
  }
  return imgs;
}

/* ─────────────────────────────────────────
   RENDERIZAR PRODUCTO DESTACADO (el primero)
───────────────────────────────────────────*/
function renderFeatured(p) {
  const section = document.getElementById('featuredSection');
  if (!section) return;
  section.style.display = 'grid';

  const imagenes = parsearImagenes(p);
  const talles = parsearTalles(p.talles);
  const colores = parsearColores(p);

  // Imagen principal
  const mainImg = document.getElementById('featMainImg');
  if (mainImg && imagenes[0]) {
    mainImg.src = imagenes[0];
    mainImg.alt = p.nombre || '';
  }

  // Thumbnails (si hay más de 1 imagen)
  const thumbsWrap = document.getElementById('featThumbs');
  if (thumbsWrap) {
    thumbsWrap.innerHTML = '';
    imagenes.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'feat-thumb' + (i === 0 ? ' active' : '');
      div.onclick = () => {
        mainImg.src = src;
        document.querySelectorAll('.feat-thumb').forEach(t => t.classList.remove('active'));
        div.classList.add('active');
      };
      const img = document.createElement('img');
      img.src = src; img.alt = '';
      div.appendChild(img);
      thumbsWrap.appendChild(div);
    });
  }

  // Textos
  const tag = document.getElementById('featTag');
  const nombre = document.getElementById('featName');
  const priceRow = document.getElementById('featPriceRow');
  const desc = document.getElementById('featDesc');
  const materiales = document.getElementById('featMateriales');

  if (tag) tag.textContent = CATEGORIAS[categoriaActual]?.eyebrow || 'Colección 2025';
  if (nombre) nombre.textContent = p.nombre || '';
  if (desc) desc.textContent = p.descripcion || '';

  if (materiales && p.materiales) {
    materiales.innerHTML = `<p>Materiales</p><span>${p.materiales}</span>`;
  } else if (materiales) {
    materiales.style.display = 'none';
  }

  if (priceRow) {
    let html = `<span class="feat-price">${p.precio || ''}</span>`;
    if (p.precio_old) html += `<span class="feat-price-old">${p.precio_old}</span>`;
    if (p.descuento) html += `<span class="feat-sale">${p.descuento}</span>`;
    priceRow.innerHTML = html;
  }

  // Talles
  const sizesWrap = document.getElementById('featSizes');
  if (sizesWrap) {
    sizesWrap.innerHTML = '';
    if (talles.length) {
      talles.forEach(t => {
        const chip = document.createElement('div');
        chip.className = 'feat-size-chip' + (!t.disponible ? ' agotado' : '');
        chip.textContent = t.talle;
        chip.onclick = () => {
          document.querySelectorAll('.feat-size-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        };
        sizesWrap.appendChild(chip);
      });
    }
  }

  // Colores
  const colorsBlock = document.getElementById('featColorsBlock');
  const colorsWrap = document.getElementById('featColors');
  if (colorsWrap) {
    colorsWrap.innerHTML = '';
    if (colores.length) {
      colores.forEach((c, i) => {
        const item = document.createElement('div');
        item.className = 'feat-color-item';
        item.innerHTML = `
          <div class="feat-color-dot${i === 0 ? ' active' : ''}" style="background:${c.hex}" title="${c.nombre}"></div>
          <span class="feat-color-name">${c.nombre}</span>
        `;
        item.querySelector('.feat-color-dot').onclick = () => {
          document.querySelectorAll('.feat-color-dot').forEach(d => d.classList.remove('active'));
          item.querySelector('.feat-color-dot').classList.add('active');
        };
        colorsWrap.appendChild(item);
      });
    } else if (colorsBlock) {
      colorsBlock.style.display = 'none';
    }
  }

  // Botón WhatsApp
  const waBtn = document.getElementById('featWaBtn');
  if (waBtn) {
    const tel = p.link_wa || 'https://wa.me/2227466087';
    const msg = encodeURIComponent(`Hola! Me interesa el modelo "${p.nombre || ''}" 🥿`);
    waBtn.href = tel.startsWith('http') ? `${tel}?text=${msg}` : `https://wa.me/${tel}?text=${msg}`;
  }

  // Animar entrada
  setTimeout(() => section.classList.add('loaded'), 50);
}

/* ─────────────────────────────────────────
   RENDERIZAR GRILLA DE PRODUCTOS
───────────────────────────────────────────*/
function renderGrid(productos) {
  const grid = document.getElementById('catProductsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const delays = ['', 'reveal-delay-1', 'reveal-delay-2', 'reveal-delay-3'];

  productos.forEach((p, idx) => {
    const imagenes = parsearImagenes(p);
    const tallesArr = parsearTalles(p.talles);
    const tallesDisp = tallesArr.filter(t => t.disponible).map(t => t.talle).join(' · ') || '';
    const esSale = p.descuento && p.descuento.trim();

    const card = document.createElement('div');
    card.className = `cat-product-card reveal ${delays[idx % 4]}`;

    card.innerHTML = `
      <div class="product-img-wrap">
        <img class="product-img" src="${imagenes[0] || ''}" alt="${p.nombre || ''}">
        <div class="product-overlay">
          <span class="product-quick">Ver modelo</span>
        </div>
        ${esSale ? `<div class="product-tag sale">${p.descuento}</div>` : ''}
      </div>
      <div class="product-info">
        <div class="product-name">${p.nombre || ''}</div>
        ${tallesDisp ? `<div class="product-sizes-preview">Talles: ${tallesDisp}</div>` : ''}
        <div class="product-prices">
          <span class="product-price">${p.precio || ''}</span>
          ${p.precio_old ? `<span class="product-price-old">${p.precio_old}</span>` : ''}
        </div>
      </div>
    `;

    // Al clickear en la card → mostrar como featured y scroll up
    card.addEventListener('click', () => {
      renderFeatured(p);
      document.getElementById('featuredSection')?.scrollIntoView({ behavior: 'smooth' });
    });

    grid.appendChild(card);
  });

  // Iniciar observer de scroll reveal
  grid.querySelectorAll('.reveal').forEach(el => {
    scrollObserver.observe(el);
  });
}

/* ─────────────────────────────────────────
   SORT
───────────────────────────────────────────*/
function sortProducts() {
  const val = document.getElementById('sortSelect')?.value || 'default';
  let arr = [...productosFiltrados];

  const parsePrecio = str => {
    if (!str) return 0;
    return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
  };

  if (val === 'price-asc')  arr.sort((a, b) => parsePrecio(a.precio) - parsePrecio(b.precio));
  if (val === 'price-desc') arr.sort((a, b) => parsePrecio(b.precio) - parsePrecio(a.precio));
  if (val === 'name')       arr.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es'));

  renderGrid(arr);
}

/* ─────────────────────────────────────────
   SCROLL REVEAL (separado de scripts.js)
───────────────────────────────────────────*/
const scrollObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => scrollObserver.observe(el));

/* ─────────────────────────────────────────
   FETCH Y RENDER PRINCIPAL
───────────────────────────────────────────*/
async function iniciarCategoria() {
  categoriaActual = getCatParam();
  const info = CATEGORIAS[categoriaActual];

  // Actualizar título / breadcrumb / eyebrow
  const titleEl   = document.getElementById('catTitle');
  const eyebrowEl = document.getElementById('catEyebrow');
  const breadEl   = document.getElementById('breadcrumbCat');
  const pageTitle  = document.querySelector('title');

  if (info) {
    if (titleEl)   titleEl.textContent  = info.label;
    if (eyebrowEl) eyebrowEl.textContent = info.eyebrow;
    if (breadEl)   breadEl.textContent  = info.label;
    if (pageTitle) pageTitle.textContent = `${info.label} — Luisito Creaciones`;
  } else {
    // Categoría desconocida → redirigir a inicio
    window.location.href = 'index.html';
    return;
  }

  // Renderizar pills nav
  renderPillsNav(categoriaActual);

  // Mostrar spinner
  const loading = document.getElementById('catLoading');
  const empty   = document.getElementById('catEmpty');
  if (loading) loading.style.display = 'flex';

  try {
    const res = await fetch(PRODUCTOS_URL);
    if (!res.ok) throw new Error('No se pudo cargar la planilla');

    const texto = await res.text();
    const filas = parsearCSVcat(texto);

    if (filas.length < 2) throw new Error('Planilla vacía');

    const encabezados = filas[0].map(h => h.toLowerCase().trim().replace(/ /g, '_'));

    todosLosProductos = filas.slice(1).map(fila => {
      const obj = {};
      encabezados.forEach((col, i) => { obj[col] = (fila[i] || '').trim(); });
      return obj;
    });

    // Filtrar por categoría
    productosFiltrados = todosLosProductos.filter(p => {
      const cat = (p.categoria || '').toLowerCase().trim();
      return cat === categoriaActual;
    });

    if (loading) loading.style.display = 'none';

    if (productosFiltrados.length === 0) {
      if (empty) empty.style.display = 'flex';
      return;
    }

    // Contador
    const countEl = document.getElementById('catCount');
    if (countEl) countEl.textContent = `${productosFiltrados.length} modelos disponibles`;

    // Producto destacado = el primero
    renderFeatured(productosFiltrados[0]);

    // Grilla con todos (incluye el primero también)
    renderGrid(productosFiltrados);

  } catch (err) {
    console.error('category.js error:', err.message);
    if (loading) loading.style.display = 'none';
    if (empty) empty.style.display = 'flex';
  }
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', iniciarCategoria);