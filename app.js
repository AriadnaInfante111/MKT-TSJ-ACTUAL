import { categories, laboratories, colors, sizes, campaigns as initialCampaignList, products as initialProducts } from './data.js';

/** 
 * STORE & STATE
 */
const Store = {
    products: initialProducts,
    cart: JSON.parse(localStorage.getItem('pharmaCart')) || [],
    campaigns: JSON.parse(localStorage.getItem('pharmaCampaigns')) || initialCampaignList,
    currentView: localStorage.getItem('pharmaView') || 'cols-3',
    
    saveCart() { localStorage.setItem('pharmaCart', JSON.stringify(this.cart)); this.notify(); },
    saveCampaigns() { localStorage.setItem('pharmaCampaigns', JSON.stringify(this.campaigns)); this.notify(); },
    setView(view) { 
        this.currentView = view; 
        localStorage.setItem('pharmaView', view);
        this.applyView();
    },

    updateQuantity(id, qty) {
        const item = this.cart.find(item => item.id === id);
        if (item) { 
            item.quantity = qty; 
            if (item.quantity <= 0) this.cart = this.cart.filter(p => p.id !== id); 
        } else if (qty > 0) { 
            const p = this.products.find(prod => prod.id === id); 
            this.cart.push({ ...p, quantity: qty }); 
        }
        this.saveCart();
    },

    clearCart() {
        this.cart = [];
        this.saveCart();
    },

    getQuantity(id) {
        const item = this.cart.find(item => item.id === id);
        return item ? item.quantity : 0;
    },

    applyView() {
        const grid = document.getElementById('productGrid');
        if (grid) grid.className = `product-grid ${this.currentView}`;
        
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.currentView);
        });
    },

    notify() {
        updateCartCount();
        renderCart();
        if (document.getElementById('productGrid')) updateGridQuantities(); // Sync inputs without re-rendering everything
        
        const detailContainer = document.getElementById('productDetail');
        if (detailContainer) {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            if (productId) renderProductDetail(parseInt(productId));
        }
    }
};

let activeFilters = { search: '', categories: [], laboratories: [], colors: [], sizes: [], campaigns: [], onlyFavorites: false };

// DOM Elements Helpers
const getProductGrid = () => document.getElementById('productGrid');
const getCartCountBadge = () => document.getElementById('cartCount');

// Helper to fix paths when in subfolders (like /admin/)
export function fixPath(path) {
    if (path.startsWith('http')) return path; // Don't fix full URLs
    if (window.location.pathname.includes('/admin/')) return '../' + path.replace('./', '');
    return path;
}

