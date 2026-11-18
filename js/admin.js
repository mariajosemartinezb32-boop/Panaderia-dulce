/**
 * Módulo de Administración y Modificación de Productos
 * Dulce Tentación — Panadería & Repostería Artesanal
 * 100% Frontend (GitHub Pages Compatible)
 * Acceso protegido mediante botón oculto y credenciales autorizadas
 */

const ADMIN_CREDENTIALS = {
  email: "dannavalentinaarias24@gmail.com",
  password: "Danna0424"
};

const SESSION_KEY = "DULCE_TENTACION_ADMIN_SESSION_V2";

/**
 * Gestor de Autenticación Administrativa
 */
const AdminAuth = {
  login(email, password) {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && cleanPass === ADMIN_CREDENTIALS.password) {
      const sessionData = {
        email: ADMIN_CREDENTIALS.email,
        name: "Administrador Dulce Tentación",
        role: "SuperAdmin",
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      return { success: true, user: sessionData };
    }
    return { success: false, message: "Correo o contraseña incorrectos. Verifica tus datos de acceso." };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  isLoggedIn() {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (!session) return false;
      const parsed = JSON.parse(session);
      return parsed && parsed.email && parsed.email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase();
    } catch (e) {
      return false;
    }
  },

  getUser() {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }
};

/**
 * Controlador de la Interfaz del Panel de Administración
 */
