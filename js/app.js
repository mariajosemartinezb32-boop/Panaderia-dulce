/**
 * Aplicación Principal — Dulce Tentación
 * Panadería & Repostería Artesanal (Tocaima, Cundinamarca)
 * Catálogo, Canasta de compras, Cotizador de Tortas y Cajero POS
 */

let currentBakeryCategory = 'all';
let bakerySearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Inicializar administración
  if (window.AdminUI) {
    window.AdminUI.init();
  }

  renderCategories();
  renderProducts();
  setupSearchAndFilters();
  setupCartDrawer();
  setupCheckoutModal();
  setupCustomCakeForm();
  setupPOSModal();
  setupScrollAnimations();
}

/**
 * 1. Categorías Dinámicas de Panadería
 */
function renderCategories() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  const allProds = ProductStore.getAll();

  const categories = [
    { id: 'all', name: 'Todos los Productos', icon: '🥖', count: allProds.length },
    { id: 'panes', name: 'Panadería Artesanal', icon: '🥐', count: allProds.filter(p => p.category === 'panes').length },
    { id: 'postres', name: 'Tortas & Postres', icon: '🎂', count: allProds.filter(p => p.category === 'postres').length },
    { id: 'galletas', name: 'Galletas & Polvorones', icon: '🍪', count: allProds.filter(p => p.category === 'galletas').length },
    { id: 'combos', name: 'Combos Especiales', icon: '☕', count: allProds.filter(p => p.category === 'combos').length }
  ];

  container.innerHTML = categories.map(cat => `
    <button type="button" class="category-btn ${currentBakeryCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
      <span class="cat-icon">${cat.icon}</span>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-badge">${cat.count}</span>
    </button>
  `).join('');

  container.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentBakeryCategory = btn.dataset.category;
      renderProducts();
    });
  });
}

/**
 * 2. Catálogo de Productos de Panadería
 */
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const countLabel = document.getElementById('products-count-label');
  if (!grid) return;

  const allProds = ProductStore.getAll();
  const isAdmin = window.AdminAuth && window.AdminAuth.isLoggedIn();

  let filtered = allProds.filter(p => {
    const matchCat = currentBakeryCategory === 'all' || p.category === currentBakeryCategory;
    const matchSearch = !bakerySearchQuery ||
      (p.name && p.name.toLowerCase().includes(bakerySearchQuery)) ||
      (p.description && p.description.toLowerCase().includes(bakerySearchQuery)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(bakerySearchQuery));
    return matchCat && matchSearch;
  });

  if (countLabel) {
    countLabel.textContent = `Mostrando ${filtered.length} delicia${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="no-products-found" style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #fff; border-radius: 12px; border: 1px dashed #e2e8f0;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🥖🔍</div>
        <h3>No encontramos productos con ese término</h3>
        <p style="color: var(--text-muted); margin-bottom: 16px;">Prueba buscando por pan de queso, chocolate, galletas o torta...</p>
        <button type="button" class="btn btn-outline" onclick="resetBakeryFilters()">Ver Todos los Productos</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(prod => {
    const isAvail = prod.available !== false;
    return `
      <article class="product-card ${isAdmin ? 'admin-card-mode' : ''}" data-id="${prod.id}">
        ${isAdmin ? `
          <div class="admin-quick-actions-bar">
            <span class="admin-quick-label">Modo Administrador</span>
            <div class="admin-quick-btns">
              <button type="button" class="btn-quick-edit" onclick="AdminUI.openEditorForEdit('${prod.id}')" title="Modificar Producto">
                ✏️ Editar
              </button>
              <button type="button" class="btn-quick-del" onclick="AdminUI.handleDeleteProduct('${prod.id}', '${prod.name.replace(/'/g, "\\'")}')" title="Eliminar Producto">
                🗑️
              </button>
            </div>
          </div>
        ` : ''}

        <div class="product-img-wrap">
          <img 
            src="${prod.image}" 
            alt="${prod.name}" 
            loading="lazy" 
            class="product-img"
            onerror="this.src='pan-casero-dorado.jpeg'"
          >
          ${prod.badge ? `<span class="product-badge badge-${prod.badgeType || 'fresh'}">${prod.badge}</span>` : ''}
          ${!isAvail ? `<span class="product-badge badge-sold-out">Agotado</span>` : ''}
        </div>

        <div class="product-card-body">
          <span class="product-cat-tag">${prod.categoryName || 'Panadería'}</span>
          <h3 class="product-title" title="${prod.name}">${prod.name}</h3>
          <p class="product-desc">${prod.description || ''}</p>

          <div class="product-footer-row">
            <div class="product-price-box">
              <span class="price-val">${prod.priceFormatted || '$' + prod.price.toLocaleString('es-CO')}</span>
            </div>

            <button 
              type="button" 
              class="btn btn-primary btn-add-cart" 
              onclick="handleAddToCart('${prod.id}')"
              ${!isAvail ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
            >
              <span>🛒 Agregar</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function handleAddToCart(productId) {
  const success = bakeryCart.addItem(productId, 1);
  if (success) {
    const prod = ProductStore.getById(productId);
    AdminUI.showToast(`¡Añadido a la canasta: ${prod ? prod.name : 'Producto'}!`);
  }
}

/**
 * 3. Búsqueda y Limpieza
 */
function setupSearchAndFilters() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      bakerySearchQuery = e.target.value.toLowerCase().trim();
      if (clearBtn) clearBtn.style.display = bakerySearchQuery ? 'block' : 'none';
      renderProducts();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      bakerySearchQuery = '';
      clearBtn.style.display = 'none';
      renderProducts();
    });
  }
}