function formatNumber(num, decimals = 0) {
    return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function getUnitBreakdown(totalUnits, packSize) {
    const pack = parseInt(packSize) || 12;
    const packs = Math.floor(totalUnits / pack);
    const units = totalUnits % pack;
    
    if (packs === 0) return `${units} unidad${units !== 1 ? 'es' : ''}`;
    
    let res = `${packs} paquete${packs !== 1 ? 's' : ''} de ${pack}`;
    if (units > 0) res += ` + ${units} unidad${units !== 1 ? 'es' : ''}`;
    return res;
}

function renderHeader() {
    const headerContainer = document.getElementById('mainHeader');
    if (!headerContainer) return;

    const isStorePage = !!document.getElementById('productGrid');
    const isOrdersPage = window.location.pathname.includes('pedidos.html');
    
    headerContainer.innerHTML = `
    <header>
        <div class="container header-content">
            <div class="header-left">
                <a href="${fixPath('index.html')}" class="logo">TOUCH<span>.</span></a>
            </div>

            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="Busca por producto, fabricante o línea..." autocomplete="off">
            </div>

            <div class="header-actions">
                <div class="promos-wrapper">
                    <a href="${fixPath('admin/promociones.html')}" class="promos-link">Promos</a>
                    <div class="mega-menu" id="megaMenu">
                        <!-- Dynamic Promotions -->
                    </div>
                </div>

                <div class="account-menu-wrapper">
                    <button class="icon-button account-btn" id="accountBtn" title="Mi Cuenta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </button>
                    <div class="account-dropdown" id="accountDropdown">
                        <div class="dropdown-header">
                            <strong>Bienvenido, Usuario</strong>
                            <p class="label-extra-small">neisser@ejemplo.com</p>
                        </div>
                        <a href="${fixPath('pedidos.html?tab=pedidos')}" class="${isOrdersPage ? 'active' : ''}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:10px;"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> Mis Pedidos
                        </a>
                        <a href="${fixPath('pedidos.html?tab=estado')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:10px;"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> Mi Estado de Cuenta
                        </a>
                        <a href="${fixPath('pedidos.html?tab=direcciones')}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:10px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Mis Direcciones
                        </a>
                    </div>
                </div>

                <button class="icon-button" id="favoritesBtn" title="Favoritos">
                    <svg xmlns="http://www.w3.org/2000/svg" id="headerHeart" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>

                <button class="icon-button" id="cartBtn" title="Carrito">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    <span class="badge" id="cartCount">0</span>
                </button>

                <div class="dots-menu-wrapper">
                    <button class="icon-button" id="dotsMenuBtn" title="Más opciones">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                    <div class="dots-dropdown" id="dotsDropdown">
                        <a href="${fixPath('admin/catalogo.html')}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> Administrar</a>
                        <a href="${fixPath('components.html')}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Guía de Estilos</a>
                        <a href="#" id="logoutBtn" style="color: #ea4335;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Salir</a>
                    </div>
                </div>
            </div>
        </div>
    </header>
    `;
}

function init() {
    // Session Check
    const user = localStorage.getItem('pharma_user');
    const isLoginPage = window.location.pathname.includes('login.html');
    const isTermsPage = window.location.pathname.includes('terminos.html');

    if (!user && !isLoginPage && !isTermsPage) {
        window.location.href = fixPath('login.html');
        return;
    }

    renderHeader();
    renderFilterLists();
    renderMegaMenu();
    
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId && document.getElementById('productDetail')) {
        renderProductDetail(parseInt(productId));
    } else if (getProductGrid()) {
        // Check for search param in URL
        const searchParam = urlParams.get('search');
        if (searchParam && document.getElementById('searchInput')) {
            document.getElementById('searchInput').value = searchParam;
            activeFilters.search = searchParam;
        }

        // Check for promo param
        const promoParam = urlParams.get('promo');
        if (promoParam) {
            activeFilters.campaigns = [promoParam];
            // Also need to check the checkbox in sidebar if it exists
            setTimeout(() => {
                const cb = document.querySelector(`input[data-type="campaigns"][data-value="${promoParam}"]`);
                if (cb) cb.checked = true;
            }, 100);
        }

        // Check for favorites param
        const favsParam = urlParams.get('favs');
        if (favsParam === 'true') {
            activeFilters.favoritesOnly = true;
            const hBtn = document.getElementById('favoritesBtn');
            if (hBtn) hBtn.querySelector('svg').style.fill = 'var(--heart-red)';
        }

        renderProducts();
        Store.applyView();
    }
    
    setupEventListeners();
    updateCartCount();
    renderCart();
}

function renderFilterLists() {
    const renderItems = (id, items, type) => {
        const container = document.getElementById(id);
        if (container) {
            container.innerHTML = items.map(item => {
                const val = typeof item === 'object' ? item.name : item;
                return `<li class="filter-item"><input type="checkbox" id="${type}-${val}" data-type="${type}" data-value="${val}"><label for="${type}-${val}">${val}</label></li>`;
            }).join('');
        }
    };
    renderItems('categoryFilters', categories, 'categories');
    renderItems('labFilters', laboratories, 'laboratories');
    renderItems('colorFilters', colors, 'colors');
    renderItems('sizeFilters', sizes, 'sizes');
    renderItems('campaignFilters', Store.campaigns, 'campaigns');
}

function updateGridQuantities() {
    const grid = getProductGrid();
    if (!grid) return;
    const selectors = grid.querySelectorAll('.qty-selector');
    selectors.forEach(sel => {
        const id = parseInt(sel.dataset.id);
        const input = sel.querySelector('.qty-input');
        if (input) {
            const currentQty = Store.getQuantity(id);
            input.value = currentQty || 1;
        }
    });
}

