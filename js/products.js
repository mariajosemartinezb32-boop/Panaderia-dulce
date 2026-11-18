/**
 * Catálogo y Gestor de Productos de Panadería & Repostería
 * Dulce Tentación — Panadería & Repostería Artesanal (Tocaima, Cundinamarca)
 * Persistencia en localStorage (100% Frontend - GitHub Pages compatible)
 */

const BAKERY_CONFIG = {
  name: "Dulce Tentación",
  subtitle: "Panadería & Repostería Artesanal",
  whatsappNumber: "573232277831",
  whatsappDisplay: "+57 323 227 7831",
  address: "Calle Principal # 12-34, Barrio Central, Tocaima, Cundinamarca",
  deliveryCost: 4000,
  minOrder: 10000,
  currency: "COP",
  schedule: "Lunes a Domingo: 6:00 AM a 9:30 PM",
  storageKey: "DULCE_TENTACION_PRODUCTS_V3"
};

// Catálogo inicial de productos artesanales de panadería y repostería
const DEFAULT_BAKERY_PRODUCTS = [
  {
    id: "pan-01",
    name: "Pan Casero Tradicional Dorado",
    category: "panes",
    categoryName: "Panadería Artesanal",
    price: 3500,
    priceFormatted: "$3.500",
    image: "pan-casero-dorado.jpeg",
    description: "Crujiente por fuera y esponjoso por dentro. Elaborado con masa madre tradicional y horneado caliente 3 veces al día.",
    badge: "🔥 Recién Horneado",
    badgeType: "fresh",
    available: true
  },
  {
    id: "pan-02",
    name: "Pan de Queso Especial (Paquete x6)",
    category: "panes",
    categoryName: "Panadería Artesanal",
    price: 8000,
    priceFormatted: "$8.000",
    image: "pan-queso-paquete.jpeg",
    description: "Masa suave enriquecida con abundante queso campesino fresco de la región. Ideal para acompañar el chocolate o café caliente.",
    badge: "⭐ Favorito",
    badgeType: "popular",
    available: true
  },
  {
    id: "pan-03",
    name: "Pan Integral Multicereal con Semillas",
    category: "panes",
    categoryName: "Panadería Artesanal",
    price: 6500,
    priceFormatted: "$6.500",
    image: "pan-integral-semillas.jpeg",
    description: "100% harina de trigo integral con semillas de chía, linaza, ajonjolí y avena en hojuelas. Saludable, nutritivo y rico en fibra.",
    badge: "🌿 Saludable",
    badgeType: "healthy",
    available: true
  },
  {
    id: "pan-04",
    name: "Mogolla Campesina de Chicharrón",
    category: "panes",
    categoryName: "Panadería Artesanal",
    price: 2500,
    priceFormatted: "$2.500",
    image: "mogolla-campesina.jpeg",
    description: "La tradicional mogolla de campo con crocantes trocitos de chicharrón tostado. Sabor autóctono y textura inigualable.",
    badge: "🇨🇴 Tradicional",
    badgeType: "traditional",
    available: true
  },
  {
    id: "pan-05",
    name: "Canasta Surtida de Panes Especiales",
    category: "panes",
    categoryName: "Panadería Artesanal",
    price: 18000,
    priceFormatted: "$18.000",
    image: "surtido-panes-especiales.jpeg",
    description: "Variedad de 10 piezas de nuestros mejores panes dulces y salados: croissant, pan rollo, trenza de queso, pan de bono y mogollas.",
    badge: "🧺 Para Compartir",
    badgeType: "combo",
    available: true
  },
  {
    id: "galleta-01",
    name: "Galletas Chocochips Crujientes (x4)",
    category: "galletas",
    categoryName: "Galletas & Tradicionales",
    price: 5000,
    priceFormatted: "$5.000",
    image: "galleta-chocochips.jpeg",
    description: "Galletas artesanales de mantequilla con abundantes chispas de chocolate semiamargo derretidas en cada mordisco.",
    badge: "🍪 Horneadas Hoy",
    badgeType: "fresh",
    available: true
  },
  {
    id: "galleta-02",
    name: "Galletas de Mantequilla Decoradas (x6)",
    category: "galletas",
    categoryName: "Galletas & Tradicionales",
    price: 9000,
    priceFormatted: "$9.000",
    image: "galletas-decoradas.jpeg",
    description: "Delicadas galletas artesanales con formas temáticas y glaseado real de colores. Perfectas para un detalle o regalo especial.",
    badge: "🎁 Detalle Dulce",
    badgeType: "gift",
    available: true
  },
  {
    id: "galleta-03",
    name: "Polvorones Tradicionales Rosados (x6)",
    category: "galletas",
    categoryName: "Galletas & Tradicionales",
    price: 4500,
    priceFormatted: "$4.500",
    image: "polvorones-rojos.jpeg",
    description: "Los clásicos polvorones de panadería con su textura suave y quebradiza que se deshace en la boca, cubiertos de azúcar.",
    badge: "✨ Clásico",
    badgeType: "traditional",
    available: true
  },
  {
    id: "torta-01",
    name: "Torta Suprema de Chocolate Húmedo",
    category: "postres",
    categoryName: "Tortas & Postres",
    price: 48000,
    priceFormatted: "$48.000",
    image: "torta-chocolate-supremo.jpeg",
    description: "Bizcochuelo intenso de cacao colombiano 70%, relleno de ganache cremosa de chocolate y cubierto con virutas de chocolate suizo.",
    badge: "🍫 Chocolate 100%",
    badgeType: "popular",
    available: true
  },
  {
    id: "torta-02",
    name: "Torta Tres Leches Tradicional Casera",
    category: "postres",
    categoryName: "Tortas & Postres",
    price: 42000,
    priceFormatted: "$42.000",
    image: "torta-tres-leches.jpeg",
    description: "Bizcocho súper húmedo bañado en nuestra salsa secreta de tres leches, coronado con merengue suizo dorado y canela en polvo.",
    badge: "🥛 Súper Húmeda",
    badgeType: "popular",
    available: true
  },
  {
    id: "torta-03",
    name: "Torta de Frutos Rojos y Crema Chantilly",
    category: "postres",
    categoryName: "Tortas & Postres",
    price: 46000,
    priceFormatted: "$46.000",
    image: "torta-frutos-rojos.jpeg",
    description: "Suave bizcocho de vainilla con mermelada casera de fresas, moras y agraz silvestres, decorada con crema chantilly y frutas frescas.",
    badge: "🍓 Fruta Natural",
    badgeType: "fresh",
    available: true
  },
  {
    id: "torta-04",
    name: "Torta Temática para Cumpleaños (15 Porciones)",
    category: "postres",
    categoryName: "Tortas & Postres",
    price: 55000,
    priceFormatted: "$55.000",
    image: "torta-tematica.jpeg",
    description: "Diseño personalizado para celebraciones con topper festivo, doble capa de relleno a tu gusto y dedicatoria personalizada.",
    badge: "🎉 Cumpleaños",
    badgeType: "special",
    available: true
  },
  {
    id: "combo-01",
    name: "Combo Desayuno Caliente (Pan + Café + Queso)",
    category: "combos",
    categoryName: "Combos Especiales",
    price: 9500,
    priceFormatted: "$9.500",
    image: "combo-desayuno-caliente.jpeg",
    description: "El desayuno perfecto de panadería: 2 panes calientes recién horneados, taza de café con leche o chocolate espumoso y porción de queso fresco.",
    badge: "☕ Desayuno",
    badgeType: "combo",
    available: true
  },
  {
    id: "combo-02",
    name: "Combo Tarde Dulce (Porción de Torta + Bebida)",
    category: "combos",
    categoryName: "Combos Especiales",
    price: 12000,
    priceFormatted: "$12.000",
    image: "combo-tarde-dulce.jpeg",
    description: "Una generosa porción de torta a elección acompañada de un café capuchino o jugo natural frío. Ideal para las onces de la tarde.",
    badge: "🍰 Onces",
    badgeType: "combo",
    available: true
  }
];