function resetBakeryFilters() {
  currentBakeryCategory = 'all';
  bakerySearchQuery = '';
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';
  const clearBtn = document.getElementById('clear-search-btn');
  if (clearBtn) clearBtn.style.display = 'none';

  renderCategories();
  renderProducts();
}

/**
 * 4. Canasta Desplegable (Cart Drawer)
 */
function setupCartDrawer() {
  const openCartBtn = document.getElementById('open-cart-btn');
  const floatingCartBadge = document.getElementById('floating-cart-badge');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartDrawer = document.getElementById('cart-drawer');

  function openDrawer() {
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartBackdrop) cartBackdrop.classList.add('active');
  }

  function closeDrawer() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartBackdrop) cartBackdrop.classList.remove('active');
  }

  if (openCartBtn) openCartBtn.addEventListener('click', openDrawer);
  if (floatingCartBadge) floatingCartBadge.addEventListener('click', openDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeDrawer);

  // Suscribirse a cambios en el carrito
  bakeryCart.subscribe((items, totals) => {
    // Badges
    const badgeTop = document.getElementById('cart-count-badge');
    const badgeFloat = document.getElementById('floating-cart-count');
    const floatWrap = document.getElementById('floating-cart-badge');

    if (badgeTop) badgeTop.textContent = totals.count;
    if (badgeFloat) badgeFloat.textContent = totals.count;
    if (floatWrap) floatWrap.style.display = totals.count > 0 ? 'flex' : 'none';

    // Totales en el drawer
    const subtotalEl = document.getElementById('cart-subtotal');
    const shipEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-total');

    if (subtotalEl) subtotalEl.textContent = totals.subtotalFormatted;
    if (shipEl) shipEl.textContent = totals.shippingFormatted;
    if (totalEl) totalEl.textContent = totals.totalFormatted;

    // Lista de ítems
    const itemsList = document.getElementById('cart-items-list');
    if (!itemsList) return;

    if (items.length === 0) {
      itemsList.innerHTML = `
        <div class="cart-empty-state" style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 12px;">🧺</div>
          <h4>Tu canasta está vacía</h4>
          <p style="font-size: 0.85rem;">Agrega tus panes calientes y postres favoritos.</p>
        </div>
      `;
      return;
    }

    itemsList.innerHTML = items.map((item, idx) => `
      <div class="cart-item-row">
        <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='pan-casero-dorado.jpeg'">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span class="cart-item-price">$${item.price.toLocaleString('es-CO')} c/u</span>
          ${item.notes ? `<small class="cart-item-note">Nota: ${item.notes}</small>` : ''}
        </div>
        <div class="cart-qty-ctrls">
          <button type="button" onclick="bakeryCart.updateQuantity(${idx}, ${item.quantity - 1})">-</button>
          <span>${item.quantity}</span>
          <button type="button" onclick="bakeryCart.updateQuantity(${idx}, ${item.quantity + 1})">+</button>
        </div>
        <button type="button" class="btn-del-cart-item" onclick="bakeryCart.removeItem(${idx})" title="Quitar">✕</button>
      </div>
    `).join('');
  });
}

/**
 * 5. Modal de Checkout / Enviar Pedido a WhatsApp
 */