function renderProducts(skipAnim = false) {
    const grid = getProductGrid();
    if (!grid) return;

    const campaignHeader = document.getElementById('campaignHeader');

    const render = () => {
        const filtered = Store.products.filter(p => {
            const search = activeFilters.search.toLowerCase();
            const matchesSearch = p.name.toLowerCase().includes(search) || (p.laboratory && p.laboratory.toLowerCase().includes(search));
            const matchesCat = activeFilters.categories.length === 0 || activeFilters.categories.includes(p.category);
            const matchesLab = activeFilters.laboratories.length === 0 || activeFilters.laboratories.includes(p.laboratory);
            const matchesColor = activeFilters.colors.length === 0 || activeFilters.colors.some(c => p.colores.includes(c));
            const matchesSize = activeFilters.sizes.length === 0 || activeFilters.sizes.includes(p.dimensiones);
            const matchesCamp = activeFilters.campaigns.length === 0 || activeFilters.campaigns.some(c => p.offers.includes(c));
            const matchesFav = !activeFilters.onlyFavorites || p.isFavorite;
            return matchesSearch && matchesCat && matchesLab && matchesColor && matchesSize && matchesCamp && matchesFav;
        });

        if (campaignHeader) {
            campaignHeader.classList.remove('fading');
            if (activeFilters.campaigns.length === 1) {
                const campName = activeFilters.campaigns[0];
                const c = Store.campaigns.find(camp => camp.name === campName);
                if (c) {
                    const count = Store.products.filter(p => p.offers.includes(c.name)).length;
                    campaignHeader.innerHTML = `
                        <div class="campaign-header-top">
                            <div class="campaign-header-title"><span>${c.name}</span></div>
                            <div class="mega-promo-date" style="font-size: 0.9rem;">${formatPromoDate(c.startDate, c.endDate)}</div>
                        </div>
                        <div class="campaign-header-desc">${c.description || 'Promoción especial por tiempo limitado.'}</div>
                        <div class="campaign-header-footer">
                            <span class="label-small"><strong>${count}</strong> productos encontrados en esta campaña</span>
                        </div>
                    `;
                    campaignHeader.style.display = 'flex';
                }
            } else {
                campaignHeader.style.display = 'none';
            }
        }

        if (document.getElementById('productCount')) document.getElementById('productCount').textContent = `Mostrando ${filtered.length} productos`;
        grid.innerHTML = filtered.map(p => renderCardHTML(p)).join('');
        
        if (!skipAnim) {
            grid.classList.remove('fading');
            void grid.offsetWidth;
            grid.classList.add('fade-scale-in');
        }
    };

    if (skipAnim) {
        render();
    } else {
        grid.classList.add('fading');
        grid.classList.remove('fade-scale-in');
        if (campaignHeader) campaignHeader.classList.add('fading');
        setTimeout(render, 300);
    }
}

function renderCardHTML(p) {
    const qty = Store.getQuantity(p.id);
    
    return `
        <article class="product-card">
            <div class="card-image-wrapper">
                <a href="${fixPath('producto.html')}?id=${p.id}"><img src="${fixPath(p.image)}"></a>
                <button class="favorite-btn ${p.isFavorite ? 'active' : ''}" data-id="${p.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${p.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
                ${p.offers.length > 0 ? `<span class="card-tag">${p.offers[0] === 'Día de la Madre' ? 'Día de la Madre -50%' : p.offers[0]}</span>` : ''}
            </div>
            <div class="card-info">
                 <span class="card-articulo">${p.articulo}</span>
                 <a href="${fixPath('producto.html')}?id=${p.id}" class="card-name-link">
                    <h6 class="card-name">${p.name}</h6>
                    <span class="card-brand">${p.laboratory}</span>
                 </a>
                  <div class="card-price">
                      S/ ${p.price.toFixed(2)}
                      ${p.originalPrice ? `<span class="original-price" style="text-decoration: line-through; font-size: 0.85rem; color: var(--secondary-text); margin-left: 8px; font-weight: 400;">S/ ${p.originalPrice.toFixed(2)}</span>` : ''}
                  </div>
                 <div class="card-meta">Pack: ${p.pack} | Color: ${p.colorCode}</div>
            </div>
            <div class="card-actions">
                <div class="qty-selector" data-id="${p.id}">
                    <button class="qty-btn minus" data-id="${p.id}">-</button>
                    <input type="number" value="${qty || 1}" class="qty-input" id="qty-${p.id}">
                    <button class="qty-btn plus" data-id="${p.id}">+</button>
                </div>
                <div class="card-btn-group">
                    <button class="add-btn pack-add-btn" data-id="${p.id}" data-tooltip="Agregar 1 Paquete (+${p.pack})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16h6"/><path d="M19 13v6"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
                    </button>
                    <button class="add-btn cart-add-btn" data-id="${p.id}" data-tooltip="Agregar cantidad actual">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    </button>
                </div>
            </div>
        </article>`;
}

window.changeProductImage = function(src, thumbElement) {
    const mainImg = document.getElementById('mainProductImg');
    if (!mainImg) return;
    mainImg.style.transition = 'opacity 0.2s ease-in-out';
    mainImg.style.opacity = '0';
    setTimeout(() => {
        mainImg.src = src;
        mainImg.style.opacity = '1';
    }, 200);
    
    // Update active class on thumbnails
    const thumbnails = thumbElement.parentNode.querySelectorAll('.detail-thumb');
    thumbnails.forEach(t => t.classList.remove('active'));
    thumbElement.classList.add('active');
};

window.nextProductImage = function(btnElement) {
    const gallery = btnElement.closest('.product-gallery');
    if (!gallery) return;
    const thumbs = Array.from(gallery.querySelectorAll('.detail-thumb'));
    if (thumbs.length <= 1) return;
    const activeIndex = thumbs.findIndex(t => t.classList.contains('active'));
    const nextIndex = (activeIndex + 1) % thumbs.length;
    thumbs[nextIndex].click();
};