const AdminUI = {
  init() {
    // Por motivos de seguridad: siempre cerrar sesión al iniciar o recargar
    AdminAuth.logout();
    this.bindEvents();
    this.updateAuthUI();
  },

  bindEvents() {
    // 1. Disparadores ocultos / secretos para abrir el panel (en el inicio: logo 🥖, punto de estado y footer ©)
    const secretTriggers = document.querySelectorAll('.secret-admin-trigger, #secret-admin-trigger, #secret-admin-dot, .brand-badge-icon');
    secretTriggers.forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Si el panel de control NO está activo en pantalla, siempre pedir contraseña
        const dashModal = document.getElementById('admin-dashboard-modal');
        if (!dashModal || !dashModal.classList.contains('active')) {
          this.openLoginModal();
        } else {
          this.openDashboardModal();
        }
      });
    });

    // 2. Atajo de teclado secreto: Ctrl + Shift + A
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        const dashModal = document.getElementById('admin-dashboard-modal');
        if (!dashModal || !dashModal.classList.contains('active')) {
          this.openLoginModal();
        } else {
          this.openDashboardModal();
        }
      }
    });

    // Cerrar el panel al hacer clic en el fondo oscuro
    const dashOverlay = document.getElementById('admin-dashboard-modal');
    if (dashOverlay) {
      dashOverlay.addEventListener('click', (e) => {
        if (e.target === dashOverlay) {
          this.closeDashboardModal();
        }
      });
    }

    // Cerrar el panel con la tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const dashModal = document.getElementById('admin-dashboard-modal');
        if (dashModal && dashModal.classList.contains('active')) {
          this.closeDashboardModal();
        }
      }
    });

    // 3. Botón de cerrar sesión en la barra activa
    const logoutBtn = document.getElementById('btn-admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    }

    // 4. Formulario de inicio de sesión
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLoginSubmit();
      });
    }

    // 5. Botones para cerrar modales
    const closeLoginBtn = document.getElementById('btn-close-login-modal');
    if (closeLoginBtn) {
      closeLoginBtn.addEventListener('click', () => this.closeLoginModal());
    }

    const closeDashBtn = document.getElementById('btn-close-dash-modal');
    if (closeDashBtn) {
      closeDashBtn.addEventListener('click', () => this.closeDashboardModal(true));
    }

    const dashLogoutBtn = document.getElementById('btn-dash-logout-header');
    if (dashLogoutBtn) {
      dashLogoutBtn.addEventListener('click', () => this.closeDashboardModal(true));
    }

    const closeEditorBtn = document.getElementById('btn-close-editor-modal');
    if (closeEditorBtn) {
      closeEditorBtn.addEventListener('click', () => this.closeEditorModal());
    }

    // 6. Botón de crear nuevo producto
    const newProdBtn = document.getElementById('btn-create-new-prod');
    if (newProdBtn) {
      newProdBtn.addEventListener('click', () => this.openEditorForNew());
    }

    // 7. Formulario del editor de producto
    const editorForm = document.getElementById('product-editor-form');
    if (editorForm) {
      editorForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveProduct();
      });
    }

    // 8. Búsqueda y filtros dentro de la tabla de administración
    const adminSearch = document.getElementById('admin-search-input');
    if (adminSearch) {
      adminSearch.addEventListener('input', () => this.renderAdminTable());
    }

    const adminCatFilter = document.getElementById('admin-filter-category');
    if (adminCatFilter) {
      adminCatFilter.addEventListener('change', () => this.renderAdminTable());
    }

    // 9. Exportar / Importar / Restablecer
    const exportBtn = document.getElementById('btn-admin-export');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        ProductStore.exportJSON();
        this.showToast("Catálogo de panadería exportado en JSON.");
      });
    }

    const importInput = document.getElementById('admin-import-file');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = ProductStore.importJSON(event.target.result);
          if (res.success) {
            this.showToast(`¡Se importaron ${res.count} productos correctamente!`);
            this.refreshAll();
          } else {
            alert("Error al importar: " + res.error);
          }
          importInput.value = "";
        };
        reader.readAsText(file);
      });
    }

    const resetBtn = document.getElementById('btn-admin-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("¿Deseas restablecer el catálogo inicial de panes y tortas de Dulce Tentación?")) {
          ProductStore.resetToDefaults();
          this.showToast("Catálogo restablecido al menú original.");
          this.refreshAll();
        }
      });
    }
  },

  /**
   * Actualiza el estado visual según si el administrador está logueado
   */
  updateAuthUI() {
    const isLoggedIn = AdminAuth.isLoggedIn();
    const user = AdminAuth.getUser();

    const adminBar = document.getElementById('admin-session-bar');
    const adminEmailSpan = document.getElementById('admin-logged-email');

    if (isLoggedIn) {
      document.body.classList.add('is-admin-logged');
      if (adminBar) {
        adminBar.style.display = 'block';
      }
      if (adminEmailSpan && user) {
        adminEmailSpan.textContent = user.email;
      }
    } else {
      document.body.classList.remove('is-admin-logged');
      if (adminBar) {
        adminBar.style.display = 'none';
      }
    }

    if (typeof renderProducts === 'function') {
      renderProducts();
    }
  },

  // Modal Login
  openLoginModal() {
    // Por motivos de máxima seguridad: asegurar que no quede sesión previa activa
    AdminAuth.logout();
    this.updateAuthUI();

    const modal = document.getElementById('admin-login-modal');
    const errBox = document.getElementById('login-error-message');
    const passInput = document.getElementById('login-password');
    const emailInput = document.getElementById('login-email');

    if (errBox) {
      errBox.style.display = 'none';
      errBox.textContent = '';
    }
    if (emailInput) {
      emailInput.value = ADMIN_CREDENTIALS.email;
    }
    if (passInput) {
      passInput.value = '';
    }
    if (modal) modal.classList.add('active');

    setTimeout(() => {
      if (passInput) passInput.focus();
    }, 150);
  },

  closeLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) modal.classList.remove('active');
    const passInput = document.getElementById('login-password');
    if (passInput) passInput.value = '';
  },

  handleLoginSubmit() {
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const errBox = document.getElementById('login-error-message');

    const email = emailInput ? emailInput.value : '';
    const pass = passInput ? passInput.value : '';

    const res = AdminAuth.login(email, pass);
    if (res.success) {
      if (passInput) passInput.value = '';
      this.closeLoginModal();
      this.updateAuthUI();
      this.showToast(`¡Bienvenida! Sesión iniciada como ${res.user.email}`);
      this.openDashboardModal();
    } else {
      if (errBox) {
        errBox.textContent = res.message;
        errBox.style.display = 'block';
      }
      if (passInput) {
        passInput.value = '';
        passInput.focus();
      }
    }
  },

  handleLogout() {
    AdminAuth.logout();
    this.closeDashboardModal(false);
    this.closeEditorModal();
    this.updateAuthUI();
    this.showToast("Sesión cerrada. Acceso protegido nuevamente.");
  },

  // Modal Dashboard
  openDashboardModal() {
    if (!AdminAuth.isLoggedIn()) {
      this.openLoginModal();
      return;
    }
    const modal = document.getElementById('admin-dashboard-modal');
    if (modal) {
      modal.classList.add('active');
      this.renderAdminStats();
      this.renderAdminTable();
    }
  },

  closeDashboardModal(notify = true) {
    const modal = document.getElementById('admin-dashboard-modal');
    if (modal) modal.classList.remove('active');

    const editorModal = document.getElementById('product-editor-modal');
    if (editorModal) editorModal.classList.remove('active');

    // SEGURIDAD ESTRICTA: cada vez que el usuario se sale del panel de control,
    // se destruye la sesión activa para que la próxima vez pida la contraseña obligatoriamente.
    AdminAuth.logout();
    this.updateAuthUI();

    if (notify) {
      this.showToast("Panel cerrado. Sesión finalizada por seguridad.");
    }
  },

  renderAdminStats() {
    const prods = ProductStore.getAll();
    const total = prods.length;
    const panes = prods.filter(p => p.category === 'panes').length;
    const postres = prods.filter(p => p.category === 'postres').length;
    const galletas = prods.filter(p => p.category === 'galletas').length;
    const combos = prods.filter(p => p.category === 'combos').length;

    const elTotal = document.getElementById('admin-stat-total');
    const elPanes = document.getElementById('admin-stat-panes');
    const elPostres = document.getElementById('admin-stat-postres');
    const elGalletas = document.getElementById('admin-stat-galletas');
    const elCombos = document.getElementById('admin-stat-combos');

    if (elTotal) elTotal.textContent = total;
    if (elPanes) elPanes.textContent = panes;
    if (elPostres) elPostres.textContent = postres;
    if (elGalletas) elGalletas.textContent = galletas;
    if (elCombos) elCombos.textContent = combos;
  },

  renderAdminTable() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    const query = (document.getElementById('admin-search-input')?.value || "").toLowerCase().trim();
    const catFilter = document.getElementById('admin-filter-category')?.value || "all";

    let prods = ProductStore.getAll();

    if (catFilter !== "all") {
      prods = prods.filter(p => p.category === catFilter);
    }

    if (query) {
      prods = prods.filter(p =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.id && p.id.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    if (prods.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 25px; color: var(--text-muted);">
            No se encontraron productos con el filtro aplicado.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = prods.map(p => `
      <tr>
        <td style="width: 60px;">
          <img src="${p.image}" alt="${p.name}" class="admin-table-thumb" onerror="this.src='pan-casero-dorado.jpeg'">
        </td>
        <td>
          <div style="font-weight: 700; color: var(--cocoa-dark);">${p.name}</div>
          <div style="font-size: 0.76rem; color: var(--text-muted);">${p.description ? p.description.slice(0, 50) + '...' : ''}</div>
        </td>
        <td>
          <span class="admin-badge admin-badge-${p.category}">${p.categoryName || p.category}</span>
        </td>
        <td>
          <strong style="color: var(--primary-gold);">${p.priceFormatted}</strong>
        </td>
        <td>
          <button type="button" class="btn-toggle-avail ${p.available !== false ? 'avail-yes' : 'avail-no'}" onclick="AdminUI.handleToggleAvailability('${p.id}')">
            ${p.available !== false ? '🟢 Disponible' : '🔴 Agotado'}
          </button>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="btn-action-edit" onclick="AdminUI.openEditorForEdit('${p.id}')">
            ✏️ Editar
          </button>
          <button type="button" class="btn-action-delete" onclick="AdminUI.handleDeleteProduct('${p.id}', '${p.name.replace(/'/g, "\\'")}')">
            🗑️
          </button>
        </td>
      </tr>
    `).join('');
  },

  handleToggleAvailability(id) {
    const prod = ProductStore.getById(id);
    if (!prod) return;
    const newStatus = prod.available === false ? true : false;
    ProductStore.updateAvailability(id, newStatus);
    this.showToast(`Estado de "${prod.name}" actualizado.`);
    this.renderAdminTable();
    if (typeof renderProducts === 'function') renderProducts();
  },

  handleDeleteProduct(id, name) {
    if (confirm(`¿Estás seguro de eliminar el producto "${name}" del menú?`)) {
      ProductStore.deleteProduct(id);
      this.showToast(`Producto "${name}" eliminado.`);
      this.refreshAll();
    }
  },

  // Modal Editor
  openEditorForNew() {
    if (!AdminAuth.isLoggedIn()) {
      this.openLoginModal();
      return;
    }
    const modal = document.getElementById('product-editor-modal');
    const form = document.getElementById('product-editor-form');
    const title = document.getElementById('editor-modal-title');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('editor-prod-id').value = "";
    if (title) title.textContent = "➕ Agregar Nuevo Producto a la Panadería";
    modal.classList.add('active');
  },

  openEditorForEdit(id) {
    if (!AdminAuth.isLoggedIn()) {
      this.openLoginModal();
      return;
    }
    const prod = ProductStore.getById(id);
    if (!prod) return;

    const modal = document.getElementById('product-editor-modal');
    const title = document.getElementById('editor-modal-title');
    if (!modal) return;

    if (title) title.textContent = `✏️ Modificar: ${prod.name}`;

    document.getElementById('editor-prod-id').value = prod.id;
    document.getElementById('editor-prod-name').value = prod.name || "";
    document.getElementById('editor-prod-category').value = prod.category || "panes";
    document.getElementById('editor-prod-price').value = prod.price || "";
    document.getElementById('editor-prod-image').value = prod.image || "";
    document.getElementById('editor-prod-badge').value = prod.badge || "";
    document.getElementById('editor-prod-description').value = prod.description || "";
    document.getElementById('editor-prod-available').value = prod.available !== false ? "true" : "false";

    modal.classList.add('active');
  },

  closeEditorModal() {
    const modal = document.getElementById('product-editor-modal');
    if (modal) modal.classList.remove('active');
  },

  handleSaveProduct() {
    const id = document.getElementById('editor-prod-id').value.trim();
    const name = document.getElementById('editor-prod-name').value.trim();
    const category = document.getElementById('editor-prod-category').value;
    const price = parseFloat(document.getElementById('editor-prod-price').value) || 0;
    let image = document.getElementById('editor-prod-image').value.trim();
    const badge = document.getElementById('editor-prod-badge').value.trim();
    const description = document.getElementById('editor-prod-description').value.trim();
    const isAvailable = document.getElementById('editor-prod-available').value === "true";

    if (!name || price <= 0) {
      alert("Por favor ingresa un nombre y un precio válido.");
      return;
    }

    if (!image) {
      image = category === 'postres' ? 'torta-chocolate-supremo.jpeg' : 'pan-casero-dorado.jpeg';
    }

    const prodData = {
      name,
      category,
      price,
      image,
      badge: badge || "✨ Especial",
      badgeType: category === 'panes' ? 'fresh' : 'popular',
      description: description || "Delicioso producto horneado en Dulce Tentación.",
      available: isAvailable
    };

    if (id) {
      prodData.id = id;
    }

    const res = ProductStore.saveProduct(prodData);
    if (res.success) {
      this.closeEditorModal();
      this.showToast(res.isNew ? "¡Nuevo producto agregado con éxito!" : "¡Producto actualizado correctamente!");
      this.refreshAll();
    }
  },

  refreshAll() {
    this.renderAdminStats();
    this.renderAdminTable();
    if (typeof renderProducts === 'function') {
      renderProducts();
    }
    if (typeof renderCategories === 'function') {
      renderCategories();
    }
    // Refrescar POS
    if (window.initPOSCatalog) {
      window.initPOSCatalog();
    }
  },

  showToast(message) {
    let toast = document.getElementById('bakery-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bakery-toast';
      toast.className = 'bakery-toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3500);
  }
};

window.AdminAuth = AdminAuth;
window.AdminUI = AdminUI;