function setupCheckoutModal() {
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  const closeCheckoutBtn = document.getElementById('close-checkout-btn');
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutForm = document.getElementById('checkout-form');
  const summaryBox = document.getElementById('checkout-order-summary');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (bakeryCart.items.length === 0) {
        alert("Tu canasta está vacía. Agrega productos antes de continuar.");
        return;
      }

      // Cerrar drawer
      const cartDrawer = document.getElementById('cart-drawer');
      const cartBackdrop = document.getElementById('cart-backdrop');
      if (cartDrawer) cartDrawer.classList.remove('active');
      if (cartBackdrop) cartBackdrop.classList.remove('active');

      // Actualizar resumen
      if (summaryBox) {
        const totals = bakeryCart.getTotals();
        summaryBox.innerHTML = `
          <div style="background: var(--cream-bg); padding: 12px; border-radius: 8px; border: 1px solid #fce0a2; margin-bottom: 16px;">
            <p style="font-weight: 700; margin-bottom: 6px;">Total a pagar: <span style="color: var(--primary-gold);">${totals.totalFormatted}</span> (${totals.count} productos)</p>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Incluye domicilio estimado si aplica.</p>
          </div>
        `;
      }

      if (checkoutModal) checkoutModal.classList.add('active');
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', () => {
      if (checkoutModal) checkoutModal.classList.remove('active');
    });
  }

  // Toggle Delivery / Pickup
  const deliveryRadios = document.querySelectorAll('input[name="delivery_option"]');
  const deliveryFields = document.getElementById('delivery-address-fields');
  const pickupFields = document.getElementById('pickup-info-fields');

  deliveryRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isDelivery = e.target.value === 'delivery';
      bakeryCart.setDeliveryType(isDelivery ? 'delivery' : 'pickup');
      if (deliveryFields) deliveryFields.style.display = isDelivery ? 'block' : 'none';
      if (pickupFields) pickupFields.style.display = isDelivery ? 'none' : 'block';
    });
  });

  // Enviar formulario
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const customerData = {
        name: document.getElementById('cust_name')?.value || '',
        phone: document.getElementById('cust_phone')?.value || '',
        address: document.getElementById('cust_address')?.value || '',
        neighborhood: document.getElementById('cust_neighborhood')?.value || '',
        reference: document.getElementById('cust_reference')?.value || '',
        pickupTime: document.getElementById('cust_pickuptime')?.value || '',
        paymentMethod: document.querySelector('input[name="payment_method"]:checked')?.value || 'Efectivo',
        cashAmount: document.getElementById('cust_cash_amount')?.value || '',
        generalNotes: document.getElementById('cust_general_notes')?.value || ''
      };

      const result = bakeryCart.generateWhatsAppOrder(customerData);
      if (result && result.url) {
        window.open(result.url, '_blank');
        bakeryCart.clearCart();
        if (checkoutModal) checkoutModal.classList.remove('active');
        checkoutForm.reset();
        AdminUI.showToast("¡Pedido enviado por WhatsApp a la panadería!");
      }
    });
  }
}

/**
 * 6. Cotizador de Tortas Personalizadas
 */
function setupCustomCakeForm() {
  const form = document.getElementById('custom-cake-form');
  const estimateTotal = document.getElementById('cake-estimate-total');
  if (!form) return;

  function updateEstimate() {
    const portions = form.querySelector('input[name="cake_portions"]:checked')?.value || 'portions_15';
    const sponge = form.querySelector('input[name="cake_sponge"]:checked')?.value || 'vainilla';
    const filling = form.querySelector('#cake_filling')?.value || 'arequipe';
    const decCheckboxes = form.querySelectorAll('input[name="cake_decorations"]:checked');
    const decorations = Array.from(decCheckboxes).map(cb => cb.value);

    const calc = cakeCustomizer.calculateEstimate({ portions, sponge, filling, decorations });
    if (estimateTotal) {
      estimateTotal.textContent = calc.formattedTotal;
    }
  }

  form.addEventListener('change', updateEstimate);
  updateEstimate();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const portionsInput = form.querySelector('input[name="cake_portions"]:checked');
    const portionsText = portionsInput ? portionsInput.parentElement.textContent.trim() : '15 porciones';
    const spongeInput = form.querySelector('input[name="cake_sponge"]:checked');
    const spongeText = spongeInput ? spongeInput.parentElement.textContent.trim() : 'Vainilla Clásica';
    const fillingSelect = form.querySelector('#cake_filling');
    const fillingText = fillingSelect ? fillingSelect.options[fillingSelect.selectedIndex].text : 'Arequipe Tradicional';

    const decCheckboxes = form.querySelectorAll('input[name="cake_decorations"]:checked');
    const decorationsList = Array.from(decCheckboxes).map(cb => cb.parentElement.textContent.trim());

    const formData = {
      portionsText,
      spongeText,
      fillingText,
      decorationsList,
      theme: document.getElementById('cake_theme')?.value || '',
      dedication: document.getElementById('cake_dedication')?.value || '',
      name: document.getElementById('cake_cust_name')?.value || '',
      eventDate: document.getElementById('cake_date')?.value || '',
      additionalNotes: document.getElementById('cake_notes')?.value || '',
      portions: portionsInput?.value,
      sponge: spongeInput?.value,
      filling: fillingSelect?.value,
      decorations: Array.from(decCheckboxes).map(cb => cb.value)
    };

    const whatsappUrl = cakeCustomizer.generateWhatsAppQuote(formData);
    window.open(whatsappUrl, '_blank');
    AdminUI.showToast("¡Cotización de torta enviada por WhatsApp!");
  });
}