/**
 * Gestor de almacenamiento en LocalStorage para Dulce Tentación
 */
const ProductStore = {
  getAll() {
    try {
      const data = localStorage.getItem(BAKERY_CONFIG.storageKey);
      if (!data) {
        this.saveAll(DEFAULT_BAKERY_PRODUCTS);
        return [...DEFAULT_BAKERY_PRODUCTS];
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveAll(DEFAULT_BAKERY_PRODUCTS);
        return [...DEFAULT_BAKERY_PRODUCTS];
      }
      return parsed;
    } catch (e) {
      console.error("Error al leer de localStorage:", e);
      return [...DEFAULT_BAKERY_PRODUCTS];
    }
  },

  saveAll(products) {
    try {
      localStorage.setItem(BAKERY_CONFIG.storageKey, JSON.stringify(products));
      window.BAKERY_PRODUCTS = products;
      return true;
    } catch (e) {
      console.error("Error al guardar en localStorage:", e);
      return false;
    }
  },

  getById(id) {
    const list = this.getAll();
    return list.find(p => p.id === id) || null;
  },

  saveProduct(prodData) {
    const list = this.getAll();
    let isNew = false;

    if (!prodData.id) {
      prodData.id = "prod-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 3);
      isNew = true;
    }

    if (typeof prodData.price === 'string') {
      prodData.price = parseFloat(prodData.price.replace(/[^0-9]/g, '')) || 0;
    }
    prodData.priceFormatted = "$" + Number(prodData.price).toLocaleString('es-CO');
    prodData.categoryName = this.getCategoryName(prodData.category);

    const index = list.findIndex(p => p.id === prodData.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...prodData, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(prodData);
    }

    this.saveAll(list);
    return { success: true, product: prodData, isNew };
  },

  deleteProduct(id) {
    const list = this.getAll();
    const filtered = list.filter(p => p.id !== id);
    if (filtered.length !== list.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  },

  updateAvailability(id, isAvailable) {
    const list = this.getAll();
    const item = list.find(p => p.id === id);
    if (item) {
      item.available = Boolean(isAvailable);
      this.saveAll(list);
      return true;
    }
    return false;
  },

  resetToDefaults() {
    this.saveAll(DEFAULT_BAKERY_PRODUCTS);
    return [...DEFAULT_BAKERY_PRODUCTS];
  },

  exportJSON() {
    const data = this.getAll();
    const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", str);
    downloadAnchor.setAttribute("download", `dulce_tentacion_productos_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        throw new Error("El archivo no contiene un catálogo válido de productos.");
      }
      this.saveAll(parsed);
      return { success: true, count: parsed.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  getCategoryName(catKey) {
    const map = {
      panes: "Panadería Artesanal",
      postres: "Tortas & Postres",
      galletas: "Galletas & Tradicionales",
      combos: "Combos Especiales"
    };
    return map[catKey] || "Especialidad";
  }
};

// Sincronizar catálogo global con cart.js y pos.js
window.BAKERY_PRODUCTS = ProductStore.getAll();
window.BAKERY_CONFIG = BAKERY_CONFIG;
window.ProductStore = ProductStore;