window.prevProductImage = function(btnElement) {
    const gallery = btnElement.closest('.product-gallery');
    if (!gallery) return;
    const thumbs = Array.from(gallery.querySelectorAll('.detail-thumb'));
    if (thumbs.length <= 1) return;
    const activeIndex = thumbs.findIndex(t => t.classList.contains('active'));
    const prevIndex = (activeIndex - 1 + thumbs.length) % thumbs.length;
    thumbs[prevIndex].click();
};

function renderProductDetail(id) {
    const detail = document.getElementById('productDetail');
    if (!detail) return;
    const p = initialProducts.find(prod => prod.id === id);
    if (!p) { detail.innerHTML = '<h2>No encontrado</h2>'; return; }
    const qty = Store.getQuantity(p.id);
    document.title = `${p.name} - iSAGI Shop and bulk`;
    
    const relatedColors = initialProducts.filter(prod => prod.articulo === p.articulo && prod.dimensiones === p.dimensiones && prod.id !== p.id);
    const relatedSizes = initialProducts.filter(prod => prod.articulo === p.articulo && prod.dimensiones !== p.dimensiones);

    detail.innerHTML = `
        <div class="product-detail-container">
            <div class="product-gallery">
                <div class="product-detail-img">
                    <button class="gallery-nav-btn prev-btn" onclick="window.prevProductImage(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                    <img id="mainProductImg" src="${fixPath(p.image)}" style="transition: opacity 0.2s ease-in-out;">
                    <button class="gallery-nav-btn next-btn" onclick="window.nextProductImage(this)">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                </div>
                <div class="detail-thumbnails">
                    <div class="detail-thumb active" onclick="window.changeProductImage('${fixPath(p.image)}', this)">
                        <img src="${fixPath(p.image)}">
                    </div>
                    <div class="detail-thumb" onclick="window.changeProductImage('${fixPath(p.image2)}', this)">
                        <img src="${fixPath(p.image2)}">
                    </div>
                </div>
            </div>
            <div class="product-detail-info">
                <h1 style="margin-bottom: 5px;">${p.name}</h1>
                <div class="detail-subtitle" style="font-size: 1.1rem; color: var(--secondary-text); margin-bottom: 10px; font-weight: 500;">${p.laboratory} | ${p.category}</div>
                
                <div class="product-metadata" style="margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-top: 1px solid var(--medium-gray); padding-top: 20px;">
                    <div class="meta-item"><strong>Fabricante:</strong> ${p.laboratory}</div>
                    <div class="meta-item"><strong>Línea:</strong> ${p.category}</div>
                    <div class="meta-item"><strong>Artículo:</strong> ${p.articulo}</div>
                    <div class="meta-item"><strong>Dimensiones:</strong> ${p.dimensiones}</div>
                    <div class="meta-item"><strong>Pack:</strong> ${p.pack}</div>
                    <div class="meta-item" style="grid-column: span 2; margin-top: 10px; padding: 12px; background: var(--light-gray); border-radius: 8px;">
                        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--secondary-text); margin-bottom: 4px;">Color</div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--primary-text);">${p.colorCode} - ${p.colores[0]}</div>
                    </div>
                </div>

                <div class="availability-section" style="border-top: 1px solid var(--medium-gray); padding-top: 15px; margin-top: 15px;">
                    <strong>Disponibilidad</strong>
                    <div style="font-size: 0.95rem; color: var(--secondary-text); margin-top: 8px;">
                        Disponible: <strong style="font-size: 1.2rem; color: var(--primary-text); margin-right: 2px;">${p.stock_unidades}</strong> unidades, <strong style="font-size: 1.2rem; color: var(--primary-text); margin-right: 2px;">${p.stock_paquetes}</strong> paquetes
                    </div>
                </div>

                <div class="detail-price" style="font-size: 2rem; color: var(--primary-text); margin: 20px 0; display: flex; align-items: center; gap: 12px;">
                    S/ ${p.price.toFixed(2)}
                    ${p.originalPrice ? `<span class="original-price" style="text-decoration: line-through; font-size: 1.3rem; color: var(--secondary-text); font-weight: 400;">S/ ${p.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                
                <div class="detail-actions">
                    <div class="qty-selector" style="height:48px;">
                        <button class="qty-btn minus" data-id="${p.id}">-</button>
                        <input type="number" value="${qty || 1}" class="qty-input" id="qty-${p.id}" style="width:60px;">
                        <button class="qty-btn plus" data-id="${p.id}">+</button>
                    </div>
                    <button class="add-btn btn-primary" data-id="${p.id}" style="height:48px; flex: 1;">${qty ? 'Actualizar Carrito' : 'Agregar al Carrito'}</button>
                </div>
            </div>
        </div>

        <div class="related-sections-container" style="margin-top: 50px; border-top: 1px solid var(--medium-gray); padding-top: 30px;">
            ${relatedColors.length > 0 ? `
                <div class="related-section" style="margin-bottom: 40px;">
                    <h4 style="margin-bottom: 20px; font-size: 1.5rem;">Colores Disponibles</h4>
                    <div class="related-grid" style="display: flex; flex-wrap: wrap; gap: 16px;">
                        ${relatedColors.map(rc => `
                            <a href="${fixPath('producto.html')}?id=${rc.id}" class="mini-card" style="text-decoration: none; color: inherit; width: calc(12.5% - 16px); min-width: 110px; background: var(--white); border: 1px solid var(--medium-gray); border-radius: 12px; overflow: hidden; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: block;">
                                <div class="mini-card-img" style="height: 90px; background: var(--light-gray); display: flex; align-items: center; justify-content: center; padding: 10px;">
                                    <img src="${fixPath(rc.image2 || rc.image)}" style="max-height: 100%; max-width: 100%; object-fit: contain; transition: transform 0.3s ease;">
                                </div>
                                <div class="mini-card-info" style="padding: 10px; text-align: center;">
                                    <div style="font-size: 0.8rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${rc.colorCode} ${rc.colores[0]}</div>
                                    <div style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin-top: 4px;">S/ ${rc.price.toFixed(2)}</div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${relatedSizes.length > 0 ? `
                <div class="related-section">
                    <h4 style="margin-bottom: 20px; font-size: 1.5rem;">Otros Tamaños</h4>
                    <div class="related-grid" style="display: flex; flex-wrap: wrap; gap: 16px;">
                        ${relatedSizes.map(rs => `
                            <a href="${fixPath('producto.html')}?id=${rs.id}" class="mini-card" style="text-decoration: none; color: inherit; width: calc(14.28% - 16px); min-width: 130px; background: var(--white); border: 1px solid var(--medium-gray); border-radius: 12px; overflow: hidden; transition: var(--transition); box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                <div class="mini-card-img" style="height: 90px; background: var(--light-gray); display: flex; align-items: center; justify-content: center; padding: 10px;">
                                    <img src="${fixPath(rs.image)}" style="max-height: 100%; max-width: 100%; object-fit: contain;">
                                </div>
                                <div class="mini-card-info" style="padding: 10px; text-align: center;">
                                    <div style="font-size: 0.8rem; font-weight: 600;">${rs.dimensiones}</div>
                                    <div style="font-size: 0.75rem; color: var(--secondary-text); margin-top: 4px;">${rs.colores[0]}</div>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>`;
}

function setupEventListeners() {
    // Search Filter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const isStorePage = !!document.getElementById('productGrid');
            if (isStorePage) {
                activeFilters.search = e.target.value;
                renderProducts();
            }
        });

        // Redirect to store if enter is pressed on a non-store page
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const isStorePage = !!document.getElementById('productGrid');
                if (!isStorePage) {
                    window.location.href = `${fixPath('index.html')}?search=${encodeURIComponent(e.target.value)}`;
                }
            }
        });
    } 
    
    // Global Click Delegation
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // View Buttons
        const viewBtn = target.closest('.view-btn');
        if (viewBtn) {
            Store.setView(viewBtn.dataset.view);
            return;
        }
        
        // Mega Menu Interaction
        const megaCard = target.closest('.mega-promo-card');
        if (megaCard) {
            const promoName = megaCard.dataset.name;
            const isStorePage = !!document.getElementById('productGrid');
            
            if (isStorePage) {
                const checkbox = document.querySelector(`input[data-type="campaigns"][data-value="${promoName}"]`);
                if (checkbox) {
                    document.querySelectorAll('input[data-type="campaigns"]').forEach(cb => cb.checked = false);
                    checkbox.checked = true;
                    activeFilters.campaigns = [promoName];
                    renderProducts();
                }
            } else {
                window.location.href = `${fixPath('index.html')}?promo=${encodeURIComponent(promoName)}`;
            }
            return;
        }

        // Header Favorites Button
        const favBtn = target.closest('#favoritesBtn');
        if (favBtn) {
            const isStorePage = !!document.getElementById('productGrid');
            if (isStorePage) {
                activeFilters.onlyFavorites = !activeFilters.onlyFavorites;
                const svg = favBtn.querySelector('svg');
                if (svg) {
                    svg.style.fill = activeFilters.onlyFavorites ? 'var(--heart-red)' : 'none';
                    svg.style.color = activeFilters.onlyFavorites ? 'var(--heart-red)' : 'currentColor';
                }
                favBtn.classList.toggle('active', activeFilters.onlyFavorites);
                renderProducts();
            } else {
                window.location.href = `${fixPath('index.html')}?favs=true`;
            }
            return;
        }

        const id = parseInt(target.closest('[data-id]')?.dataset.id);
        if (!id) return;

        // Favorites
        if (target.closest('.favorite-btn')) {
            const btn = target.closest('.favorite-btn');
            const p = initialProducts.find(prod => prod.id === id);
            p.isFavorite = !p.isFavorite;
            
            // Toggle active class and SVG fill on the clicked button
            btn.classList.toggle('active', p.isFavorite);
            const svg = btn.querySelector('svg');
            if (svg) {
                svg.setAttribute('fill', p.isFavorite ? 'currentColor' : 'none');
            }

            const h = document.getElementById('headerHeart');
            if (h) { 
                h.classList.remove('anim-heartbeat'); 
                void h.offsetWidth; 
                h.classList.add('anim-heartbeat'); 
                h.style.fill = p.isFavorite ? 'var(--heart-red)' : 'none'; 
                h.style.color = p.isFavorite ? 'var(--heart-red)' : 'inherit'; 
            }

            if (activeFilters.onlyFavorites) {
                renderProducts(true); // Re-render without entry animation to remove the unfavorited item
            } else {
                Store.notify();
            }
        } 
        // Add to Cart
        if (e.target.closest('.add-btn')) {
            const btn = e.target.closest('.add-btn');
            const id = parseInt(btn.dataset.id);
            
            // Check if it's inside the cart drawer
            const isInsideCart = btn.closest('.cart-drawer');
            let input;
            if (isInsideCart) {
                input = btn.closest('.cart-item')?.querySelector('.qty-input');
            } else {
                input = document.getElementById(`qty-${id}`);
            }

            let currentQtyInInput = input ? (parseInt(input.value) || 1) : 1;
            const product = Store.products.find(p => p.id === id);
            const packSize = parseInt(product?.pack) || 12;

            const currentQtyInStore = Store.getQuantity(id);

            if (btn.classList.contains('cart-add-btn')) {
                // Sincroniza el carrito exactamente con el valor del input.
                // Si el input marca 7, el carrito queda en 7 — sin auto-incremento.
                if (input) input.value = currentQtyInInput; // mantener el campo visible con el valor correcto
                Store.updateQuantity(id, currentQtyInInput);
            } 
            else if (btn.classList.contains('pack-add-btn')) {
                // Si el input aún está en su valor inicial (1) → saltar directo al primer paquete.
                // Si ya tiene una cantidad real → sumar un paquete completo sobre lo actual.
                const newVal = (currentQtyInInput <= 1) ? packSize : (currentQtyInInput + packSize);
                if (input) input.value = newVal;
                Store.updateQuantity(id, newVal);
            }
            else {
                // Botón genérico (ej. en detalle de producto)
                Store.updateQuantity(id, currentQtyInInput);
            }

            // Click Pulse Animation
            btn.classList.add('btn-click-pulse');
            setTimeout(() => btn.classList.remove('btn-click-pulse'), 400);
            
            // Badge Animation is handled inside updateCartCount() called by Store.notify() via updateQuantity()
        } 
        // Plus/Minus
        else if (target.closest('.qty-btn.plus')) {
            const container = target.closest('.qty-selector');
            const i = container.querySelector('.qty-input') || document.getElementById(`qty-${id}`);
            if (i) {
                i.value = parseInt(i.value) + 1;
                if (target.closest('.cart-drawer')) Store.updateQuantity(id, parseInt(i.value));
            }
        } else if (target.closest('.qty-btn.minus')) {
            const container = target.closest('.qty-selector');
            const i = container.querySelector('.qty-input') || document.getElementById(`qty-${id}`);
            if (i) {
                const newVal = parseInt(i.value) - 1;
                if (newVal >= 1) {
                    i.value = newVal;
                    if (target.closest('.cart-drawer')) Store.updateQuantity(id, newVal);
                } else if (target.closest('.cart-drawer')) {
                    Store.updateQuantity(id, 0); // Eliminar si llega a 0 en el carrito
                }
            }
        }

    });

    // Handle direct input change (in cart or in product cards)
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('qty-input')) {
            const id = parseInt(e.target.closest('[data-id]')?.dataset.id || e.target.id?.replace('qty-', ''));
            if (id) {
                const val = Math.max(0, parseInt(e.target.value) || 0);
                const isCart = e.target.closest('.cart-drawer');
                const currentInStore = Store.getQuantity(id);
                
                // Si está en el carrito o es un cambio manual en la tarjeta, actualizamos
                if (isCart || currentInStore > 0) {
                    Store.updateQuantity(id, val);
                }
            }
        }
    });

    // Cart Drawer Toggle
    const cb = document.getElementById('cartBtn'); 
    if (cb) cb.addEventListener('click', () => { 
        document.getElementById('cartDrawer').classList.add('active'); 
        document.getElementById('cartOverlay').classList.add('active'); 
    });
    
    const clc = document.getElementById('closeCart'); 
    if (clc) clc.addEventListener('click', () => { 
        document.getElementById('cartDrawer').classList.remove('active'); 
        document.getElementById('cartOverlay').classList.remove('active'); 
    });

    const overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', () => {
        document.getElementById('cartDrawer').classList.remove('active'); 
        document.getElementById('cartOverlay').classList.remove('active'); 
    });

    // Filter Drawer Toggle (Mobile/Tablet)
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const filterOverlay = document.getElementById('filterOverlay');
    const sidebarEl = document.getElementById('sidebar');

    if (filterToggleBtn) {
        filterToggleBtn.addEventListener('click', () => {
            sidebarEl?.classList.add('active');
            filterOverlay?.classList.add('active');
        });
    }

    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebarEl?.classList.remove('active');
            filterOverlay?.classList.remove('active');
        });
    }

    if (filterOverlay) {
        filterOverlay.addEventListener('click', () => {
            sidebarEl?.classList.remove('active');
            filterOverlay?.classList.remove('active');
        });
    }

    // Sidebar Filters (Categories, Laboratories, Campaigns)
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.addEventListener('change', (e) => {
            const cb = e.target;
            if (cb.type !== 'checkbox') return;
            const type = cb.dataset.type;   // 'categories' | 'laboratories' | 'campaigns'
            const value = cb.dataset.value;
            if (!type || !value) return;

            if (cb.checked) {
                if (!activeFilters[type].includes(value)) activeFilters[type].push(value);
            } else {
                activeFilters[type] = activeFilters[type].filter(v => v !== value);
            }
            renderProducts();
        });
    }

    // Note: Favorites Navbar Toggle is handled in global click delegation above

    // Dots Menu Toggle
    const dotsBtn = document.getElementById('dotsMenuBtn');
    if (dotsBtn) {
        dotsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('accountDropdown')?.classList.remove('active');
            document.getElementById('dotsDropdown')?.classList.toggle('active');
        });
    }

    // Account Menu Toggle
    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
        accountBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('dotsDropdown')?.classList.remove('active');
            document.getElementById('accountDropdown')?.classList.toggle('active');
        });
    }
    
    document.addEventListener('click', () => {
        document.getElementById('dotsDropdown')?.classList.remove('active');
        document.getElementById('accountDropdown')?.classList.remove('active');
    });

    // Logout Logic
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('pharma_user');
            window.location.href = fixPath('login.html');
        });
    }

    // Clear Cart Modal Logic
    const clearCartBtn = document.getElementById('clearCartBtn');
    const confirmModal = document.getElementById('confirmModal');
    const confirmModalBtn = document.getElementById('confirmModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            confirmModal.classList.add('active');
        });
    }

    if (confirmModalBtn) {
        confirmModalBtn.addEventListener('click', () => {
            Store.clearCart();
            confirmModal.classList.remove('active');
        });
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', () => {
            confirmModal.classList.remove('active');
        });
    }

    // Close modal on overlay click
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) confirmModal.classList.remove('active');
        });
    }
}