/**
 * 7. Modal POS / Cajero de Mostrador
 */
function setupPOSModal() {
  const posBtn = document.getElementById('pos-mode-btn');
  const closePosBtn = document.getElementById('close-pos-btn');
  const posModal = document.getElementById('pos-modal');

  if (posBtn) {
    posBtn.addEventListener('click', () => {
      initPOSCatalog();
      if (posModal) posModal.classList.add('active');
    });
  }

  if (closePosBtn) {
    closePosBtn.addEventListener('click', () => {
      if (posModal) posModal.classList.remove('active');
    });
  }

  // Búsqueda de productos en mostrador POS
  const posSearch = document.getElementById('pos-search-product');
  if (posSearch) {
    posSearch.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      initPOSCatalog(q);
    });
  }

  // Cambio de dinero entregado
  const cashGivenInput = document.getElementById('pos-cash-given');
  const changeDueEl = document.getElementById('pos-change-due');

  if (cashGivenInput && changeDueEl) {
    cashGivenInput.addEventListener('input', () => {
      const totals = bakeryPOS.getTotals();
      const given = parseFloat(cashGivenInput.value) || 0;
      const change = given - totals.total;
      changeDueEl.textContent = '$' + (change > 0 ? change.toLocaleString('es-CO') : '0');
    });
  }

  // Cobrar venta
  const completeBtn = document.getElementById('pos-btn-complete-sale');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      const method = document.getElementById('pos-payment-method')?.value || 'Efectivo';
      const given = parseFloat(cashGivenInput?.value) || 0;
      const sale = bakeryPOS.completeSale({ method, receivedAmount: given });

      if (sale) {
        if (cashGivenInput) cashGivenInput.value = '';
        if (changeDueEl) changeDueEl.textContent = '$0';
        updatePOSStats();
        AdminUI.showToast(`¡Venta #${sale.id} registrada exitosamente!`);
      } else {
        alert("Agrega productos a la venta antes de cobrar.");
      }
    });
  }

  // Limpiar venta
  const clearBtn = document.getElementById('pos-btn-clear-sale');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      bakeryPOS.clearSale();
      if (cashGivenInput) cashGivenInput.value = '';
      if (changeDueEl) changeDueEl.textContent = '$0';
    });
  }
}

function initPOSCatalog(query = '') {
  const container = document.getElementById('pos-items-grid');
  if (!container) return;

  let prods = ProductStore.getAll();
  if (query) {
    prods = prods.filter(p => p.name.toLowerCase().includes(query));
  }

  container.innerHTML = prods.map(p => `
    <button type="button" class="pos-product-btn" onclick="bakeryPOS.addToSale('${p.id}')">
      <img src="${p.image}" alt="${p.name}" class="pos-thumb" onerror="this.src='pan-casero-dorado.jpeg'">
      <div class="pos-prod-info">
        <strong>${p.name}</strong>
        <span>$${p.price.toLocaleString('es-CO')}</span>
      </div>
    </button>
  `).join('');

  updatePOSStats();
}

function updatePOSStats() {
  const stats = bakeryPOS.getTodayStats();
  const countEl = document.getElementById('pos-stat-count');
  const totalEl = document.getElementById('pos-stat-total');

  if (countEl) countEl.textContent = stats.totalOrders;
  if (totalEl) totalEl.textContent = stats.totalMoneyFormatted;
}

window.initPOSCatalog = initPOSCatalog;

/**
 * 8. Animaciones de Entrada
 */
function setupScrollAnimations() {
  const targets = document.querySelectorAll('.feature-box, .product-card, .review-card, .section-header');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    targets.forEach(el => observer.observe(el));
  }
}

// Exponer globalmente
window.handleAddToCart = handleAddToCart;
window.resetBakeryFilters = resetBakeryFilters;
window.renderProducts = renderProducts;
window.renderCategories = renderCategories;