function updateCartCount() {
    const b = getCartCountBadge();
    if (b) {
        b.textContent = Store.cart.reduce((a, i) => a + i.quantity, 0);
        b.classList.remove('badge-animate');
        void b.offsetWidth; // trigger reflow
        b.classList.add('badge-animate');
    }
}

function renderCart() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    const subtotalText = document.getElementById('cartSubtotalText');
    const taxText = document.getElementById('cartTaxText');
    const totalText = document.getElementById('cartTotalText');
    const clearBtn = document.getElementById('clearCartBtn');
    const body = document.getElementById('cartBody');

    if (checkoutBtn) {
        Store.cart.length === 0 ? checkoutBtn.classList.add('disabled') : checkoutBtn.classList.remove('disabled');
    }

    if (!body) return;
    
    if (!Store.cart.length) { 
        body.innerHTML = `
            <div class="cart-empty" style="text-align:center; padding: 60px 20px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--secondary-text); opacity: 0.4; margin-bottom: 25px;"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                <h3 style="font-size: 1.3rem; color: var(--primary-text); margin-bottom: 10px; font-weight: 700;">Tu carrito está vacío</h3>
                <p style="font-size: 0.95rem; color: var(--secondary-text); max-width: 250px; margin: 0 auto; line-height: 1.5;">¡Agrega algunos productos técnicos para comenzar tu pedido!</p>
            </div>`;
        
        // Hide financial rows and clear button
        const footer = document.querySelector('.cart-footer');
        if (footer) footer.style.display = 'none';
        return;
    }

    // Show footer if cart has items
    const footer = document.querySelector('.cart-footer');
    if (footer) footer.style.display = 'block';

    if (clearBtn) clearBtn.style.display = '';

    body.innerHTML = Store.cart.map(i => `
        <div class="cart-item">
            <img src="${fixPath(i.image)}" class="cart-item-img">
            <div class="cart-item-info">
                <div>
                    <div class="cart-item-name">${i.name}</div>
                    <div class="unit-breakdown" style="font-size: 0.8rem; color: var(--secondary-text); font-weight: 500;">
                        ${getUnitBreakdown(i.quantity, i.pack)}
                    </div>
                </div>
                <div class="cart-item-qty-container">
                    <div class="qty-selector" data-id="${i.id}">
                        <button class="qty-btn minus" data-tooltip="Disminuir cantidad">
                            ${i.quantity === 1 
                                ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>` 
                                : '-'}
                        </button>
                        <input type="number" value="${i.quantity}" class="qty-input">
                        <button class="qty-btn plus" data-tooltip="Aumentar cantidad">+</button>
                    </div>
                    <button class="add-btn pack-add-btn inside-cart" data-id="${i.id}" data-tooltip="Agregar 1 Paquete (+${i.pack || 12})" style="width: 40px; height: 40px; padding: 0; border-radius: var(--radius-button); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; border: none; background: #ffd64a; color: #222;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 16h6"/><path d="M19 13v6"/><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>
                    </button>
                </div>
            </div>
            <div class="cart-item-right">
                <div class="cart-item-price">
                    ${i.originalPrice ? `<span style="text-decoration: line-through; font-size: 0.75rem; color: var(--secondary-text); margin-right: 6px; font-weight: 400;">S/ ${formatNumber(i.originalPrice, 2)}</span>` : ''}
                    S/ ${formatNumber(i.price, 2)} c/u
                </div>
                <div>
                    <div class="cart-item-units">${formatNumber(i.quantity)} Unid.</div>
                    <div class="cart-item-total-price">S/ ${formatNumber(i.price * i.quantity, 2)}</div>
                </div>
            </div>
        </div>
    `).join('');

    const subtotal = Store.cart.reduce((a, i) => a + (i.price * i.quantity), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;

    if (subtotalText) subtotalText.textContent = `S/ ${formatNumber(subtotal, 2)}`;
    if (taxText) taxText.textContent = `S/ ${formatNumber(tax, 2)}`;
    if (totalText) totalText.textContent = `S/ ${formatNumber(total, 2)}`;

    // Update visibility of Clear Cart link
    if (clearBtn) clearBtn.style.display = Store.cart.length > 0 ? '' : 'none';
}

function formatPromoDate(startStr, endStr) {
    const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    
    // Split to avoid timezone issues with new Date(str)
    const [sY, sM, sD] = startStr.split('-').map(Number);
    const [eY, eM, eD] = endStr.split('-').map(Number);
    
    const startDate = new Date(sY, sM - 1, sD);
    const endDate = new Date(eY, eM - 1, eD);

    if (startStr === endStr) {
        return `Válido solo el ${sD} de ${months[sM-1]}`;
    }

    if (sM === eM && sY === eY) {
        return `Válido del ${sD} al ${eD} de ${months[sM-1]}`;
    }

    let startPart = `${sD} de ${months[sM-1]}`;
    if (sY !== eY) startPart += ` ${sY}`;
    
    let endPart = `${eD} de ${months[eM-1]}`;
    if (sY !== eY) endPart += ` ${eY}`;

    return `Válido del ${startPart} al ${endPart}`;
}

function renderMegaMenu() {
    const menu = document.getElementById('megaMenu');
    if (!menu) return;

    menu.innerHTML = Store.campaigns.map(c => {
        const count = Store.products.filter(p => p.offers.includes(c.name)).length;
        return `
            <div class="mega-promo-card" data-name="${c.name}" style="cursor: pointer;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div class="mega-promo-name">${c.name}</div>
                    <span class="label-extra-small" style="background: var(--white); padding: 2px 8px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">${count} productos</span>
                </div>
                <div class="mega-promo-desc">${c.description || 'Promoción por tiempo limitado.'}</div>
                <div class="mega-promo-date">${formatPromoDate(c.startDate, c.endDate)}</div>
            </div>
        `;
    }).join('');
}

init();
