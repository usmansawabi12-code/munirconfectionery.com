/**
 * Munir Shop (munir804.com) - Interactive Lightbox & Card Helper Functions
 */
// Global Admin Panel Opener
// Logo Modal Controller with Creator Credit
window.openLogoModal = function() {
  const modal = document.getElementById("logoModalBackdrop");
  if (!modal) return;
  modal.style.removeProperty("display");
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  syncBodyScrollLock();
};

window.closeLogoModal = function() {
  const modal = document.getElementById("logoModalBackdrop");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  syncBodyScrollLock();
};

// Team Member Profiles Data & Modal Controller
const teamMembersData = {
  akhtar: {
    name: "Akhtar Munir",
    role: "Senior Confectioner (C.E.O)",
    badge: '<i class="fas fa-crown text-gold"></i> Founder &amp; C.E.O',
    img: "Confectioner%20Sennior(C.E.O)/%23%40%40%25%24111.jpeg",
    alt: "Akhtar Munir - Senior Confectioner (C.E.O)",
    desc: "Leading Munir Shop since 2003 at Gul Ahmed, Landhi, Karachi No. 22, ensuring authentic confectionery quality, wholesale supply, and customer satisfaction."
  },
  nadir: {
    name: "Nadir Ali",
    role: "Junior Confectioner & Dispatch Manager (Son of C.E.O)",
    badge: '<i class="fas fa-bolt text-gold"></i> Operations Lead',
    img: "Confectioner%20Jonier/2323%23%40.jpeg",
    alt: "Nadir Ali - Junior Confectioner & Dispatch Manager (Son of C.E.O)",
    desc: "Managing daily confectionery preparation, order packing, and fast retail/wholesale dispatch at Munir Shop, Gul Ahmed, Landhi, Karachi No. 22."
  }
};

window.openTeamModal = function(memberId) {
  const member = teamMembersData[memberId] || teamMembersData.akhtar;
  const modal = document.getElementById("teamMemberModalBackdrop");
  if (!modal) return;

  const imgEl = document.getElementById("teamModalImg");
  const nameEl = document.getElementById("teamModalName");
  const roleEl = document.getElementById("teamModalRole");
  const badgeEl = document.getElementById("teamModalBadge");
  const descEl = document.getElementById("teamModalDesc");

  if (imgEl) {
    imgEl.src = member.img;
    imgEl.alt = member.alt;
  }
  if (nameEl) nameEl.textContent = member.name;
  if (roleEl) roleEl.textContent = member.role;
  if (badgeEl) badgeEl.innerHTML = member.badge;
  if (descEl) descEl.textContent = member.desc;

  modal.style.removeProperty("display");
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  const dialog = modal.querySelector(".modal-dialog");
  if (dialog) dialog.scrollTop = 0;
  syncBodyScrollLock();
};

window.closeTeamModal = function() {
  const modal = document.getElementById("teamMemberModalBackdrop");
  if (!modal) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  syncBodyScrollLock();
};

window.openAdminPanel = function() {
  if (window.AdminController && typeof window.AdminController.openEntryPoint === 'function') {
    window.AdminController.openEntryPoint();
  } else if (typeof AdminController !== 'undefined' && AdminController.openEntryPoint) {
    AdminController.openEntryPoint();
  }
};

window.openLightbox = function(src, caption) {
  const modal = document.getElementById("galleryLightboxModal");
  const img = document.getElementById("lightboxImg");
  const cap = document.getElementById("lightboxCaption");
  if (!modal || !img) return;
  modal.style.setProperty("display", "flex", "important");
  img.src = src;
  if (cap) cap.textContent = caption || "";
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeLightbox = function() {
  const modal = document.getElementById("galleryLightboxModal");
  if (!modal) return;
  modal.classList.remove("active");
  modal.style.setProperty("display", "none", "important");
  syncBodyScrollLock();
};

window.filterByBrandClick = function(brandName) {
  AppState.activeBrand = brandName;
  renderStorefrontTaxonomy();
  renderCatalog();
  const prodSec = document.getElementById("productsSection");
  if (prodSec) prodSec.scrollIntoView({ behavior: "smooth" });
};

/**
 * Munir Shop (Munir Confectionery) - Core Application Logic
 * Location: Gul Ahmed, Bilal Colony, Landhi No. 22, Karachi
 * WhatsApp Hotline: 03421221630
 */

// Global Configuration
const SHOP_CONFIG = {
  shopName: "Munir Shop (Munir Confectionery)",
  tagline: "Premier Wholesale & Retail Confectionery",
  address: "Gul Ahmed, Bilal Colony, Landhi No. 22, Karachi, Sindh, Pakistan",
  whatsappNumber: "923421221630",
  whatsappDisplay: "0342-1221630",
  freeDeliveryThreshold: 1500, // PKR
  deliveryFeeLandhi: 100, // PKR
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Akhtar+Muneer+Confectionery+wholesaler+Landhi+Karachi",
  defaultImage: "Logo/99900opo9.png",
  defaultAdminPin: "munir804"
};

const STORAGE_KEYS = {
  cart: "munir_shop_cart_v1",
  products: "munir_shop_products_v1",
  brands: "munir_shop_brands_v1",
  categories: "munir_shop_categories_v1",
  adminPin: "munir_shop_admin_pin_v1",
  adminAccounts: "munir_shop_admin_accounts_v1",
  adminSession: "munir_shop_admin_session_v1",
  adminLockout: "munir_shop_admin_lockout_v1"
};

const DEFAULT_BRANDS = [
  "Candyland",
  "Hilal",
  "Bisconni",
  "Peak Freans",
  "LU",
  "Gibs",
  "Giggly",
  "Mix"
];

const DEFAULT_CATEGORIES = [
  "Chocolates",
  "Candies & Toffees",
  "Biscuits & Wafers",
  "Imli & Traditional",
  "Special Wholesale Deals"
];

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Deterministic salted hash that works identically on file://, http://, and https://munir804.com
function hashAdminPin(pin) {
  const salted = `MunirShop804_Landhi22::${String(pin)}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < salted.length; i++) {
    const ch = salted.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + (i << 3);
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return ((h1 >>> 0).toString(16).padStart(8, "0") + (h2 >>> 0).toString(16).padStart(8, "0"));
}

// ==========================================================================
// 1. Default Confectionery Catalog (Karachi Market Rates)
// ==========================================================================
const DEFAULT_PRODUCTS_CATALOG = [
  // --- BISCONNI ---
  {
    id: "bisc-cocomo-24",
    name: "Bisconni Cocomo Chocolate Biscuits (24 Packs Box)",
    brand: "Bisconni",
    category: "Biscuits & Wafers",
    price: 480,
    retailPrice: 600,
    unit: "Box of 24 Packs (23g each)",
    image: "Products and List/Bisconni/product-21318-bisconni-cocomo-biscuits-23-gm-x-24-pcs-box-thumb-26192.webp",
    isSpecialSale: true,
    rating: 4.9,
    badge: "ðŸ”¥ Karachi Bestseller",
    description: "The nation's most loved chocolate-filled crunchy bite biscuits. Freshly packed 24 mini bags in a retail dispenser box. Perfect for school snacks, retail shops, and party favor packs.",
    specifications: {
      "Pack Count": "24 Individual Packs",
      "Net Weight": "552g (23g x 24)",
      "Flavor": "Rich Chocolate Creme Fill",
      "Manufacturer": "Bisconni (Ismail Industries)"
    }
  },
  {
    id: "bisc-chocolatto-12",
    name: "Bisconni Chocolatto Cream Biscuits (12 Pcs Box)",
    brand: "Bisconni",
    category: "Biscuits & Wafers",
    price: 360,
    retailPrice: 420,
    unit: "Display Box of 12 Packs",
    image: "Products and List/Bisconni/Screenshot 2026-10-18 120336.png",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Premium Cookie",
    description: "Indulgent Belgian style soft center cookies baked to perfection with silky chocolate cream. Munir Shop wholesale rate.",
    specifications: {
      "Pack Count": "12 Snack Packs",
      "Net Weight": "432g",
      "Flavor": "Belgian Chocolate Center",
      "Manufacturer": "Bisconni Pakistan"
    }
  },
  {
    id: "bisc-choc-chip-24",
    name: "Bisconni Real Chocolate Chip Cookies (24 Pcs Family Box)",
    brand: "Bisconni",
    category: "Biscuits & Wafers",
    price: 540,
    retailPrice: 650,
    unit: "Box of 24 Packs",
    image: "Products and List/Bisconni/Gemini_Generated_Image_eczu5aeczu5aeczu.jpg",
    isSpecialSale: true,
    rating: 4.8,
    badge: "Family Favorite",
    description: "Golden buttery crunchy cookies studded with rich cocoa chips. A staple tea-time treat for Karachi households.",
    specifications: {
      "Pack Count": "24 Packs",
      "Net Weight": "576g",
      "Flavor": "Butter Chocolate Chip",
      "Manufacturer": "Bisconni"
    }
  },

  // --- CANDYLAND ---
  {
    id: "cl-sonnet-24",
    name: "Candyland Sonnet Peanut & Fudge Chocolate Bar (24 Pcs Box)",
    brand: "Candyland",
    category: "Chocolates",
    price: 600,
    retailPrice: 720,
    unit: "Dispenser Box of 24 Bars",
    image: "Products and List/Candyland/Gemini_Generated_Image_ec36ffec36ffec36.jpg",
    isSpecialSale: true,
    rating: 4.9,
    badge: "ðŸ”¥ Super Saver",
    description: "Loaded with crunchy roasted peanuts and thick gooey caramel fudge wrapped in rich milk chocolate. Wholesale price direct to Landhi customers.",
    specifications: {
      "Pack Count": "24 Full Bars",
      "Ingredients": "Roasted Peanuts, Caramel, Milk Chocolate",
      "Manufacturer": "Candyland (Ismail Industries)",
      "Shelf Life": "12 Months Verified"
    }
  },
  {
    id: "cl-now-24",
    name: "Candyland NOW Nougat & Caramel Chocolate (24 Pcs Box)",
    brand: "Candyland",
    category: "Chocolates",
    price: 580,
    retailPrice: 720,
    unit: "Box of 24 Bars",
    image: "Products and List/Candyland/sdfs111.jpg",
    isSpecialSale: true,
    rating: 4.8,
    badge: "Wholesale Special",
    description: "Crispy wafer and chewy nougat topped with golden caramel and coated in rich dairy milk chocolate.",
    specifications: {
      "Pack Count": "24 Bars",
      "Flavor": "Nougat & Caramel Wafer",
      "Manufacturer": "Candyland Pakistan"
    }
  },
  {
    id: "cl-paradise-24",
    name: "Candyland Paradise Coconut Chocolate Bar (24 Pcs Box)",
    brand: "Candyland",
    category: "Chocolates",
    price: 550,
    retailPrice: 680,
    unit: "Box of 24 Bars",
    image: "Products and List/Candyland/Gemini_Generated_Image_zell04zell04zell.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Coconut Delight",
    description: "Juicy moist coconut core coated with creamy chocolate. Exceptional value for Karachi candy lovers.",
    specifications: {
      "Pack Count": "24 Bars",
      "Flavor": "Sweet Desiccated Coconut",
      "Manufacturer": "Candyland"
    }
  },
  {
    id: "cl-chili-mili-24",
    name: "Candyland Chili Mili Tamarind Gummy Jelly (24 Pcs Box)",
    brand: "Candyland",
    category: "Candies & Toffees",
    price: 360,
    retailPrice: 480,
    unit: "Dispenser Box of 24 Pouches",
    image: "Products and List/Candyland/Gemini_Generated_Image_n5yxf7n5yxf7n5yx.jpg",
    isSpecialSale: true,
    rating: 4.9,
    badge: "ðŸ”¥ Iconic Karachi Hit",
    description: "Pakistan's legendary sweet, sour, and spicy tamarind chili gummy jellies. Chewy and intensely addictive.",
    specifications: {
      "Pack Count": "24 Bags",
      "Taste": "Spicy & Sour Tamarind Jelly",
      "Manufacturer": "Candyland"
    }
  },
  {
    id: "cl-abc-jelly-24",
    name: "Candyland ABC Fruity Soft Jellies (24 Pcs Box)",
    brand: "Candyland",
    category: "Candies & Toffees",
    price: 350,
    retailPrice: 450,
    unit: "Box of 24 Packs",
    image: "Products and List/Candyland/Gemini_Generated_Image_yefvzjyefvzjyefv.jpg",
    isSpecialSale: false,
    rating: 4.7,
    badge: "Kids Favorite",
    description: "Vibrant fruit flavored chewy alphabet jellies made with real fruit essences.",
    specifications: {
      "Pack Count": "24 Packs",
      "Flavors": "Strawberry, Orange, Lemon, Apple",
      "Manufacturer": "Candyland"
    }
  },
  {
    id: "cl-fantasia-pack",
    name: "Candyland Fantasia Soft Marshmallows (Party Pouch)",
    brand: "Candyland",
    category: "Candies & Toffees",
    price: 420,
    retailPrice: 520,
    unit: "Jumbo Party Pack",
    image: "Products and List/Candyland/Gemini_Generated_Image_mdt8jjmdt8jjmdt8.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Party Must",
    description: "Melt-in-mouth multi-color marshmallow braids. Ideal for birthday party cones, hot chocolate, and desserts.",
    specifications: {
      "Net Weight": "400g Jumbo Pack",
      "Texture": "Ultra Soft & Fluffy",
      "Manufacturer": "Candyland"
    }
  },
  {
    id: "cl-eclairs-pouch",
    name: "Candyland Eclairs Chocolate Center Toffees (Wholesale Pouch)",
    brand: "Candyland",
    category: "Candies & Toffees",
    price: 280,
    retailPrice: 350,
    unit: "Wholesale Pouch Pack",
    image: "Products and List/Candyland/images (2).jpg",
    isSpecialSale: false,
    rating: 4.7,
    badge: "Classic Toffee",
    description: "Rich chewy caramel candy bursting with a velvety liquid chocolate center.",
    specifications: {
      "Piece Count": "Approx. 60+ Toffees",
      "Flavor": "Caramel & Chocolate",
      "Manufacturer": "Candyland"
    }
  },

  // --- HILAL ---
  {
    id: "hl-ding-dong-36",
    name: "Hilal Ding Dong Bubble Gum (36 Pcs Dispenser Box)",
    brand: "Hilal",
    category: "Candies & Toffees",
    price: 340,
    retailPrice: 430,
    unit: "Dispenser Box of 36 Pcs",
    image: "Products and List/Hilal/Gemini_Generated_Image_5xo3ka5xo3ka5xo3.jpg",
    isSpecialSale: true,
    rating: 4.9,
    badge: "ðŸ”¥ Legendary Favorite",
    description: "The cat mascot bubble gum that every Pakistani grew up with! Includes fun surprise tattoo stickers inside every wrapper.",
    specifications: {
      "Pack Count": "36 Individual Gum Packs",
      "Features": "Includes Free Tattoo Stickers",
      "Flavor": "Classic Tutti Frutti Bubble Gum",
      "Manufacturer": "Hilal Foods Pakistan"
    }
  },
  {
    id: "hl-khopra-70",
    name: "Hilal Khopra Candy Real Desiccated Coconut (70 Pcs Jumbo Box)",
    brand: "Hilal",
    category: "Candies & Toffees",
    price: 420,
    retailPrice: 550,
    unit: "Jumbo Box of 70 Pcs",
    image: "Products and List/Hilal/Gemini_Generated_Image_nphog9nphog9npho.jpg",
    isSpecialSale: true,
    rating: 4.9,
    badge: "Pure Coconut",
    description: "Packed with real crushed coconut and creamy condensed milk notes. Karachi's favorite traditional confection.",
    specifications: {
      "Piece Count": "70 Wrapped Candies",
      "Main Ingredient": "Real Dried Coconut",
      "Manufacturer": "Hilal Foods"
    }
  },
  {
    id: "hl-khopra-pouch",
    name: "Hilal Khopra Candy Stand-up Zipper Pouch (25 Pcs)",
    brand: "Hilal",
    category: "Candies & Toffees",
    price: 160,
    retailPrice: 200,
    unit: "Resealable Zipper Pouch",
    image: "Products and List/Hilal/Gemini_Generated_Image_a10axra10axra10a.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Snack Pack",
    description: "Convenient travel-friendly pouch of fresh coconut candies. Keeps candies soft and fragrant.",
    specifications: {
      "Piece Count": "25 Candies",
      "Packaging": "Resealable Zipper",
      "Manufacturer": "Hilal Foods"
    }
  },
  {
    id: "hl-fresh-up-36",
    name: "Hilal Fresh Up Spearmint Sugar-Free Chewing Gum (36 Pcs Box)",
    brand: "Hilal",
    category: "Candies & Toffees",
    price: 450,
    retailPrice: 540,
    unit: "Display Box of 36 Pcs",
    image: "Products and List/Hilal/Gemini_Generated_Image_96bug296bug296bu.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Cool Mint",
    description: "Liquid center burst spearmint gum for intense instant breath freshness.",
    specifications: {
      "Piece Count": "36 Blister Packs",
      "Flavor": "Spearmint Liquid Burst",
      "Sugar Content": "Low Sugar Formula",
      "Manufacturer": "Hilal Foods"
    }
  },
  {
    id: "hl-choran-chatni-70",
    name: "Hilal Choran Chatni Chatpata Digestive Candy (70 Pcs Box)",
    brand: "Hilal",
    category: "Imli & Traditional",
    price: 380,
    retailPrice: 480,
    unit: "Box of 70 Pcs",
    image: "Products and List/Hilal/Gemini_Generated_Image_a1eh56a1eh56a1eh.jpg",
    isSpecialSale: true,
    rating: 4.8,
    badge: "Chatpata Hit",
    description: "Desi herbal digestive sweet & sour candy loaded with black salt, cumin, and dry mango.",
    specifications: {
      "Piece Count": "70 Candies",
      "Flavor": "Spicy Choran Masala",
      "Manufacturer": "Hilal Foods"
    }
  },
  {
    id: "hl-pan-pasand-70",
    name: "Hilal Pan Pasand Traditional Betel Leaf Candy (70 Pcs Box)",
    brand: "Hilal",
    category: "Candies & Toffees",
    price: 390,
    retailPrice: 500,
    unit: "Box of 70 Pcs",
    image: "Products and List/Hilal/Gemini_Generated_Image_cgyqqdcgyqqdcgyq.jpg",
    isSpecialSale: false,
    rating: 4.9,
    badge: "Karachi Tradition",
    description: "Iconic red candy capturing the royal aroma and flavor of sweet Karachi Meetha Paan.",
    specifications: {
      "Piece Count": "70 Candies",
      "Flavor": "Meetha Paan & Rose Water",
      "Manufacturer": "Hilal Foods"
    }
  },
  {
    id: "hl-candeez-imli-70",
    name: "Hilal Candeez Imli Chatkhara Tangy Chew (70 Pcs Box)",
    brand: "Hilal",
    category: "Imli & Traditional",
    price: 370,
    retailPrice: 460,
    unit: "Box of 70 Pcs",
    image: "Products and List/Hilal/Gemini_Generated_Image_wn09lwwn09lwwn09.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Tangy Tamarind",
    description: "Pure tamarind pulp extract chew candy with balanced sweetness and mouth-watering tartness.",
    specifications: {
      "Piece Count": "70 Pcs",
      "Flavor": "Real Tamarind & Rock Salt",
      "Manufacturer": "Hilal Foods"
    }
  },
  {
    id: "hl-aamrus-70",
    name: "Hilal Aamrus Mango Pulp Drop Candies (70 Pcs Box)",
    brand: "Hilal",
    category: "Candies & Toffees",
    price: 380,
    retailPrice: 470,
    unit: "Box of 70 Pcs",
    image: "Products and List/Hilal/Gemini_Generated_Image_izlc8qizlc8qizlc.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Chaunsa Mango",
    description: "Rich juicy taste of summer Chaunsa mangoes captured in glossy sweet drop candies.",
    specifications: {
      "Piece Count": "70 Candies",
      "Flavor": "Ripe Pakistani Mango",
      "Manufacturer": "Hilal Foods"
    }
  },
  {
    id: "hl-super-sour-70",
    name: "Hilal Super Sour Lemon & Green Apple Drops (70 Pcs Box)",
    brand: "Hilal",
    category: "Candies & Toffees",
    price: 360,
    retailPrice: 450,
    unit: "Box of 70 Pcs",
    image: "Products and List/Hilal/Gemini_Generated_Image_f32jdif32jdif32j.jpg",
    isSpecialSale: false,
    rating: 4.7,
    badge: "Extreme Sour",
    description: "Zesty lemon and sour green apple hard boiled candies with a shocking tangy kick.",
    specifications: {
      "Piece Count": "70 Pcs",
      "Flavor": "Sour Lemon & Apple",
      "Manufacturer": "Hilal Foods"
    }
  },
  {
    id: "hl-cupcake-12",
    name: "Hilal CupCake Chocolate & Vanilla Sponge (12 Pcs Box)",
    brand: "Hilal",
    category: "Biscuits & Wafers",
    price: 320,
    retailPrice: 390,
    unit: "Box of 12 Cupcakes",
    image: "Products and List/Hilal/Gemini_Generated_Image_wqk4shwqk4shwqk4.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Fresh Sponge",
    description: "Ultra soft baked sponge cakes with rich creamy cocoa core. Delicious with morning chai.",
    specifications: {
      "Piece Count": "12 Cakes Individually Foil Wrapped",
      "Flavor": "Chocolate Creme Filled",
      "Manufacturer": "Hilal Foods"
    }
  },

  // --- GIBS ---
  {
    id: "gibs-badam-30",
    name: "Gibs Badam Delight Almond Candy (30 Pcs Box)",
    brand: "Gibs",
    category: "Candies & Toffees",
    price: 380,
    retailPrice: 460,
    unit: "Dispenser Box of 30 Pcs",
    image: "Products and List/Gibs/baw1111.jpg",
    isSpecialSale: true,
    rating: 4.8,
    badge: "Almond Royal",
    description: "Rich milky almond toffees enriched with authentic crushed almond aroma and dairy richness.",
    specifications: {
      "Piece Count": "30 Bars/Packs",
      "Flavor": "Roasted Almond & Milk",
      "Manufacturer": "Gibs Confectionery"
    }
  },
  {
    id: "gibs-bulbulay-24",
    name: "Gibs Bulbulay Crispy Wafer Bars (24 Pcs Box)",
    brand: "Gibs",
    category: "Biscuits & Wafers",
    price: 360,
    retailPrice: 450,
    unit: "Box of 24 Wafers",
    image: "Products and List/Gibs/Gemini_Generated_Image_2hnl222hnl222hnl.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Crispy Wafer",
    description: "Light crisp layered wafers generously coated in smooth chocolate and vanilla cream.",
    specifications: {
      "Piece Count": "24 Foil Wrapped Wafers",
      "Flavor": "Chocolate Wafer Layers",
      "Manufacturer": "Gibs"
    }
  },
  {
    id: "gibs-donut-cake-12",
    name: "Gibs Soft Glazed Donut Cakes & Rolls (12 Pcs Box)",
    brand: "Gibs",
    category: "Biscuits & Wafers",
    price: 340,
    retailPrice: 420,
    unit: "Box of 12 Cakes",
    image: "Products and List/Gibs/Screenshot 2026-10-18 114445.png",
    isSpecialSale: false,
    rating: 4.7,
    badge: "Soft Bakery",
    description: "Baked donut cakes with strawberry glaze and soft chocolate rolled sponges.",
    specifications: {
      "Piece Count": "12 Cakes",
      "Flavors": "Strawberry Glaze & Banana Cream",
      "Manufacturer": "Gibs"
    }
  },
  {
    id: "gibs-strawberry-cupcake-12",
    name: "Gibs Strawberry Swirl Soft CupCake (12 Pcs Box)",
    brand: "Gibs",
    category: "Biscuits & Wafers",
    price: 320,
    retailPrice: 390,
    unit: "Box of 12 Cupcakes",
    image: "Products and List/Gibs/Screenshot 2026-10-18 114533.png",
    isSpecialSale: false,
    rating: 4.7,
    badge: "Fresh Baked",
    description: "Fluffy vanilla sponge cake centered with luscious strawberry jam filling.",
    specifications: {
      "Piece Count": "12 Packs",
      "Flavor": "Strawberry Creme Center",
      "Manufacturer": "Gibs"
    }
  },
  {
    id: "gibs-milkita-24",
    name: "Gibs Milkita Chocolate Cream & Koko Masti (24 Pcs)",
    brand: "Gibs",
    category: "Chocolates",
    price: 420,
    retailPrice: 520,
    unit: "Display Box of 24 Pcs",
    image: "Products and List/Gibs/Screenshot 2026-10-18 114616.png",
    isSpecialSale: true,
    rating: 4.8,
    badge: "Creamy Cocoa",
    description: "Milky chocolate bars and crispy cocoa crunch balls packed with energy.",
    specifications: {
      "Piece Count": "24 Packs",
      "Flavor": "Condensed Milk & Chocolate",
      "Manufacturer": "Gibs"
    }
  },

  // --- GIGGLY ---
  {
    id: "gig-milkees-60",
    name: "Giggly Milkees Creamy Milk Toffee (60 Pcs Jumbo Box)",
    brand: "Giggly",
    category: "Candies & Toffees",
    price: 390,
    retailPrice: 490,
    unit: "Jumbo Dispenser Box of 60 Pcs",
    image: "Products and List/Giggly/Bac.jpg",
    isSpecialSale: true,
    rating: 4.9,
    badge: "Jumbo Box",
    description: "Made with genuine dairy cream notes for a melting, velvety smooth caramel milk taste.",
    specifications: {
      "Piece Count": "60 Large Toffees",
      "Flavor": "Pure Milk Toffee",
      "Manufacturer": "Giggly Confectionery"
    }
  },
  {
    id: "gig-boom-boom-36",
    name: "Giggly Big Boom Boom Bubble Gum (36 Pcs Cricket Edition)",
    brand: "Giggly",
    category: "Candies & Toffees",
    price: 350,
    retailPrice: 440,
    unit: "Box of 36 Pcs",
    image: "Products and List/Giggly/Gemini_Generated_Image_2aos6p2aos6p2aos.jpg",
    isSpecialSale: true,
    rating: 4.8,
    badge: "Big Bubble Hit",
    description: "Giant bubble blowing strawberry flavored bubble gum featuring Shahid Afridi cricket styling.",
    specifications: {
      "Piece Count": "36 Big Bubble Packs",
      "Feature": "Long Lasting Strawberry Bubble",
      "Manufacturer": "Giggly"
    }
  },
  {
    id: "gig-filly-orange-60",
    name: "Giggly Filly Tangy Orange Center-Filled Toffee (60 Pcs Box)",
    brand: "Giggly",
    category: "Candies & Toffees",
    price: 380,
    retailPrice: 470,
    unit: "Box of 60 Pcs",
    image: "Products and List/Giggly/Gemini_Generated_Image_kp0e1ykp0e1ykp0e.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Juicy Center",
    description: "Soft chewy toffee with an unexpected burst of refreshing orange liquid in the center.",
    specifications: {
      "Piece Count": "60 Toffees",
      "Flavor": "Zesty Orange Center Fill",
      "Manufacturer": "Giggly"
    }
  },
  {
    id: "gig-twisto-jelly-24",
    name: "Giggly Twisto Jelly Sticks & Straws (24 Pcs Display Box)",
    brand: "Giggly",
    category: "Candies & Toffees",
    price: 320,
    retailPrice: 400,
    unit: "Box of 24 Straws",
    image: "Products and List/Giggly/Gemini_Generated_Image_dok9qpdok9qpdok9.jpg",
    isSpecialSale: false,
    rating: 4.7,
    badge: "Fun Chew",
    description: "Multi-colored fruit twist gummy sticks with sugar crystal coating. Huge favorite among school kids.",
    specifications: {
      "Piece Count": "24 Sticks",
      "Flavors": "Tutti Frutti, Strawberry, Blue Raspberry",
      "Manufacturer": "Giggly"
    }
  },
  {
    id: "gig-cardamom-gum-30",
    name: "Giggly Elaichi Center-Filled Cardamom Gum (30 Pcs Box)",
    brand: "Giggly",
    category: "Candies & Toffees",
    price: 360,
    retailPrice: 450,
    unit: "Box of 30 Pcs",
    image: "Products and List/Giggly/Gemini_Generated_Image_43m6lb43m6lb43m6.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Desi Cardamom",
    description: "Traditional green cardamom liquid inside chewy chewing gum. Perfect post-meal refresher.",
    specifications: {
      "Piece Count": "30 Blister Packs",
      "Flavor": "Real Green Elaichi Extract",
      "Manufacturer": "Giggly"
    }
  },
  {
    id: "gig-filly-chew-60",
    name: "Giggly Filly Chew Assorted Fruit Toffees (60 Pcs Box)",
    brand: "Giggly",
    category: "Candies & Toffees",
    price: 390,
    retailPrice: 480,
    unit: "Box of 60 Pcs",
    image: "Products and List/Giggly/Gemini_Generated_Image_qahes3qahes3qahe.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Fruit Assortment",
    description: "Soft chewy candies in blackcurrant, mango, strawberry, and green apple flavours.",
    specifications: {
      "Piece Count": "60 Toffees",
      "Flavors": "4 Mixed Fruit Varieties",
      "Manufacturer": "Giggly"
    }
  },

  // --- LU CONTINENTAL ---
  {
    id: "lu-prince-24",
    name: "LU Prince Chocolate Sandwich Biscuits (24 Pcs Box)",
    brand: "LU",
    category: "Biscuits & Wafers",
    price: 560,
    retailPrice: 680,
    unit: "Box of 24 Packs",
    image: "Products and List/LU/_06415.jpg",
    isSpecialSale: true,
    rating: 4.9,
    badge: "ðŸ”¥ Super Brand",
    description: "The royal prince chocolate biscuit loved across generations in Pakistan. Crisp biscuits hugging rich chocolate creme.",
    specifications: {
      "Pack Count": "24 Individual Packs",
      "Flavor": "Classic Cocoa Creme",
      "Manufacturer": "Continental Biscuits (LU / MondelÄ“z)"
    }
  },
  {
    id: "lu-zeera-plus-24",
    name: "LU Zeera Plus Cumin Seed Biscuits (24 Pcs Box)",
    brand: "LU",
    category: "Biscuits & Wafers",
    price: 540,
    retailPrice: 660,
    unit: "Box of 24 Packs",
    image: "Products and List/LU/images (1).jpg",
    isSpecialSale: false,
    rating: 4.9,
    badge: "Karachi Chai Favorite",
    description: "Sweet, salty and aromatic roasted cumin seeds baked inside buttery crunchy biscuits. Pakistan's top tea biscuit.",
    specifications: {
      "Pack Count": "24 Packs",
      "Flavor": "Roasted Cumin Seeds & Butter",
      "Manufacturer": "LU Continental"
    }
  },
  {
    id: "lu-master-assortment",
    name: "LU Mega Assortment Master Carton (Gala, TUC, Oreo, Candi)",
    brand: "LU",
    category: "Special Wholesale Deals",
    price: 1450,
    retailPrice: 1800,
    unit: "Master Wholesale Assortment",
    image: "Products and List/LU/biscuits_2.jpg",
    isSpecialSale: true,
    rating: 4.9,
    badge: "Wholesale Carton Deal",
    description: "Comprehensive mixed wholesale variety pack containing LU's top selling biscuits: Gala Egg Milk, TUC Salty, Candi Brown Sugar, and Oreo.",
    specifications: {
      "Total Packs": "Mixed Retail Carton",
      "Ideal For": "Grocery Shops, Corner Marts, Large Families",
      "Manufacturer": "LU Continental"
    }
  },

  // --- PEAK FREANS ---
  {
    id: "pf-lemon-8",
    name: "Peak Freans Lemon Sandwich Biscuits (8 Packs Family Box)",
    brand: "Peak Freans",
    category: "Biscuits & Wafers",
    price: 420,
    retailPrice: 500,
    unit: "Family Box of 8 Large Packs",
    image: "Products and List/PeakFreance/PF-LEMON-8-1.webp",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Zesty Lemon",
    description: "Crisp baked golden biscuits layered with zesty tart natural lemon cream. English Biscuit Manufacturers classic.",
    specifications: {
      "Pack Count": "8 Family Packs",
      "Flavor": "Natural Lemon Creme",
      "Manufacturer": "English Biscuit Manufacturers (EBM)"
    }
  },
  {
    id: "pf-party-pik-12",
    name: "Peak Freans Party Pik 12 Munch Packs Assortment",
    brand: "Peak Freans",
    category: "Biscuits & Wafers",
    price: 480,
    retailPrice: 580,
    unit: "Box of 12 Munch Packs",
    image: "Products and List/PeakFreance/6d036985e8c5c3597914324f354c7aa4.jpg",
    isSpecialSale: true,
    rating: 4.8,
    badge: "Party Variety",
    description: "A fun assortment box containing Sooper, Rio Chocolate & Vanilla, Lemon Sandwich, and Farmhouse Cookies.",
    specifications: {
      "Pack Count": "12 Packs",
      "Variety": "Mixed Peak Freans Bestsellers",
      "Manufacturer": "EBM"
    }
  },
  {
    id: "pf-sooper-rio-carton",
    name: "Peak Freans Sooper & Rio Wholesale Assortment",
    brand: "Peak Freans",
    category: "Special Wholesale Deals",
    price: 1350,
    retailPrice: 1650,
    unit: "Master Assortment Carton",
    image: "Products and List/PeakFreance/peak-freans.webp",
    isSpecialSale: true,
    rating: 4.9,
    badge: "Wholesale Carton Deal",
    description: "Direct wholesale carton combining Pakistan's #1 egg & milk cookie Sooper alongside fun chocolate cream Rio.",
    specifications: {
      "Carton Contents": "Sooper Egg & Milk + Rio Creme",
      "Wholesale Margin": "Extra 18% Retailer Discount",
      "Manufacturer": "EBM"
    }
  },

  // --- MIX & TRADITIONAL PAKISTANI SPECIALTIES ---
  {
    id: "mix-shahi-meva-48",
    name: "Shahi Meva Royal Sweet Supari & Dry Fruit (48 Pcs Box)",
    brand: "Mix",
    category: "Imli & Traditional",
    price: 520,
    retailPrice: 650,
    unit: "Display Box of 48 Pouches",
    image: "Products and List/Mix/Screenshot 2026-10-18 122027.png",
    isSpecialSale: true,
    rating: 4.9,
    badge: "Royal Refreshment",
    description: "Premium cardamom, saffron, almond flakes, and sweet aromatic supari. A post-dinner essential in Karachi.",
    specifications: {
      "Pack Count": "48 Pouches",
      "Ingredients": "Dry Fruits, Cardamom, Sweet Betel Slices",
      "Manufacturer": "Shahi Enterprises"
    }
  },
  {
    id: "mix-tamil-imli-20",
    name: "Tamil Imli Aloocha Khushk Dried Plum Chatkhara (20 Pcs Pack)",
    brand: "Mix",
    category: "Imli & Traditional",
    price: 380,
    retailPrice: 480,
    unit: "Pack of 20 Pouches",
    image: "Products and List/Mix/Gemini_Generated_Image_sewzoisewzoisewz.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Desi Chatkhara",
    description: "Traditional sun-dried sour aloocha plums dusted with Landhi special spicy black salt masala.",
    specifications: {
      "Pack Count": "20 Individual Bags",
      "Flavor": "Khatta Meetha Aloocha",
      "Origin": "Karachi Specialty"
    }
  },
  {
    id: "mix-damadam-imli-24",
    name: "Dama Dam Imli Chatkhara Sweet & Sour Paste (24 Pcs Pack)",
    brand: "Mix",
    category: "Imli & Traditional",
    price: 340,
    retailPrice: 430,
    unit: "Pack of 24 Squeeze Tubes",
    image: "Products and List/Mix/Gemini_Generated_Image_vyghfyvyghfyvygh.jpg",
    isSpecialSale: false,
    rating: 4.7,
    badge: "Tangy Paste",
    description: "Pure sour tamarind paste squeeze tubes. Bursting with nostalgia and mouth-watering tartness.",
    specifications: {
      "Pack Count": "24 Tubes",
      "Flavor": "Pure Spiced Tamarind Paste",
      "Origin": "Landhi Confectionery Market"
    }
  },
  {
    id: "mix-bacha-toys-30",
    name: "Halchal Bacha Surprise Toys & Candy Box (30 Pcs)",
    brand: "Mix",
    category: "Candies & Toffees",
    price: 490,
    retailPrice: 600,
    unit: "Dispenser Box of 30 Surprise Capsules",
    image: "Products and List/Mix/Gemini_Generated_Image_nsp9wdnsp9wdnsp9.jpg",
    isSpecialSale: false,
    rating: 4.8,
    badge: "Toy & Candy",
    description: "High excitement surprise toy capsules containing funny mini toys, cars, rings, and sweet fruit candies.",
    specifications: {
      "Piece Count": "30 Capsules",
      "Features": "Different Toy in Every Capsule + Candies",
      "Target": "Children Party Bags & Corner Shops"
    }
  }
];

// Active runtime catalog (loaded from localStorage or DEFAULT_PRODUCTS_CATALOG)
let PRODUCTS_CATALOG = [];

// ==========================================================================
// 2. Application State Management
// ==========================================================================
const AppState = {
  cart: [],
  brands: [],
  categories: [],
  activeBrand: "all",
  activeCategory: "all",
  searchQuery: "",
  specialSaleOnly: false,
  sortBy: "featured",
  selectedProductForModal: null,
  modalQuantity: 1,

  // Load store products, brands, and categories from localStorage
  initStoreData() {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.products);
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        PRODUCTS_CATALOG = Array.isArray(parsed) ? parsed : JSON.parse(JSON.stringify(DEFAULT_PRODUCTS_CATALOG));
      } else {
        PRODUCTS_CATALOG = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS_CATALOG));
      }
    } catch (e) {
      console.warn("Could not load products from localStorage", e);
      PRODUCTS_CATALOG = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS_CATALOG));
    }

    try {
      const savedBrands = localStorage.getItem(STORAGE_KEYS.brands);
      if (savedBrands) {
        const parsed = JSON.parse(savedBrands);
        this.brands = (Array.isArray(parsed) && parsed.length) ? parsed : [...DEFAULT_BRANDS];
      } else {
        this.brands = [...DEFAULT_BRANDS];
      }
    } catch (e) {
      this.brands = [...DEFAULT_BRANDS];
    }

    try {
      const savedCats = localStorage.getItem(STORAGE_KEYS.categories);
      if (savedCats) {
        const parsed = JSON.parse(savedCats);
        this.categories = (Array.isArray(parsed) && parsed.length) ? parsed : [...DEFAULT_CATEGORIES];
      } else {
        this.categories = [...DEFAULT_CATEGORIES];
      }
    } catch (e) {
      this.categories = [...DEFAULT_CATEGORIES];
    }
  },

  saveStoreProducts() {
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(PRODUCTS_CATALOG));
      return true;
    } catch (e) {
      console.warn("Could not save products to localStorage", e);
      showToast("Storage limit reached! Try using a smaller image or image URL.", "error");
      return false;
    }
  },

  saveStoreBrands() {
    try {
      localStorage.setItem(STORAGE_KEYS.brands, JSON.stringify(this.brands));
    } catch (e) {
      console.warn("Could not save brands", e);
    }
  },

  saveStoreCategories() {
    try {
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(this.categories));
    } catch (e) {
      console.warn("Could not save categories", e);
    }
  },

  syncCartWithCatalog() {
    let changed = false;
    this.cart = this.cart.filter(cartItem => {
      const live = PRODUCTS_CATALOG.find(p => p.id === cartItem.id);
      if (!live) {
        changed = true;
        return false;
      }
      if (cartItem.price !== live.price || cartItem.name !== live.name || cartItem.unit !== live.unit || cartItem.image !== live.image) {
        cartItem.price = live.price;
        cartItem.retailPrice = live.retailPrice;
        cartItem.name = live.name;
        cartItem.unit = live.unit;
        cartItem.image = live.image;
        changed = true;
      }
      return true;
    });
    if (changed) {
      this.saveCart();
      this.updateCartUI();
    }
  },

  // Load cart from LocalStorage
  initCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.cart);
      if (saved) {
        this.cart = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load cart from localStorage", e);
      this.cart = [];
    }
  },

  // Save cart to LocalStorage
  saveCart() {
    try {
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(this.cart));
    } catch (e) {
      console.warn("Could not save cart", e);
    }
  },

  // Add Item to Cart with quantity
  addToCart(productId, quantity = 1) {
    const product = PRODUCTS_CATALOG.find(p => p.id === productId);
    if (!product) return;

    quantity = Math.max(1, parseInt(quantity) || 1);
    const existingIndex = this.cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        unit: product.unit,
        price: product.price,
        retailPrice: product.retailPrice,
        image: product.image,
        quantity: quantity
      });
    }

    this.saveCart();
    this.updateCartUI();
    showToast(`Added ${quantity}x "${product.name.slice(0, 24)}..." to cart!`, "success");
  },

  // Update item quantity
  updateCartItemQty(productId, newQty) {
    newQty = parseInt(newQty);
    if (isNaN(newQty) || newQty <= 0) {
      this.removeCartItem(productId);
      return;
    }

    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity = newQty;
      this.saveCart();
      this.updateCartUI();
    }
  },

  // Remove from cart
  removeCartItem(productId) {
    const item = this.cart.find(i => i.id === productId);
    const itemName = item ? item.name : "Item";
    this.cart = this.cart.filter(i => i.id !== productId);
    this.saveCart();
    this.updateCartUI();
    showToast(`Removed "${itemName.slice(0, 24)}..." from cart.`, "info");
  },

  // Clear entire cart
  clearCart() {
    if (this.cart.length === 0) return;
    this.cart = [];
    this.saveCart();
    this.updateCartUI();
    showToast("Shopping cart cleared.", "info");
  },

  // Calculations
  getCartTotals() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const isFreeDelivery = subtotal >= SHOP_CONFIG.freeDeliveryThreshold;
    const deliveryFee = (subtotal > 0 && !isFreeDelivery) ? SHOP_CONFIG.deliveryFeeLandhi : 0;
    const total = subtotal + deliveryFee;

    return {
      subtotal,
      totalItems,
      deliveryFee,
      isFreeDelivery,
      total
    };
  },

  // Sync Cart UI elements
  updateCartUI() {
    const totals = this.getCartTotals();

    // Badges & Counters
    const headerBadge = document.getElementById("cartCountBadge");
    const drawerCount = document.getElementById("cartDrawerCount");
    const headerSubtotal = document.getElementById("cartSubtotalHeader");
    const drawerSubtotal = document.getElementById("cartSubtotalAmount");
    const drawerDelivery = document.getElementById("cartDeliveryAmount");
    const drawerTotal = document.getElementById("cartTotalAmount");
    const mobileCount = document.getElementById("mobileCartCount");
    const mobileTotal = document.getElementById("mobileCartTotal");

    if (headerBadge) headerBadge.textContent = totals.totalItems;
    if (drawerCount) drawerCount.textContent = `${totals.totalItems} items`;
    if (headerSubtotal) headerSubtotal.textContent = `PKR ${totals.subtotal.toLocaleString()}`;
    if (drawerSubtotal) drawerSubtotal.textContent = `PKR ${totals.subtotal.toLocaleString()}`;
    if (drawerTotal) drawerTotal.textContent = `PKR ${totals.total.toLocaleString()}`;

    if (drawerDelivery) {
      if (totals.subtotal === 0) {
        drawerDelivery.textContent = "PKR 0";
        drawerDelivery.className = "text-secondary";
      } else if (totals.isFreeDelivery) {
        drawerDelivery.textContent = "FREE (Landhi 22 Special)";
        drawerDelivery.className = "text-green";
      } else {
        drawerDelivery.textContent = `PKR ${totals.deliveryFee} (Free above PKR 1,500)`;
        drawerDelivery.className = "text-secondary";
      }
    }

    if (mobileCount) mobileCount.textContent = totals.totalItems;
    if (mobileTotal) mobileTotal.textContent = `PKR ${totals.total.toLocaleString()}`;

    // Delivery Progress Bar
    const progressEl = document.getElementById("thresholdProgress");
    const thresholdText = document.getElementById("thresholdText");
    const thresholdPercent = document.getElementById("thresholdPercent");

    if (progressEl && thresholdText && thresholdPercent) {
      if (totals.subtotal >= SHOP_CONFIG.freeDeliveryThreshold) {
        progressEl.style.width = "100%";
        thresholdText.innerHTML = `ðŸŽ‰ <strong>Congratulations!</strong> You unlocked FREE Delivery in Landhi!`;
        thresholdPercent.textContent = "100%";
      } else {
        const remaining = SHOP_CONFIG.freeDeliveryThreshold - totals.subtotal;
        const pct = Math.min(100, Math.round((totals.subtotal / SHOP_CONFIG.freeDeliveryThreshold) * 100));
        progressEl.style.width = `${pct}%`;
        thresholdText.textContent = `Add PKR ${remaining.toLocaleString()} more for Free Landhi Delivery!`;
        thresholdPercent.textContent = `${pct}%`;
      }
    }

    // Render Drawer Items List
    this.renderCartItemsList();
  },

  renderCartItemsList() {
    const container = document.getElementById("cartItemsList");
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-message">
          <i class="fas fa-shopping-basket cart-empty-icon"></i>
          <p>Your confectionery cart is currently empty.</p>
          <small>Explore Cocomo, Ding Dong, Prince, Sonnet, and more below!</small>
        </div>
      `;
      return;
    }

    container.innerHTML = this.cart.map(item => {
      const imgSrc = item.image && item.image.startsWith("data:") ? item.image : encodeURI(item.image || SHOP_CONFIG.defaultImage);
      return `
      <div class="cart-item" data-id="${escapeHtml(item.id)}">
        <img src="${imgSrc}" alt="${escapeHtml(item.name)}" class="cart-item-thumb" onerror="this.onerror=null;this.src='Logo/99900opo9.png'">
        <div class="cart-item-details">
          <h4 class="cart-item-title">${escapeHtml(item.name)}</h4>
          <span class="cart-item-unit-price">PKR ${Number(item.price).toLocaleString()} / ${escapeHtml(item.unit)}</span>
          
          <div class="cart-item-footer">
            <div class="qty-stepper">
              <button type="button" class="qty-btn" onclick="AppState.updateCartItemQty('${escapeHtml(item.id)}', ${item.quantity - 1})" aria-label="Decrease quantity">-</button>
              <input type="text" class="qty-input" value="${item.quantity}" readonly aria-label="Quantity">
              <button type="button" class="qty-btn" onclick="AppState.updateCartItemQty('${escapeHtml(item.id)}', ${item.quantity + 1})" aria-label="Increase quantity">+</button>
            </div>
            <strong class="cart-item-total">PKR ${(item.price * item.quantity).toLocaleString()}</strong>
          </div>
        </div>
        <button type="button" class="remove-cart-item-btn" onclick="AppState.removeCartItem('${escapeHtml(item.id)}')" title="Remove item" aria-label="Remove item">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    }).join("");
  }
};

// ==========================================================================
// 3. Catalog Rendering & Filtering
// ==========================================================================
function getFilteredProducts() {
  return PRODUCTS_CATALOG.filter(product => {
    // Brand Filter
    if (AppState.activeBrand !== "all" && product.brand.toLowerCase() !== AppState.activeBrand.toLowerCase()) {
      return false;
    }

    // Category Filter
    if (AppState.activeCategory !== "all" && product.category !== AppState.activeCategory) {
      return false;
    }

    // Special Sales Filter
    if (AppState.specialSaleOnly && !product.isSpecialSale) {
      return false;
    }

    // Search Query (Name, brand, description, category)
    if (AppState.searchQuery.trim() !== "") {
      const q = AppState.searchQuery.toLowerCase().trim();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchCategory && !matchDesc) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    switch (AppState.sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "savings":
        return (b.retailPrice - b.price) - (a.retailPrice - a.price);
      case "name":
        return a.name.localeCompare(b.name);
      case "featured":
      default:
        return (b.isSpecialSale ? 1 : 0) - (a.isSpecialSale ? 1 : 0);
    }
  });
}

function renderCatalog() {
  const grid = document.getElementById("productsGrid");
  const emptyState = document.getElementById("emptyCatalogState") || document.getElementById("noProductsFound");
  const countEl = document.getElementById("catalogCount") || document.getElementById("productsCountText");
  if (!grid) return;

  const filtered = getFilteredProducts();

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  grid.innerHTML = filtered.map(product => {
    const retailPrice = (product.retailPrice && product.retailPrice > product.price) ? product.retailPrice : product.price;
    const savings = Math.max(0, retailPrice - product.price);
    const savingsPercent = retailPrice > 0 ? Math.round((savings / retailPrice) * 100) : 0;
    const imgSrc = product.image && product.image.startsWith("data:") ? product.image : encodeURI(product.image || SHOP_CONFIG.defaultImage);
    const outOfStock = typeof product.stockQty === "number" && product.stockQty <= 0;

    return `
      <article class="product-card" id="card-${escapeHtml(product.id)}">
        <!-- Thumbnail media -->
        <div class="product-card-media" role="button" tabindex="0" onclick="openProductModal('${escapeHtml(product.id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProductModal('${escapeHtml(product.id)}');}" title="Tap for details & bulk order">
          <img src="${imgSrc}" 
               alt="${escapeHtml(product.name)}" 
               class="product-img" 
               loading="lazy" 
               onerror="this.onerror=null;this.src='Logo/99900opo9.png'">
          
          <div class="product-badges">
            <span class="brand-badge">${escapeHtml(product.brand)}</span>
            ${(product.isSpecialSale && savings > 0) ? `<span class="savings-badge">Save ${savingsPercent}% (Rs. ${savings})</span>` : ""}
            ${outOfStock ? `<span class="savings-badge">Out of Stock</span>` : ""}
          </div>

          <span class="wholesale-tier-badge">
            <i class="fas fa-boxes"></i> ${escapeHtml(product.unit)}
          </span>

          <button type="button" class="quick-view-overlay-btn" onclick="event.stopPropagation(); openProductModal('${escapeHtml(product.id)}')" title="Quick View" aria-label="View product details for ${escapeHtml(product.name)}">
            <i class="fas fa-expand-alt"></i>
          </button>
        </div>

        <!-- Body content -->
        <div class="product-card-body">
          <span class="product-category-text">${escapeHtml(product.category)}</span>
          <h3 class="product-title" role="button" tabindex="0" onclick="openProductModal('${escapeHtml(product.id)}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openProductModal('${escapeHtml(product.id)}');}" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
          <p class="product-pack-desc">${escapeHtml(product.description || "")}</p>

          <!-- Dual Pricing Box -->
          <div class="product-pricing-box">
            <div class="price-main">
              <span class="price-current">PKR ${Number(product.price).toLocaleString()}</span>
              ${savings > 0 ? `<del class="price-original">PKR ${Number(retailPrice).toLocaleString()}</del>` : ""}
            </div>
            ${savings > 0 ? `<span class="price-save">Save PKR ${savings}</span>` : `<span class="price-save">Wholesale Rate</span>`}
          </div>

          <!-- Actions & Quantity -->
          <div class="product-card-actions">
            <div class="qty-control-row">
              <div class="qty-stepper">
                <button type="button" class="qty-btn" onclick="adjustCardQty('${escapeHtml(product.id)}', -1)" aria-label="Decrease quantity">-</button>
                <input type="number" id="qty-input-${escapeHtml(product.id)}" class="qty-input" value="1" min="1" max="999" inputmode="numeric" onchange="clampCardQty('${escapeHtml(product.id)}')" aria-label="Quantity">
                <button type="button" class="qty-btn" onclick="adjustCardQty('${escapeHtml(product.id)}', 1)" aria-label="Increase quantity">+</button>
              </div>

              <button type="button" class="add-cart-btn" onclick="addCardItemToCart('${escapeHtml(product.id)}')">
                <i class="fas fa-cart-plus"></i> Add to Cart
              </button>
            </div>

            <button type="button" class="whatsapp-single-order-btn" onclick="orderSingleProductWhatsApp('${escapeHtml(product.id)}')">
              <i class="fab fa-whatsapp"></i> Order on WhatsApp (03421221630)
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  updateActiveFiltersBar();
  // initCard3DTilt removed
}

function clampCardQty(productId) {
  const input = document.getElementById(`qty-input-${productId}`);
  if (!input) return 1;
  let val = parseInt(input.value, 10);
  if (isNaN(val) || val < 1) val = 1;
  if (val > 999) val = 999;
  input.value = val;
  return val;
}

function adjustCardQty(productId, change) {
  const input = document.getElementById(`qty-input-${productId}`);
  if (!input) return;
  let val = parseInt(input.value, 10) || 1;
  val = Math.max(1, Math.min(999, val + change));
  input.value = val;
}

function addCardItemToCart(productId) {
  const qty = clampCardQty(productId);
  AppState.addToCart(productId, qty);
  const input = document.getElementById(`qty-input-${productId}`);
  if (input) input.value = 1;
}

// ==========================================================================
// 4. Product Quick View Modal (Step-by-Step View)
// ==========================================================================
function openProductModal(productId) {
  const product = PRODUCTS_CATALOG.find(p => p.id === productId);
  if (!product) return;

  AppState.selectedProductForModal = product;
  AppState.modalQuantity = 1;

  const backdrop = document.getElementById("productModalBackdrop");
  if (backdrop) backdrop.style.setProperty("display", "flex", "important");
  const content = document.getElementById("productModalContent");
  if (!backdrop || !content) return;

  const retailPrice = (product.retailPrice && product.retailPrice > product.price) ? product.retailPrice : product.price;
  const savings = Math.max(0, retailPrice - product.price);
  const savingsPct = retailPrice > 0 ? Math.round((savings / retailPrice) * 100) : 0;
  const imgSrc = product.image && product.image.startsWith("data:") ? product.image : encodeURI(product.image || SHOP_CONFIG.defaultImage);
  const stockQty = typeof product.stockQty === "number" ? product.stockQty : null;
  const stockHtml = stockQty !== null
    ? (stockQty > 0
      ? `<span class="text-green"><i class="fas fa-check-circle"></i> In Stock (${stockQty} available)</span>`
      : `<span class="text-amber"><i class="fas fa-exclamation-circle"></i> Currently Out of Stock</span>`)
    : `<span class="text-green"><i class="fas fa-check-circle"></i> In Stock (Landhi Shop)</span>`;

  // Build specifications list
  const specsHtml = Object.entries(product.specifications || {}).map(([key, val]) => `
    <div class="spec-item">
      <strong>${escapeHtml(key)}:</strong>
      <span>${escapeHtml(val)}</span>
    </div>
  `).join("");

  content.innerHTML = `
    <div class="product-modal-grid">
      <!-- Left: Image Showcase -->
      <div class="product-modal-gallery">
        <img src="${imgSrc}" 
             alt="${escapeHtml(product.name)}" 
             class="product-modal-img" 
             onerror="this.onerror=null;this.src='Logo/99900opo9.png'">
      </div>

      <!-- Right: Detailed Info & Step Ordering -->
      <div class="product-modal-details">
        <span class="modal-brand-tag"><i class="fas fa-tag"></i> ${escapeHtml(product.brand)} • ${escapeHtml(product.category)}</span>
        <h2 class="modal-product-title">${escapeHtml(product.name)}</h2>

        <div class="modal-pricing-row">
          <div>
            <span class="modal-price-current">PKR ${Number(product.price).toLocaleString()}</span>
            ${savings > 0 ? `<del class="modal-price-original">PKR ${Number(retailPrice).toLocaleString()}</del>` : ""}
          </div>
          ${savings > 0 ? `<span class="modal-price-savings">Save PKR ${savings} (${savingsPct}% Off)</span>` : ""}
        </div>

        <p class="modal-product-desc">${escapeHtml(product.description || "")}</p>

        <!-- Specifications Breakdown -->
        <div class="modal-spec-list">
          <div class="spec-item">
            <strong>Packaging Unit:</strong>
            <span>${escapeHtml(product.unit)}</span>
          </div>
          <div class="spec-item">
            <strong>Stock Status:</strong>
            ${stockHtml}
          </div>
          ${specsHtml}
        </div>

        <!-- Quantity Selector with Live Calculation -->
        <div class="modal-qty-section">
          <div>
            <span class="modal-qty-label">Select Quantity:</span>
            <div class="qty-stepper" style="margin-top:0.4rem;">
              <button type="button" class="qty-btn" onclick="updateModalQty(-1)" aria-label="Decrease quantity">-</button>
              <input type="number" id="modalQtyInput" class="qty-input" value="1" min="1" max="999" inputmode="numeric" onchange="onModalQtyChange(this.value)" aria-label="Quantity">
              <button type="button" class="qty-btn" onclick="updateModalQty(1)" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <div class="modal-live-total">
            <small>Total Price:</small>
            <strong id="modalTotalPriceDisplay">PKR ${product.price.toLocaleString()}</strong>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="modal-action-row">
          <button type="button" class="btn btn-gold btn-block" onclick="addModalItemToCart()">
            <i class="fas fa-cart-plus"></i> Add to Cart & Continue Shopping
          </button>
          <button type="button" class="btn btn-whatsapp btn-block" onclick="orderModalItemWhatsApp()">
            <i class="fab fa-whatsapp"></i> Buy Now via WhatsApp (03421221630)
          </button>
        </div>
      </div>
    </div>
  `;

  backdrop.classList.add("active");
  backdrop.setAttribute("aria-hidden", "false");
  const dialog = backdrop.querySelector(".modal-dialog");
  if (dialog) dialog.scrollTop = 0;
  syncBodyScrollLock();
}

function syncBodyScrollLock() {
  const prodOpen = document.getElementById("productModalBackdrop")?.classList.contains("active");
  const checkOpen = document.getElementById("checkoutModalBackdrop")?.classList.contains("active");
  const authOpen = document.getElementById("adminAuthModalBackdrop")?.classList.contains("active");
  const pinOpen = document.getElementById("adminPinModalBackdrop")?.classList.contains("active");
  const adminOpen = document.getElementById("adminPanelBackdrop")?.classList.contains("active");
  const cartOpen = document.getElementById("cartDrawer")?.classList.contains("open");
  const logoOpen = document.getElementById("logoModalBackdrop")?.classList.contains("active");
  const teamOpen = document.getElementById("teamMemberModalBackdrop")?.classList.contains("active");
  document.body.style.overflow = (prodOpen || checkOpen || authOpen || pinOpen || adminOpen || cartOpen || logoOpen || teamOpen) ? "hidden" : "";
}

function launchWhatsApp(url) {
  const isMobile = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = url;
    return;
  }
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win || win.closed || typeof win.closed === "undefined") {
    window.location.href = url;
  }
}

function closeProductModal() {
  const backdrop = document.getElementById("productModalBackdrop");
  if (backdrop) {
    backdrop.classList.remove("active");
    backdrop.style.setProperty("display", "none", "important");
    backdrop.setAttribute("aria-hidden", "true");
    syncBodyScrollLock();
  }
}

function updateModalQty(change) {
  const input = document.getElementById("modalQtyInput");
  if (!input || !AppState.selectedProductForModal) return;

  let val = parseInt(input.value, 10) || 1;
  val = Math.max(1, Math.min(999, val + change));
  input.value = val;
  AppState.modalQuantity = val;

  const totalDisplay = document.getElementById("modalTotalPriceDisplay");
  if (totalDisplay) {
    const total = val * AppState.selectedProductForModal.price;
    totalDisplay.textContent = `PKR ${total.toLocaleString()}`;
  }
}

function onModalQtyChange(newVal) {
  let val = parseInt(newVal, 10) || 1;
  val = Math.max(1, Math.min(999, val));
  const input = document.getElementById("modalQtyInput");
  if (input) input.value = val;
  AppState.modalQuantity = val;

  const totalDisplay = document.getElementById("modalTotalPriceDisplay");
  if (totalDisplay && AppState.selectedProductForModal) {
    const total = val * AppState.selectedProductForModal.price;
    totalDisplay.textContent = `PKR ${total.toLocaleString()}`;
  }
}

function addModalItemToCart() {
  if (!AppState.selectedProductForModal) return;
  AppState.addToCart(AppState.selectedProductForModal.id, AppState.modalQuantity);
  closeProductModal();
}

function orderModalItemWhatsApp() {
  if (!AppState.selectedProductForModal) return;
  const p = AppState.selectedProductForModal;
  const qty = AppState.modalQuantity;
  const totalPrice = qty * p.price;

  const message = [
    `*Assalam-o-Alaikum Munir Shop!*`,
    `I would like to place an immediate order from your confectionery website:`,
    ``,
    `ðŸ¬ *Product:* ${p.name}`,
    `ðŸ“¦ *Pack:* ${p.unit}`,
    `ðŸ”¢ *Quantity:* ${qty}`,
    `ðŸ’° *Rate:* PKR ${p.price.toLocaleString()} each`,
    `ðŸ’µ *Subtotal:* PKR ${totalPrice.toLocaleString()}`,
    ``,
    `ðŸ“ *Shop Location:* Gul Ahmed, Landhi No. 22, Karachi`,
    `Please confirm stock availability and delivery timeline. Thank you!`
  ].join("\n");

  const url = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  launchWhatsApp(url);
}

// ==========================================================================
// 5. WhatsApp Direct Order Generator (Per Product)
// ==========================================================================
function orderSingleProductWhatsApp(productId) {
  const p = PRODUCTS_CATALOG.find(item => item.id === productId);
  if (!p) return;

  const qty = clampCardQty(productId);
  const total = qty * p.price;

  const message = [
    `*Assalam-o-Alaikum Munir Shop!*`,
    `I would like to order this item directly from your web store:`,
    ``,
    `ðŸ¬ *Product:* ${p.name}`,
    `ðŸ“¦ *Unit:* ${p.unit}`,
    `ðŸ”¢ *Quantity:* ${qty}`,
    `ðŸ’° *Wholesale Price:* PKR ${p.price.toLocaleString()}`,
    `ðŸ’µ *Total Amount:* PKR ${total.toLocaleString()}`,
    ``,
    `ðŸ“ *Delivery Destination:* Landhi / Karachi`,
    `Please confirm my order. Thank you!`
  ].join("\n");

  const url = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  launchWhatsApp(url);
}

// ==========================================================================
// 6. WhatsApp Checkout Modal & Full Multi-Item Cart Order
// ==========================================================================
function openCheckoutModal() {
  const checkoutBd = document.getElementById("checkoutModalBackdrop");
  if (checkoutBd) checkoutBd.style.setProperty("display", "flex", "important");
  if (AppState.cart.length === 0) {
    showToast("Your cart is empty! Add products before checking out.", "error");
    return;
  }

  // Close Drawer
  closeCartDrawer();

  const backdrop = document.getElementById("checkoutModalBackdrop");
  const preview = document.getElementById("modalItemsPreview");
  const countEl = document.getElementById("modalItemsCount");
  const totalEl = document.getElementById("modalTotalAmount");

  if (!backdrop) return;

  const totals = AppState.getCartTotals();
  if (countEl) countEl.textContent = totals.totalItems;
  if (totalEl) totalEl.textContent = `PKR ${totals.total.toLocaleString()}`;

  if (preview) {
    preview.innerHTML = AppState.cart.map(i => `
      <div style="display:flex; justify-content:space-between; gap:0.5rem;">
        <span>${i.quantity}x ${i.name.slice(0, 32)}...</span>
        <strong style="white-space:nowrap;">PKR ${(i.price * i.quantity).toLocaleString()}</strong>
      </div>
    `).join("");
  }

  backdrop.classList.add("active");
  backdrop.setAttribute("aria-hidden", "false");
  const dialog = backdrop.querySelector(".modal-dialog");
  if (dialog) dialog.scrollTop = 0;
  syncBodyScrollLock();
}

function closeCheckoutModal() {
  const backdrop = document.getElementById("checkoutModalBackdrop");
  if (backdrop) {
    backdrop.classList.remove("active");
    backdrop.style.setProperty("display", "none", "important");
    backdrop.setAttribute("aria-hidden", "true");
    syncBodyScrollLock();
  }
}

function handleCheckoutFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("customerName")?.value.trim() || "Customer";
  const phone = document.getElementById("customerPhone")?.value.trim() || "";
  const address = document.getElementById("deliveryArea")?.value.trim() || "Landhi, Karachi";
  const orderType = document.getElementById("orderType")?.value || "Home/Shop Delivery";
  const payment = document.getElementById("paymentPreference")?.value || "Cash on Delivery";
  const notes = document.getElementById("orderNotes")?.value.trim() || "None";

  const totals = AppState.getCartTotals();
  const orderId = "MC-" + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toLocaleString("en-PK", { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // Compile formatted WhatsApp order receipt
  const itemsText = AppState.cart.map((item, idx) => {
    return `${idx + 1}. *${item.name}*\n   Qty: ${item.quantity} x PKR ${item.price.toLocaleString()} = PKR ${(item.quantity * item.price).toLocaleString()}`;
  }).join("\n");

  const message = [
    `ðŸ›ï¸ *NEW ONLINE ORDER - MUNIR SHOP* ðŸ›ï¸`,
    `*Order ID:* #${orderId}`,
    `*Date:* ${now}`,
    `----------------------------------------`,
    `ðŸ‘¤ *Customer Name:* ${name}`,
    `ðŸ“ž *Phone / WhatsApp:* ${phone}`,
    `ðŸ“ *Delivery Area:* ${address}`,
    `ðŸšš *Preference:* ${orderType}`,
    `ðŸ’³ *Payment Method:* ${payment}`,
    `ðŸ“ *Special Notes:* ${notes}`,
    `----------------------------------------`,
    `ðŸ“¦ *ORDERED ITEMS:*`,
    itemsText,
    `----------------------------------------`,
    `ðŸ’µ *Subtotal:* PKR ${totals.subtotal.toLocaleString()}`,
    `ðŸ›µ *Delivery Charges:* ${totals.isFreeDelivery ? 'FREE (Special Offer)' : 'PKR ' + totals.deliveryFee}`,
    `ðŸ’° *TOTAL AMOUNT TO PAY:* PKR ${totals.total.toLocaleString()}`,
    `----------------------------------------`,
    `ðŸ“ *Shop Location:* Akhtar Muneer Confectionery Wholesaler, Bilal Colony, Gul Ahmed, Landhi No. 22, Karachi`,
    `Please confirm this order and dispatch time. Thank you!`
  ].join("\n");

  const url = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

  // Clear modal and close
  closeCheckoutModal();
  AppState.clearCart();

  showToast("Opening WhatsApp with your complete order...", "success");

  // Open WhatsApp synchronously inside the submit gesture so mobile browsers never block it
  launchWhatsApp(url);
}

// ==========================================================================
// 7. Cart Drawer Controls
// ==========================================================================
function openCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartDrawerBackdrop");
  if (drawer && backdrop) {
    drawer.style.setProperty("display", "flex", "important");
    backdrop.style.setProperty("display", "block", "important");
    drawer.classList.add("open");
    backdrop.classList.add("active");
    syncBodyScrollLock();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById("cartDrawer");
  const backdrop = document.getElementById("cartDrawerBackdrop");
  if (drawer && backdrop) {
    drawer.classList.remove("open");
    backdrop.classList.remove("active");
    drawer.style.setProperty("display", "none", "important");
    backdrop.style.setProperty("display", "none", "important");
    syncBodyScrollLock();
  }
}

// Quick WhatsApp Order with current cart items
function checkoutViaWhatsAppDirect() {
  if (AppState.cart.length === 0) {
    showToast("Your cart is empty!", "error");
    return;
  }
  openCheckoutModal();
}

// ==========================================================================
// 8. Filters & Search Helpers
// ==========================================================================
function filterByBrandQuick(brandName) {
  AppState.activeBrand = brandName;
  updateBrandPills();
  renderCatalog();
}

function updateBrandPills() {
  const pills = document.querySelectorAll(".brand-pill");
  pills.forEach(pill => {
    const brand = pill.getAttribute("data-brand");
    if (brand.toLowerCase() === AppState.activeBrand.toLowerCase()) {
      pill.classList.add("active");
    } else {
      pill.classList.remove("active");
    }
  });
}

function syncSearchInputs(value) {
  AppState.searchQuery = value;
  const liveSearch = document.getElementById("liveSearchInput");
  const mobileSearch = document.getElementById("mobileSearchInput");
  const catalogSearch = document.getElementById("catalogSearchInput");
  const clearSearch = document.getElementById("clearSearchBtn");
  const clearCatalogSearch = document.getElementById("clearCatalogSearchBtn");

  if (liveSearch && liveSearch.value !== value) liveSearch.value = value;
  if (mobileSearch && mobileSearch.value !== value) mobileSearch.value = value;
  if (catalogSearch && catalogSearch.value !== value) catalogSearch.value = value;

  const hasText = value.trim().length > 0;
  if (clearSearch) clearSearch.style.display = hasText ? "flex" : "none";
  if (clearCatalogSearch) clearCatalogSearch.style.display = hasText ? "flex" : "none";
}

function updateActiveFiltersBar() {
  const bar = document.getElementById("activeFiltersBar");
  const list = document.getElementById("activeTagsList");
  if (!bar || !list) return;

  const tags = [];

  if (AppState.activeBrand !== "all") {
    tags.push({ label: `Brand: ${AppState.activeBrand}`, clear: () => { AppState.activeBrand = "all"; updateBrandPills(); } });
  }

  if (AppState.activeCategory !== "all") {
    tags.push({ label: `Category: ${AppState.activeCategory}`, clear: () => { AppState.activeCategory = "all"; document.getElementById("categoryFilter").value = "all"; } });
  }

  if (AppState.searchQuery.trim() !== "") {
    tags.push({ label: `Search: "${AppState.searchQuery}"`, clear: () => { syncSearchInputs(""); } });
  }

  if (AppState.specialSaleOnly) {
    tags.push({ label: `Special Sales Only`, clear: () => { AppState.specialSaleOnly = false; document.getElementById("specialSaleOnly").checked = false; } });
  }

  if (tags.length === 0) {
    bar.style.display = "none";
    list.innerHTML = "";
    return;
  }

  bar.style.display = "flex";
  list.innerHTML = tags.map((t, index) => `
    <span class="active-tag">
      ${t.label}
      <button type="button" class="active-tag-remove" onclick="removeFilterTagByIndex(${index})" aria-label="Remove ${t.label}">&times;</button>
    </span>
  `).join("");

  window._activeFiltersList = tags;
}

window.removeFilterTagByIndex = function (index) {
  if (window._activeFiltersList && window._activeFiltersList[index]) {
    window._activeFiltersList[index].clear();
    renderCatalog();
  }
};

function resetAllFilters() {
  AppState.activeBrand = "all";
  AppState.activeCategory = "all";
  AppState.specialSaleOnly = false;
  AppState.sortBy = "featured";

  updateBrandPills();
  syncSearchInputs("");

  const catFilter = document.getElementById("categoryFilter");
  const saleOnly = document.getElementById("specialSaleOnly");
  const sortSel = document.getElementById("sortSelector");

  if (catFilter) catFilter.value = "all";
  if (saleOnly) saleOnly.checked = false;
  if (sortSel) sortSel.value = "featured";

  renderCatalog();
  showToast("All filters have been reset.", "info");
}

// ==========================================================================
// 9. Toast Notifications
// ==========================================================================
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;

  let icon = "fa-info-circle";
  if (type === "success") icon = "fa-check-circle text-green";
  if (type === "error") icon = "fa-exclamation-circle";

  toast.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================================================
// 10. Dynamic Storefront Taxonomy (Brands & Categories Sync)
// ==========================================================================
function renderStorefrontTaxonomy() {
  // 1. Render Brand Filter Pills
  const pillsList = document.getElementById("brandPillsList");
  if (pillsList) {
    if (AppState.activeBrand !== "all" && !AppState.brands.some(b => b.toLowerCase() === AppState.activeBrand.toLowerCase())) {
      AppState.activeBrand = "all";
    }
    const allActive = AppState.activeBrand === "all" ? "active" : "";
    const brandButtons = AppState.brands.map(brand => {
      const isActive = AppState.activeBrand.toLowerCase() === brand.toLowerCase() ? "active" : "";
      const display = brand === "LU" ? "LU Continental" : (brand === "Mix" ? "Mix / Khatta Meetha" : brand);
      return `<button type="button" class="brand-pill ${isActive}" data-brand="${escapeHtml(brand)}">${escapeHtml(display)}</button>`;
    }).join("");

    pillsList.innerHTML = `
      <button type="button" class="brand-pill ${allActive}" data-brand="all">All Brands <span class="pill-badge" id="badgeAll">${PRODUCTS_CATALOG.length}</span></button>
      ${brandButtons}
    `;

    pillsList.querySelectorAll(".brand-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        AppState.activeBrand = pill.getAttribute("data-brand");
        updateBrandPills();
        renderCatalog();
      });
    });
  }

  // 2. Render Category Dropdown
  const catFilter = document.getElementById("categoryFilter");
  if (catFilter) {
    if (AppState.activeCategory !== "all" && !AppState.categories.includes(AppState.activeCategory)) {
      AppState.activeCategory = "all";
    }
    catFilter.innerHTML = `<option value="all">All Categories</option>` +
      AppState.categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join("");
    catFilter.value = AppState.activeCategory;
  }
}

// ==========================================================================
// 11. Admin & Settings Panel Controller (PIN Protected + localStorage)
// ==========================================================================
const AdminController = window.AdminController = {
  isUnlocked: false,
  activeTab: "products",
  activeAuthTab: "login",
  pendingConfirm: null,
  uploadedImageDataUrl: "",
  isCompressingImage: false,

  // --- 1. Account & LocalStorage Persistence ---
  getStoredAccounts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.adminAccounts);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Could not read admin accounts from localStorage", e);
    }
    // Default master admin account if none exists
    return [
      {
        id: "admin_master_1",
        name: "Akhtar Munir",
        email: "admin@munir804.com",
        username: "admin",
        passwordHash: hashAdminPin(SHOP_CONFIG.defaultAdminPin),
        createdAt: "2003-01-01T00:00:00.000Z"
      }
    ];
  },

  saveAccounts(accounts) {
    try {
      localStorage.setItem(STORAGE_KEYS.adminAccounts, JSON.stringify(accounts));
      return true;
    } catch (e) {
      console.warn("Could not save admin accounts", e);
      return false;
    }
  },

  getActiveSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.adminSession);
      if (raw) {
        const session = JSON.parse(raw);
        if (session && session.email && session.name) return session;
      }
    } catch (e) {
      console.warn("Could not read admin session", e);
    }
    return null;
  },

  setActiveSession(user) {
    try {
      const session = {
        id: user.id || ("admin_" + Date.now()),
        name: user.name,
        email: user.email,
        signedInAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.adminSession, JSON.stringify(session));
      return session;
    } catch (e) {
      console.warn("Could not set admin session", e);
      return null;
    }
  },

  clearActiveSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.adminSession);
    } catch (e) {
      console.warn("Could not clear admin session", e);
    }
  },

  getLockoutState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.adminLockout);
      if (raw) {
        const state = JSON.parse(raw);
        if (state && typeof state.failedAttempts === "number") return state;
      }
    } catch (e) {
      console.warn("Could not read lockout state", e);
    }
    return { failedAttempts: 0, isLocked: false, lockoutReason: "", lockedAt: null };
  },

  saveLockoutState(state) {
    try {
      localStorage.setItem(STORAGE_KEYS.adminLockout, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save lockout state", e);
    }
  },

  resetLockout() {
    this.saveLockoutState({ failedAttempts: 0, isLocked: false, lockoutReason: "", lockedAt: null });
  },

  recordFailedAttempt(reason) {
    const state = this.getLockoutState();
    state.failedAttempts = (state.failedAttempts || 0) + 1;
    state.lastFailedAt = new Date().toISOString();
    state.lockoutReason = reason || "credential";
    if (state.failedAttempts >= 3) {
      state.isLocked = true;
      state.lockedAt = new Date().toISOString();
    }
    this.saveLockoutState(state);
    return state;
  },

  // --- 2. Sign In Operation ---
  signIn(emailOrUser, password) {
    const cleanInput = String(emailOrUser || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();
    const passHash = hashAdminPin(cleanPass);

    const lockoutState = this.getLockoutState();
    if (lockoutState.isLocked && lockoutState.failedAttempts >= 3) {
      return {
        success: false,
        locked: true,
        attempts: 3,
        message: "Security Lockout: 3 failed attempts reached. Admin access locked. Please try again."
      };
    }

    const accounts = this.getStoredAccounts();
    const account = accounts.find(a => 
      (a.email && a.email.toLowerCase() === cleanInput) ||
      (a.username && a.username.toLowerCase() === cleanInput) ||
      (a.name && a.name.toLowerCase() === cleanInput)
    );

    const defaultPinHash = hashAdminPin(SHOP_CONFIG.defaultAdminPin);
    const isMasterMatch = (!account && (cleanInput === "admin" || cleanInput === "admin@munir804.com" || cleanInput === "munir804") && passHash === defaultPinHash);

    if (!isMasterMatch && (!account || account.passwordHash !== passHash)) {
      const state = this.recordFailedAttempt("password");
      if (state.failedAttempts >= 3) {
        return {
          success: false,
          locked: true,
          attempts: state.failedAttempts,
          message: "Security Lockout: 3 failed password attempts. Access locked. Please try again."
        };
      }
      return {
        success: false,
        attempts: state.failedAttempts,
        message: `Invalid email or password. Attempt ${state.failedAttempts} of 3.`
      };
    }

    // Correct password
    const activeUser = account || {
      id: "admin_master_1",
      name: "Akhtar Munir",
      email: "admin@munir804.com"
    };
    this.resetLockout();
    this.setActiveSession(activeUser);
    return { success: true, user: activeUser };
  },

  signOut() {
    this.clearActiveSession();
    this.isUnlocked = false;
    this.closePinModal();
    this.closeDashboard();
    showToast("Signed out of admin session.", "info");
    this.openEntryPoint();
  },

  signOutSilent() {
    this.clearActiveSession();
    this.isUnlocked = false;
  },

  // --- 3. Secret Admin Code Verification (Step 2) ---
  getStoredPinHash() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.adminPin);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.hash) return parsed.hash;
      }
    } catch (e) {
      console.warn("Could not read admin PIN from localStorage", e);
    }
    return hashAdminPin(SHOP_CONFIG.defaultAdminPin);
  },

  verifyAdminCode(code) {
    const clean = String(code || "").trim();
    const isMatch = (hashAdminPin(clean) === this.getStoredPinHash()) || (clean === SHOP_CONFIG.defaultAdminPin);

    if (isMatch) {
      this.resetLockout();
      this.isUnlocked = true;
      return { success: true };
    }

    // Wrong code entered!
    const state = this.recordFailedAttempt("code");
    if (state.failedAttempts >= 3) {
      // 3-ATTEMPT LOCKOUT RULE:
      // Immediately lock admin access, clear active session, and force Sign In again
      this.signOutSilent();
      this.closePinModal();
      this.closeDashboard();
      this.openAuthModal("⚠️ Security Lockout: 3 failed code attempts detected. Active session cleared and admin access locked. Please Sign In again.");
      return {
        success: false,
        locked: true,
        attempts: 3,
        message: "Security Lockout: 3 failed code attempts. Session terminated."
      };
    }

    return {
      success: false,
      attempts: state.failedAttempts,
      message: `Incorrect secret admin code. Attempt ${state.failedAttempts} of 3.`
    };
  },

  verifyPin(pin) {
    return this.verifyAdminCode(pin).success;
  },

  saveNewPin(newPin) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      this.openEntryPoint();
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEYS.adminPin, JSON.stringify({
        hash: hashAdminPin(newPin),
        updatedAt: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.warn("Could not save admin PIN", e);
      return false;
    }
  },

  // --- 4. Navigation & Modals ---
  openEntryPoint() {
    const session = this.getActiveSession();
    if (!session) {
      this.openAuthModal();
      return;
    }
    if (this.isUnlocked) {
      this.openDashboard();
    } else {
      this.openPinModal();
    }
  },

  openAuthModal(lockoutMessage) {
    this.closePinModal();
    this.closeDashboard();

    const backdrop = document.getElementById("adminAuthModalBackdrop");
    if (!backdrop) return;

    const alertBox = document.getElementById("adminAuthAlert");
    if (alertBox) {
      if (lockoutMessage) {
        alertBox.textContent = lockoutMessage;
        alertBox.style.display = "block";
      } else {
        alertBox.style.display = "none";
        alertBox.textContent = "";
      }
    }

    const emailInput = document.getElementById("adminLoginEmail");
    const passInput = document.getElementById("adminLoginPassword");
    const errLogin = document.getElementById("adminLoginError");
    if (emailInput) emailInput.value = "";
    if (passInput) passInput.value = "";
    if (errLogin) {
      errLogin.style.display = "none";
      errLogin.textContent = "";
    }

    backdrop.classList.add("active");
    backdrop.setAttribute("aria-hidden", "false");
    syncBodyScrollLock();
    setTimeout(() => { if (emailInput) emailInput.focus(); }, 100);
  },

  closeAuthModal() {
    const backdrop = document.getElementById("adminAuthModalBackdrop");
    if (!backdrop) return;
    backdrop.classList.remove("active");
    backdrop.setAttribute("aria-hidden", "true");
    syncBodyScrollLock();
  },

  openPinModal() {
    const session = this.getActiveSession();
    if (!session) {
      this.openAuthModal();
      return;
    }

    this.closeAuthModal();
    const backdrop = document.getElementById("adminPinModalBackdrop");
    const input = document.getElementById("adminPinInput");
    const err = document.getElementById("adminPinError");
    const userDisplay = document.getElementById("adminSessionUserDisplay");
    const attemptsNotice = document.getElementById("adminPinAttemptsNotice");

    if (!backdrop) return;
    if (userDisplay) {
      userDisplay.textContent = session.name || session.email;
    }
    if (attemptsNotice) {
      const state = this.getLockoutState();
      const left = Math.max(0, 3 - (state.failedAttempts || 0));
      attemptsNotice.innerHTML = `<i class="fas fa-shield-alt text-gold"></i> 3-Attempt Rule: ${left} attempt(s) remaining before session lockout.`;
    }
    if (err) {
      err.style.display = "none";
      err.textContent = "";
    }
    if (input) {
      input.value = "";
      input.type = "password";
    }
    const visBtn = document.getElementById("toggleAdminPinVisBtn");
    if (visBtn) visBtn.innerHTML = '<i class="fas fa-eye"></i>';

    backdrop.classList.add("active");
    backdrop.setAttribute("aria-hidden", "false");
    syncBodyScrollLock();
    setTimeout(() => { if (input) input.focus(); }, 100);
  },

  closePinModal() {
    const backdrop = document.getElementById("adminPinModalBackdrop");
    if (!backdrop) return;
    backdrop.classList.remove("active");
    backdrop.setAttribute("aria-hidden", "true");
    syncBodyScrollLock();
  },

  openDashboard() {
    const session = this.getActiveSession();
    if (!session) {
      this.openAuthModal();
      return;
    }
    if (!this.isUnlocked) {
      this.openPinModal();
      return;
    }

    const backdrop = document.getElementById("adminPanelBackdrop");
    if (!backdrop) return;

    const topbarUser = document.getElementById("adminTopbarUserName");
    const settingsName = document.getElementById("settingsActiveUserName");
    const settingsEmail = document.getElementById("settingsActiveUserEmail");

    if (topbarUser) topbarUser.textContent = session.name;
    if (settingsName) settingsName.textContent = session.name;
    if (settingsEmail) settingsEmail.textContent = session.email;

    this.refreshDashboard();
    backdrop.classList.add("active");
    backdrop.setAttribute("aria-hidden", "false");
    const dialog = backdrop.querySelector(".modal-dialog");
    if (dialog) dialog.scrollTop = 0;
    syncBodyScrollLock();
  },

  closeDashboard() {
    const backdrop = document.getElementById("adminPanelBackdrop");
    if (!backdrop) return;
    backdrop.classList.remove("active");
    backdrop.setAttribute("aria-hidden", "true");
    syncBodyScrollLock();
  },

  lockPanel() {
    this.isUnlocked = false;
    this.closeDashboard();
    showToast("Admin controls locked. Code verification required.", "info");
  },

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll(".admin-tab-btn").forEach(btn => {
      const isMatch = btn.getAttribute("data-admin-tab") === tabName;
      btn.classList.toggle("active", isMatch);
      btn.setAttribute("aria-selected", String(isMatch));
    });

    const panes = {
      products: "adminTabProducts",
      editor: "adminTabEditor",
      taxonomy: "adminTabTaxonomy",
      settings: "adminTabSettings"
    };

    Object.entries(panes).forEach(([key, elId]) => {
      const el = document.getElementById(elId);
      if (el) el.classList.toggle("active", key === tabName);
    });

    if (tabName === "settings") {
      this.updateStorageMeter();
    }
  },

  refreshDashboard() {
    this.updateKPIs();
    this.populateSelectOptions();
    this.renderAdminProductsList();
    this.renderTaxonomyLists();
    this.updateStorageMeter();
  },

  updateKPIs() {
    const p = document.getElementById("adminKpiProducts");
    const b = document.getElementById("adminKpiBrands");
    const c = document.getElementById("adminKpiCategories");
    const d = document.getElementById("adminKpiDeals");
    if (p) p.textContent = PRODUCTS_CATALOG.length;
    if (b) b.textContent = AppState.brands.length;
    if (c) c.textContent = AppState.categories.length;
    if (d) d.textContent = PRODUCTS_CATALOG.filter(item => item.isSpecialSale).length;
  },

  populateSelectOptions() {
    const brandFilter = document.getElementById("adminProductBrandFilter");
    const prodBrand = document.getElementById("adminProdBrand");
    const prodCat = document.getElementById("adminProdCategory");

    if (brandFilter) {
      const current = brandFilter.value || "all";
      brandFilter.innerHTML = `<option value="all">All Companies</option>` +
        AppState.brands.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join("");
      brandFilter.value = AppState.brands.includes(current) ? current : "all";
    }

    if (prodBrand) {
      const current = prodBrand.value;
      prodBrand.innerHTML = AppState.brands.map(b => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join("");
      if (current && AppState.brands.includes(current)) prodBrand.value = current;
    }

    if (prodCat) {
      const current = prodCat.value;
      prodCat.innerHTML = AppState.categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
      if (current && AppState.categories.includes(current)) prodCat.value = current;
    }
  },

  renderAdminProductsList() {
    const container = document.getElementById("adminProductsList");
    if (!container) return;

    const query = (document.getElementById("adminProductSearch")?.value || "").trim().toLowerCase();
    const brandVal = document.getElementById("adminProductBrandFilter")?.value || "all";

    const list = PRODUCTS_CATALOG.filter(p => {
      if (brandVal !== "all" && p.brand.toLowerCase() !== brandVal.toLowerCase()) return false;
      if (query) {
        const hay = `${p.name} ${p.brand} ${p.category} ${p.unit}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });

    if (list.length === 0) {
      container.innerHTML = `
        <div class="admin-empty-list">
          <i class="fas fa-box-open"></i>
          <p>No products match your search. Click "New Product" to add one.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(p => {
      const imgSrc = p.image && p.image.startsWith("data:") ? p.image : encodeURI(p.image || SHOP_CONFIG.defaultImage);
      const stockLabel = typeof p.stockQty === "number" ? `Stock: ${p.stockQty}` : "Stock: 50+";
      return `
        <div class="admin-product-row" data-id="${escapeHtml(p.id)}">
          <img src="${imgSrc}" alt="${escapeHtml(p.name)}" class="admin-row-thumb" onerror="this.onerror=null;this.src='Logo/99900opo9.png'">
          <div class="admin-row-info">
            <h5>${escapeHtml(p.name)}</h5>
            <div class="admin-row-meta">
              <span class="admin-meta-pill">${escapeHtml(p.brand)}</span>
              <span class="admin-meta-pill">${escapeHtml(p.category)}</span>
              <span>${escapeHtml(p.unit)}</span>
              <span class="admin-stock-pill">${stockLabel}</span>
            </div>
          </div>
          <div class="admin-row-price">
            <strong>PKR ${Number(p.price).toLocaleString()}</strong>
            ${p.retailPrice > p.price ? `<small><del>PKR ${Number(p.retailPrice).toLocaleString()}</del></small>` : ""}
          </div>
          <div class="admin-row-actions">
            <button type="button" class="btn-admin-edit" onclick="AdminController.startEditProduct('${escapeHtml(p.id)}')" title="Edit product">
              <i class="fas fa-edit"></i> <span>Edit</span>
            </button>
            <button type="button" class="btn-admin-delete" onclick="AdminController.handleDeleteProductClick(this, '${escapeHtml(p.id)}')" title="Delete product">
              <i class="fas fa-trash-alt"></i> <span>Delete</span>
            </button>
          </div>
        </div>
      `;
    }).join("");
  },

  startNewProduct() {
    if (!this.getActiveSession() || !this.isUnlocked) {
      showToast("Admin authorization required.", "error");
      this.openEntryPoint();
      return;
    }
    this.resetProductForm();
    this.switchTab("editor");
  },

  setUploadStatus(text, isAttached = false) {
    const statusEl = document.getElementById("adminUploadStatus");
    const clearBtn = document.getElementById("adminClearUploadedImgBtn");
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.classList.toggle("attached", isAttached);
    }
    if (clearBtn) {
      clearBtn.style.display = isAttached ? "inline-flex" : "none";
    }
  },

  resetProductForm() {
    const form = document.getElementById("adminProductForm");
    if (form) form.reset();
    this.uploadedImageDataUrl = "";
    this.isCompressingImage = false;
    const idInput = document.getElementById("adminEditProductId");
    const stockInput = document.getElementById("adminProdStock");
    const urlInput = document.getElementById("adminProdImageUrl");
    const fileInput = document.getElementById("adminProdImageFile");
    const preview = document.getElementById("adminProdImagePreview");
    const heading = document.getElementById("adminEditorHeading");
    const tabLabel = document.getElementById("adminEditorTabLabel");
    const cancelBtn = document.getElementById("adminCancelEditBtn");
    const saveBtn = document.getElementById("adminSaveProductBtn");

    if (idInput) idInput.value = "";
    if (stockInput) stockInput.value = "50";
    if (urlInput) urlInput.value = "";
    if (fileInput) fileInput.value = "";
    if (preview) preview.src = encodeURI(SHOP_CONFIG.defaultImage);
    this.setUploadStatus("Choose a photo from your device â€” automatically optimized & saved with the product.", false);
    if (heading) heading.innerHTML = '<i class="fas fa-plus-circle text-gold"></i> Add New Confectionery Product';
    if (tabLabel) tabLabel.textContent = "Add Product";
    if (cancelBtn) cancelBtn.style.display = "none";
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Product to Store';
    }
  },

  startEditProduct(productId) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      showToast("Admin authorization required to edit products.", "error");
      this.openEntryPoint();
      return;
    }
    const product = PRODUCTS_CATALOG.find(p => p.id === productId);
    if (!product) return;

    this.populateSelectOptions();
    this.isCompressingImage = false;

    const isDataImg = Boolean(product.image && product.image.startsWith("data:"));
    this.uploadedImageDataUrl = isDataImg ? product.image : "";

    document.getElementById("adminEditProductId").value = product.id;
    document.getElementById("adminProdName").value = product.name || "";
    document.getElementById("adminProdBrand").value = AppState.brands.includes(product.brand) ? product.brand : (AppState.brands[0] || "");
    document.getElementById("adminProdCategory").value = AppState.categories.includes(product.category) ? product.category : (AppState.categories[0] || "");
    document.getElementById("adminProdUnit").value = product.unit || "";
    document.getElementById("adminProdPrice").value = product.price || 0;
    document.getElementById("adminProdRetailPrice").value = product.retailPrice || "";
    document.getElementById("adminProdStock").value = typeof product.stockQty === "number" ? product.stockQty : 50;
    document.getElementById("adminProdBadge").value = product.badge || "";
    document.getElementById("adminProdSpecialSale").checked = Boolean(product.isSpecialSale);
    document.getElementById("adminProdDesc").value = product.description || "";
    document.getElementById("adminProdImageUrl").value = isDataImg ? "" : (product.image || "");
    document.getElementById("adminProdImageFile").value = "";

    if (isDataImg) {
      const kb = Math.round((product.image.length * 0.75) / 1024);
      this.setUploadStatus(`Saved custom photo attached (~${kb} KB). Upload a new file to replace it.`, true);
    } else {
      this.setUploadStatus("Choose a photo from your device â€” automatically optimized & saved with the product.", false);
    }

    const preview = document.getElementById("adminProdImagePreview");
    if (preview) {
      preview.src = isDataImg ? product.image : encodeURI(product.image || SHOP_CONFIG.defaultImage);
    }

    const heading = document.getElementById("adminEditorHeading");
    const tabLabel = document.getElementById("adminEditorTabLabel");
    const cancelBtn = document.getElementById("adminCancelEditBtn");
    const saveBtn = document.getElementById("adminSaveProductBtn");

    if (heading) heading.innerHTML = `<i class="fas fa-edit text-gold"></i> Edit Product: ${escapeHtml(product.name.slice(0, 36))}`;
    if (tabLabel) tabLabel.textContent = "Edit Product";
    if (cancelBtn) cancelBtn.style.display = "inline-flex";
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="fas fa-check"></i> Update Product Changes';
    }

    this.switchTab("editor");
  },

  handleSaveProductForm(e) {
    e.preventDefault();
    if (!this.getActiveSession() || !this.isUnlocked) {
      showToast("Admin authorization required to save product changes.", "error");
      this.openEntryPoint();
      return;
    }
    if (this.isCompressingImage) {
      showToast("Please wait a moment while your image finishes processing.", "info");
      return;
    }

    const editId = document.getElementById("adminEditProductId").value.trim();
    const name = document.getElementById("adminProdName").value.trim();
    const brand = document.getElementById("adminProdBrand").value.trim();
    const category = document.getElementById("adminProdCategory").value.trim();
    const unit = document.getElementById("adminProdUnit").value.trim() || "Standard Pack";
    const price = Math.max(1, parseInt(document.getElementById("adminProdPrice").value, 10) || 0);
    const retailRaw = parseInt(document.getElementById("adminProdRetailPrice").value, 10);
    const retailPrice = (!isNaN(retailRaw) && retailRaw > price) ? retailRaw : price;
    const stockRaw = parseInt(document.getElementById("adminProdStock").value, 10);
    const stockQty = isNaN(stockRaw) ? 50 : Math.max(0, stockRaw);
    const badge = document.getElementById("adminProdBadge").value.trim();
    const isSpecialSale = document.getElementById("adminProdSpecialSale").checked;
    const description = document.getElementById("adminProdDesc").value.trim() || `${name} supplied fresh by Munir Shop (Landhi No. 22, Karachi).`;
    const imageInput = document.getElementById("adminProdImageUrl").value.trim();
    const image = this.uploadedImageDataUrl || imageInput || SHOP_CONFIG.defaultImage;

    if (!name || !brand || !category) {
      showToast("Please fill in Product Name, Company, and Category.", "error");
      return;
    }

    if (editId) {
      const idx = PRODUCTS_CATALOG.findIndex(p => p.id === editId);
      if (idx > -1) {
        PRODUCTS_CATALOG[idx] = {
          ...PRODUCTS_CATALOG[idx],
          name,
          brand,
          category,
          unit,
          price,
          retailPrice,
          stockQty,
          badge: badge || PRODUCTS_CATALOG[idx].badge || "Wholesale Rate",
          isSpecialSale,
          description,
          image
        };
      }
    } else {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "item";
      const newProduct = {
        id: `custom-${slug}-${Date.now().toString(36)}`,
        name,
        brand,
        category,
        price,
        retailPrice,
        unit,
        stockQty,
        image,
        isSpecialSale,
        rating: 4.9,
        badge: badge || "New Arrival",
        description,
        specifications: {
          "Packaging Unit": unit,
          "Company / Brand": brand,
          "Stock Quantity": `${stockQty} units`
        }
      };
      PRODUCTS_CATALOG.unshift(newProduct);
    }

    if (!AppState.saveStoreProducts()) return;

    AppState.syncCartWithCatalog();
    renderStorefrontTaxonomy();
    renderCatalog();
    this.resetProductForm();
    this.refreshDashboard();
    this.switchTab("products");
    showToast(editId ? `Updated "${name.slice(0, 28)}"!` : `Added "${name.slice(0, 28)}" to Munir Shop!`, "success");
  },

  handleDeleteProductClick(btn, productId) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      showToast("Admin authorization required to delete products.", "error");
      this.openEntryPoint();
      return;
    }
    if (btn.getAttribute("data-confirm") !== "true") {
      btn.setAttribute("data-confirm", "true");
      btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <span>Sure?</span>';
      btn.classList.add("confirming");
      setTimeout(() => {
        if (document.body.contains(btn) && btn.getAttribute("data-confirm") === "true") {
          btn.removeAttribute("data-confirm");
          btn.innerHTML = '<i class="fas fa-trash-alt"></i> <span>Delete</span>';
          btn.classList.remove("confirming");
        }
      }, 3500);
      return;
    }

    const target = PRODUCTS_CATALOG.find(p => p.id === productId);
    PRODUCTS_CATALOG = PRODUCTS_CATALOG.filter(p => p.id !== productId);
    AppState.saveStoreProducts();
    AppState.syncCartWithCatalog();
    renderStorefrontTaxonomy();
    renderCatalog();
    this.refreshDashboard();
    showToast(`Deleted "${target ? target.name.slice(0, 24) : "product"}" from store.`, "info");
  },

  compressImageFile(file, callback, onError) {
    if (!file.type || !file.type.startsWith("image/")) {
      showToast("Please select a valid image file (JPG, PNG, WEBP).", "error");
      if (onError) onError();
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 520;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#0f0b08";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        let compressedDataUrl = "";
        if (file.type === "image/png" || file.type === "image/webp") {
          const webpUrl = canvas.toDataURL("image/webp", 0.8);
          if (webpUrl.startsWith("data:image/webp")) {
            compressedDataUrl = webpUrl;
          }
        }
        if (!compressedDataUrl) {
          compressedDataUrl = canvas.toDataURL("image/jpeg", 0.78);
        }
        callback(compressedDataUrl);
      };
      img.onerror = () => {
        showToast("Could not read that image file.", "error");
        if (onError) onError();
      };
      img.src = ev.target.result;
    };
    reader.onerror = () => {
      showToast("Failed to load image file.", "error");
      if (onError) onError();
    };
    reader.readAsDataURL(file);
  },

  renderTaxonomyLists() {
    const brandsContainer = document.getElementById("adminBrandsList");
    const catsContainer = document.getElementById("adminCategoriesList");

    if (brandsContainer) {
      brandsContainer.innerHTML = AppState.brands.map((brand, idx) => {
        const count = PRODUCTS_CATALOG.filter(p => p.brand.toLowerCase() === brand.toLowerCase()).length;
        return `
          <div class="admin-taxonomy-item">
            <div class="taxonomy-item-label">
              <strong>${escapeHtml(brand)}</strong>
              <small>${count} product${count === 1 ? "" : "s"}</small>
            </div>
            <div class="taxonomy-item-actions">
              <button type="button" class="btn-tax-action" onclick="AdminController.renameBrand(${idx})" title="Rename company">
                <i class="fas fa-pen"></i>
              </button>
              <button type="button" class="btn-tax-action danger" onclick="AdminController.deleteBrand(this, ${idx})" title="Remove company">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }

    if (catsContainer) {
      catsContainer.innerHTML = AppState.categories.map((cat, idx) => {
        const count = PRODUCTS_CATALOG.filter(p => p.category === cat).length;
        return `
          <div class="admin-taxonomy-item">
            <div class="taxonomy-item-label">
              <strong>${escapeHtml(cat)}</strong>
              <small>${count} product${count === 1 ? "" : "s"}</small>
            </div>
            <div class="taxonomy-item-actions">
              <button type="button" class="btn-tax-action" onclick="AdminController.renameCategory(${idx})" title="Rename category">
                <i class="fas fa-pen"></i>
              </button>
              <button type="button" class="btn-tax-action danger" onclick="AdminController.deleteCategory(this, ${idx})" title="Remove category">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </div>
        `;
      }).join("");
    }
  },

  addBrand(name) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      this.openEntryPoint();
      return;
    }
    const clean = name.trim();
    if (!clean) return;
    if (AppState.brands.some(b => b.toLowerCase() === clean.toLowerCase())) {
      showToast(`Company "${clean}" already exists.`, "error");
      return;
    }
    AppState.brands.push(clean);
    AppState.saveStoreBrands();
    renderStorefrontTaxonomy();
    this.refreshDashboard();
    showToast(`Added company "${clean}".`, "success");
  },

  renameBrand(index) {
    const oldName = AppState.brands[index];
    if (!oldName) return;
    const itemEls = document.querySelectorAll("#adminBrandsList .admin-taxonomy-item");
    const row = itemEls[index];
    if (!row) return;
    const labelDiv = row.querySelector(".taxonomy-item-label");
    if (!labelDiv || row.querySelector(".inline-rename-input")) return;

    labelDiv.innerHTML = `
      <form class="inline-rename-form" onsubmit="event.preventDefault(); AdminController.commitRenameBrand(${index}, this.querySelector('input').value)">
        <input type="text" class="inline-rename-input" value="${escapeHtml(oldName)}" required>
        <button type="submit" class="btn btn-gold-sm">Save</button>
      </form>
    `;
    const input = labelDiv.querySelector("input");
    if (input) input.focus();
  },

  commitRenameBrand(index, newName) {
    const oldName = AppState.brands[index];
    const clean = newName.trim();
    if (!clean || clean === oldName) {
      this.renderTaxonomyLists();
      return;
    }
    if (AppState.brands.some((b, i) => i !== index && b.toLowerCase() === clean.toLowerCase())) {
      showToast(`Company "${clean}" already exists.`, "error");
      return;
    }
    AppState.brands[index] = clean;
    PRODUCTS_CATALOG.forEach(p => {
      if (p.brand.toLowerCase() === oldName.toLowerCase()) p.brand = clean;
    });
    if (AppState.activeBrand.toLowerCase() === oldName.toLowerCase()) {
      AppState.activeBrand = clean;
    }
    AppState.saveStoreBrands();
    AppState.saveStoreProducts();
    renderStorefrontTaxonomy();
    renderCatalog();
    this.refreshDashboard();
    showToast(`Renamed "${oldName}" to "${clean}".`, "success");
  },

  deleteBrand(btn, index) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      this.openEntryPoint();
      return;
    }
    if (AppState.brands.length <= 1) {
      showToast("At least one company/brand must remain.", "error");
      return;
    }
    if (btn.getAttribute("data-confirm") !== "true") {
      btn.setAttribute("data-confirm", "true");
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        if (document.body.contains(btn) && btn.getAttribute("data-confirm") === "true") {
          btn.removeAttribute("data-confirm");
          btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        }
      }, 3000);
      return;
    }
    const removed = AppState.brands.splice(index, 1)[0];
    AppState.saveStoreBrands();
    if (AppState.activeBrand.toLowerCase() === removed.toLowerCase()) {
      AppState.activeBrand = "all";
    }
    renderStorefrontTaxonomy();
    renderCatalog();
    this.refreshDashboard();
    showToast(`Removed company "${removed}".`, "info");
  },

  addCategory(name) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      this.openEntryPoint();
      return;
    }
    const clean = name.trim();
    if (!clean) return;
    if (AppState.categories.some(c => c.toLowerCase() === clean.toLowerCase())) {
      showToast(`Category "${clean}" already exists.`, "error");
      return;
    }
    AppState.categories.push(clean);
    AppState.saveStoreCategories();
    renderStorefrontTaxonomy();
    this.refreshDashboard();
    showToast(`Added category "${clean}".`, "success");
  },

  renameCategory(index) {
    const oldName = AppState.categories[index];
    if (!oldName) return;
    const itemEls = document.querySelectorAll("#adminCategoriesList .admin-taxonomy-item");
    const row = itemEls[index];
    if (!row) return;
    const labelDiv = row.querySelector(".taxonomy-item-label");
    if (!labelDiv || row.querySelector(".inline-rename-input")) return;

    labelDiv.innerHTML = `
      <form class="inline-rename-form" onsubmit="event.preventDefault(); AdminController.commitRenameCategory(${index}, this.querySelector('input').value)">
        <input type="text" class="inline-rename-input" value="${escapeHtml(oldName)}" required>
        <button type="submit" class="btn btn-gold-sm">Save</button>
      </form>
    `;
    const input = labelDiv.querySelector("input");
    if (input) input.focus();
  },

  commitRenameCategory(index, newName) {
    const oldName = AppState.categories[index];
    const clean = newName.trim();
    if (!clean || clean === oldName) {
      this.renderTaxonomyLists();
      return;
    }
    if (AppState.categories.some((c, i) => i !== index && c.toLowerCase() === clean.toLowerCase())) {
      showToast(`Category "${clean}" already exists.`, "error");
      return;
    }
    AppState.categories[index] = clean;
    PRODUCTS_CATALOG.forEach(p => {
      if (p.category === oldName) p.category = clean;
    });
    if (AppState.activeCategory === oldName) {
      AppState.activeCategory = clean;
    }
    AppState.saveStoreCategories();
    AppState.saveStoreProducts();
    renderStorefrontTaxonomy();
    renderCatalog();
    this.refreshDashboard();
    showToast(`Renamed "${oldName}" to "${clean}".`, "success");
  },

  deleteCategory(btn, index) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      this.openEntryPoint();
      return;
    }
    if (AppState.categories.length <= 1) {
      showToast("At least one category must remain.", "error");
      return;
    }
    if (btn.getAttribute("data-confirm") !== "true") {
      btn.setAttribute("data-confirm", "true");
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => {
        if (document.body.contains(btn) && btn.getAttribute("data-confirm") === "true") {
          btn.removeAttribute("data-confirm");
          btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        }
      }, 3000);
      return;
    }
    const removed = AppState.categories.splice(index, 1)[0];
    AppState.saveStoreCategories();
    if (AppState.activeCategory === removed) {
      AppState.activeCategory = "all";
    }
    renderStorefrontTaxonomy();
    renderCatalog();
    this.refreshDashboard();
    showToast(`Removed category "${removed}".`, "info");
  },

  updateStorageMeter() {
    const meter = document.getElementById("adminStorageUsageText");
    if (!meter) return;
    try {
      let bytes = 0;
      Object.values(STORAGE_KEYS).forEach(k => {
        const val = localStorage.getItem(k);
        if (val) bytes += val.length * 2;
      });
      const kb = (bytes / 1024).toFixed(1);
      meter.textContent = `${kb} KB / ~5,120 KB`;
    } catch (e) {
      meter.textContent = "Unavailable";
    }
  },

  exportBackupJson() {
    if (!this.getActiveSession() || !this.isUnlocked) {
      this.openEntryPoint();
      return;
    }
    const payload = {
      store: "Munir Shop",
      domain: "munir804.com",
      exportedAt: new Date().toISOString(),
      brands: AppState.brands,
      categories: AppState.categories,
      products: PRODUCTS_CATALOG
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `munir-shop-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("Store backup JSON downloaded!", "success");
  },

  importBackupJson(file) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      this.openEntryPoint();
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data || !Array.isArray(data.products)) {
          showToast("Invalid Munir Shop backup file.", "error");
          return;
        }
        PRODUCTS_CATALOG = data.products;
        if (Array.isArray(data.brands) && data.brands.length) AppState.brands = data.brands;
        if (Array.isArray(data.categories) && data.categories.length) AppState.categories = data.categories;

        AppState.saveStoreProducts();
        AppState.saveStoreBrands();
        AppState.saveStoreCategories();
        AppState.syncCartWithCatalog();
        renderStorefrontTaxonomy();
        renderCatalog();
        this.refreshDashboard();
        showToast(`Imported ${PRODUCTS_CATALOG.length} products successfully!`, "success");
      } catch (err) {
        showToast("Could not parse backup JSON file.", "error");
      }
    };
    reader.readAsText(file);
  },

  handleResetCatalogClick(btn) {
    if (!this.getActiveSession() || !this.isUnlocked) {
      this.openEntryPoint();
      return;
    }
    if (btn.getAttribute("data-confirm") !== "true") {
      btn.setAttribute("data-confirm", "true");
      btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Tap Again to Confirm Factory Reset';
      setTimeout(() => {
        if (document.body.contains(btn) && btn.getAttribute("data-confirm") === "true") {
          btn.removeAttribute("data-confirm");
          btn.innerHTML = '<i class="fas fa-undo-alt"></i> Reset Catalog to Factory Defaults';
        }
      }, 4000);
      return;
    }

    PRODUCTS_CATALOG = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS_CATALOG));
    AppState.brands = [...DEFAULT_BRANDS];
    AppState.categories = [...DEFAULT_CATEGORIES];
    AppState.activeBrand = "all";
    AppState.activeCategory = "all";

    AppState.saveStoreProducts();
    AppState.saveStoreBrands();
    AppState.saveStoreCategories();
    AppState.syncCartWithCatalog();

    renderStorefrontTaxonomy();
    renderCatalog();
    this.resetProductForm();
    this.refreshDashboard();
    btn.removeAttribute("data-confirm");
    btn.innerHTML = '<i class="fas fa-undo-alt"></i> Reset Catalog to Factory Defaults';
    showToast("Storefront catalog restored to factory defaults.", "info");
  }
};



// ==========================================================================
// 17. 3D Rotating Shop Picture Ring Controller (Shop PIC Folder Exclusive)
// ==========================================================================
const Shop3DRingController = {
  items: [
    {
      id: 0,
      file: "Shop PIC/1.jpg",
      title: "Munir Shop Main Entrance & Storefront Counter",
      tag: "Main Storefront • Landhi 22",
      desc: "Primary customer service counter and wholesale distribution hub in Gul Ahmed, Bilal Colony, Landhi No. 22, Karachi."
    },
    {
      id: 1,
      file: "Shop PIC/0009999.jpeg",
      title: "Candy, Toffees & Bubble Gum Display Racks",
      tag: "Confectionery Aisle",
      desc: "Packed showcase of Pakistan's favorite toffees, chew bars, fruit candies, and bubble gums from Candyland, Hilal, and local Karachi confectioners."
    },
    {
      id: 2,
      file: "Shop PIC/00667.jpeg",
      title: "Wholesale Biscuit Boxes & Family Packs",
      tag: "Biscuits & Bakery",
      desc: "Complete stock of Bisconni, Peak Freans, and LU cookies, cream biscuits, and bulk display boxes for Karachi marts and retailers."
    },
    {
      id: 3,
      file: "Shop PIC/11232111.jpeg",
      title: "Premium Chocolates & Sweet Bars Section",
      tag: "Chocolates & Wafers",
      desc: "Sonnet, Chocolatto, Paradise, Now, and chocolate wafer bars maintained in optimal store shelving."
    },
    {
      id: 4,
      file: "Shop PIC/400908.jpeg",
      title: "Bulk Wholesale Cartons & Warehouse Stock",
      tag: "Warehouse Bulk Stacks",
      desc: "Factory-sealed master cartons ready for swift dispatch to Karachi retail shopkeepers, school canteens, and bulk distributors."
    },
    {
      id: 5,
      file: "Shop PIC/4508.jpeg",
      title: "Pakistani Khatta Meetha & Traditional Candies",
      tag: "Traditional Confectionery",
      desc: "Imli, Aloocha, Choran Chatni, mango bites, and classic sweet-and-tangy Pakistani confectionery."
    },
    {
      id: 6,
      file: "Shop PIC/90909.jpeg",
      title: "Retail Packaging & Rapid WhatsApp Desk",
      tag: "Packaging & Service Desk",
      desc: "Dedicated packing and billing station for rapid WhatsApp order verification (03421221630) and local Landhi pickups."
    },
    {
      id: 7,
      file: "Shop PIC/Screenshot 2026-10-18 093725.png",
      title: "Wholesale Inventory & Shelving Overview",
      tag: "Inventory Overview",
      desc: "Floor-to-ceiling organized rack system ensuring immediate availability across 50+ confectionery brands."
    },
    {
      id: 8,
      file: "Shop PIC/Screenshot 2026-10-18 093909.png",
      title: "Storefront Street View & Delivery Access",
      tag: "Storefront Street Access",
      desc: "Direct streetfront location in Gul Ahmed, Landhi No. 22 for vehicle loading and swift wholesale distribution across Karachi."
    }
  ],

  stage: null,
  track: null,
  shadow: null,
  closeBtn: null,
  detailPanel: null,
  dotsContainer: null,
  activeNumEl: null,
  labelEl: null,
  actionLabelEl: null,

  pieceEls: [],
  dotEls: [],

  N: 9,
  STEP: (2 * Math.PI) / 9,
  TILT: 8.5, // degrees
  DROP: 95,
  S0: 0.98,
  OMEGA: ((2 * Math.PI) / 9) / 4.2, // ~1 slot per 4.2s

  base: 0,
  flingVelocity: 0,
  autoTurnWeight: 1,
  isDragging: false,
  dragStartX: 0,
  lastPointerX: 0,
  lastPointerTime: 0,
  smoothedVelocity: 0,
  dragDistance: 0,

  isDetailOpen: false,
  detailProgress: 0, // 0 -> 1
  detailTargetIdx: 0,
  detailAnimStartTime: 0,
  detailAnimDuration: 560,
  detailAnimDirection: 0, // 1 for opening, -1 for closing

  activeFrontIdx: 0,
  lastFrontIdx: -1,
  rafId: null,
  lastFrameTime: performance.now(),

  init() {
    this.stage = document.getElementById("shopRingStage");
    this.track = document.getElementById("shopRingTrack");
    this.shadow = document.getElementById("shopRingShadow");
    this.closeBtn = document.getElementById("shopRingCloseBtn");
    this.detailPanel = document.getElementById("shopRingDetailPanel");
    this.dotsContainer = document.getElementById("shopRingDots");
    this.activeNumEl = document.getElementById("shopRingActiveNum");
    this.labelEl = document.getElementById("shopRingLabel");
    this.actionLabelEl = document.getElementById("shopRingActionLabel");

    if (!this.stage || !this.track) return;

    this.renderPieces();
    this.renderDots();
    this.bindEvents();

    this.lastFrameTime = performance.now();
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  },

  renderPieces() {
    this.track.innerHTML = "";
    this.pieceEls = [];

    this.items.forEach((item, idx) => {
      const el = document.createElement("div");
      el.className = "shop-ring-item";
      el.dataset.idx = idx;
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-label", item.title);

      el.innerHTML = `
        <div class="shop-ring-card">
          <div class="shop-ring-img-box">
            <img src="${encodeURI(item.file)}" alt="${item.title}" class="shop-ring-img" loading="lazy">
            <div class="shop-ring-glare"></div>
          </div>
          <div class="shop-ring-badge-bar">
            <span class="ring-badge-tag"><i class="fas fa-store"></i> ${item.tag}</span>
          </div>
        </div>
      `;

      el.addEventListener("mouseenter", () => {
        if (!this.isDetailOpen) {
          this.setIndexNumber(idx);
          if (this.labelEl) {
            this.labelEl.innerHTML = `${item.tag.split("•")[0].trim().toUpperCase()}<br>COLLECTION`;
          }
        }
      });

      el.addEventListener("mouseleave", () => {
        if (!this.isDetailOpen) {
          this.setIndexNumber(this.activeFrontIdx);
          if (this.labelEl) {
            const frontItem = this.items[this.activeFrontIdx] || this.items[0];
            this.labelEl.innerHTML = `${frontItem.tag.split("•")[0].trim().toUpperCase()}<br>COLLECTION`;
          }
        }
      });

      el.addEventListener("click", (e) => {
        if (this.dragDistance > 8) return;
        this.openDetail(idx);
      });

      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.openDetail(idx);
        }
      });

      this.track.appendChild(el);
      this.pieceEls.push(el);
    });
  },

  renderDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = "";
    this.dotEls = [];

    for (let i = 0; i < this.items.length; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `shop-ring-dot ${i === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Show photo ${i + 1}`);
      dot.addEventListener("click", () => this.rotateToPiece(i));
      this.dotsContainer.appendChild(dot);
      this.dotEls.push(dot);
    }
  },

  rotateToPiece(idx) {
    if (this.isDetailOpen) this.closeDetail();
    const targetBase = -idx * this.STEP;
    let diff = (targetBase - this.base) % (2 * Math.PI);
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    this.flingVelocity = diff * 0.08;
    this.autoTurnWeight = 0;
  },

  bindEvents() {
    // Drag & Fling with pointer events
    this.stage.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || this.isDetailOpen) return;
      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.lastPointerX = e.clientX;
      this.lastPointerTime = performance.now();
      this.smoothedVelocity = 0;
      this.dragDistance = 0;
      this.flingVelocity = 0;
      this.stage.classList.add("dragging");
      try { this.stage.setPointerCapture(e.pointerId); } catch(err) {}
    });

    window.addEventListener("pointermove", (e) => {
      if (!this.isDragging) return;
      const now = performance.now();
      const dt = Math.max((now - this.lastPointerTime) / 1000, 0.001);
      const dx = e.clientX - this.lastPointerX;
      this.dragDistance += Math.abs(dx);

      const R = Math.min(this.stage.clientWidth * 0.38, 430);
      const dTheta = dx / R;
      this.base += dTheta;

      const instantVel = (dTheta / dt) * 0.016;
      this.smoothedVelocity = 0.6 * this.smoothedVelocity + 0.4 * instantVel;

      this.lastPointerX = e.clientX;
      this.lastPointerTime = now;
    });

    const onPointerUp = (e) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.stage.classList.remove("dragging");
      try { this.stage.releasePointerCapture(e.pointerId); } catch(err) {}

      if (this.dragDistance > 6) {
        const clampedVel = Math.max(-0.12, Math.min(0.12, this.smoothedVelocity));
        this.flingVelocity = clampedVel;
        this.autoTurnWeight = 0;
      }
    };

    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    // Close Button
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.closeDetail();
      });
    }

    // Keyboard Escape to close detail view
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isDetailOpen) {
        this.closeDetail();
      }
    });

    // Window Resize update
    window.addEventListener("resize", () => {
      if (this.isDetailOpen) {
        this.updateDetailCloseBtnPos();
      }
    });
  },

  setIndexNumber(idx) {
    if (!this.activeNumEl) return;
    const numStr = (idx + 1).toString().padStart(2, "0");
    if (this.activeNumEl.textContent === numStr) return;

    this.activeNumEl.classList.add("roll-up");
    setTimeout(() => {
      this.activeNumEl.textContent = numStr;
      this.activeNumEl.classList.remove("roll-up");
      this.activeNumEl.classList.add("roll-down");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.activeNumEl.classList.remove("roll-down");
        });
      });
    }, 220);
  },

  openDetail(idx) {
    this.detailTargetIdx = idx;
    this.isDetailOpen = true;
    this.detailAnimDirection = 1;
    this.detailAnimStartTime = performance.now();

    this.stage.classList.add("detail");

    // Populate Detail Panel
    const item = this.items[idx];
    const tagEl = document.getElementById("shopDetailTag");
    const titleEl = document.getElementById("shopDetailTitle");
    const descEl = document.getElementById("shopDetailDesc");
    const lbBtn = document.getElementById("shopDetailLightboxBtn");
    const waBtn = document.getElementById("shopDetailWhatsAppBtn");

    if (tagEl) tagEl.textContent = item.tag;
    if (titleEl) titleEl.textContent = item.title;
    if (descEl) descEl.textContent = item.desc;
    if (lbBtn) {
      lbBtn.onclick = () => window.openLightbox(item.file, item.title);
    }
    if (waBtn) {
      const msg = encodeURIComponent(`Assalam-o-Alaikum Munir Shop! I saw your store picture: "${item.title}" (${item.tag}) and want to place a wholesale order.`);
      waBtn.href = `https://wa.me/923421221630?text=${msg}`;
    }

    if (this.labelEl && this.actionLabelEl) {
      this.labelEl.classList.remove("active");
      this.labelEl.classList.add("hidden");
      this.actionLabelEl.classList.remove("hidden");
      this.actionLabelEl.classList.add("active");
    }

    this.setIndexNumber(idx);
    this.updateDetailCloseBtnPos();

    // Move focus to close button
    setTimeout(() => {
      if (this.closeBtn) this.closeBtn.focus();
    }, 300);
  },

  closeDetail() {
    this.detailAnimDirection = -1;
    this.detailAnimStartTime = performance.now();
    this.stage.classList.remove("detail");

    if (this.labelEl && this.actionLabelEl) {
      this.actionLabelEl.classList.remove("active");
      this.actionLabelEl.classList.add("hidden");
      this.labelEl.classList.remove("hidden");
      this.labelEl.classList.add("active");
    }

    const p = this.pieceEls[this.detailTargetIdx];
    if (p) p.focus();
  },

  updateDetailCloseBtnPos() {
    if (!this.closeBtn || !this.stage) return;
    const isMobile = window.innerWidth <= 768;
    const CX = this.stage.clientWidth / 2;
    const CY = this.stage.clientHeight / 2 - 20;

    let targetX, targetY, scale;
    if (isMobile) {
      targetX = CX;
      targetY = CY - 100;
      scale = 0.88;
    } else {
      targetX = CX - this.stage.clientWidth * 0.22;
      targetY = CY;
      scale = 1.15;
    }

    const itemWidth = isMobile ? 300 : (window.innerWidth <= 1024 ? 380 : 440);
    const itemHeight = isMobile ? 225 : (window.innerWidth <= 1024 ? 285 : 330);

    const closeX = targetX + (itemWidth * scale * 0.5) - 15;
    const closeY = targetY - (itemHeight * scale * 0.5) + 15;

    this.closeBtn.style.left = `${closeX}px`;
    this.closeBtn.style.top = `${closeY}px`;
  },

  tick(now) {
    const dt = Math.max(0.001, Math.min((now - this.lastFrameTime) / 1000, 0.05));
    this.lastFrameTime = now;

    // Handle Detail Transition (0 -> 1 or 1 -> 0)
    if (this.detailAnimDirection !== 0) {
      const elapsed = now - this.detailAnimStartTime;
      const progress = Math.min(elapsed / this.detailAnimDuration, 1);
      if (this.detailAnimDirection === 1) {
        this.detailProgress = progress;
        if (progress >= 1) this.detailAnimDirection = 0;
      } else {
        this.detailProgress = 1 - progress;
        if (progress >= 1) {
          this.detailProgress = 0;
          this.detailAnimDirection = 0;
          this.isDetailOpen = false;
        }
      }
    }

    // Turn ring only if not in detail mode and not dragging
    if (!this.isDetailOpen && !this.isDragging) {
      if (Math.abs(this.flingVelocity) > 0.0005) {
        this.base += this.flingVelocity;
        this.flingVelocity *= Math.pow(0.92, dt * 60);
      } else {
        this.flingVelocity = 0;
        this.base += this.OMEGA * dt * this.autoTurnWeight;
        this.autoTurnWeight = Math.min(1, this.autoTurnWeight + 0.8 * dt);
      }
    }

    const stageWidth = this.stage.clientWidth;
    const stageHeight = this.stage.clientHeight;
    const isMobile = window.innerWidth <= 768;

    const CX = stageWidth / 2;
    const CY = stageHeight / 2 - 20;
    const R = Math.min(stageWidth * 0.38, 430);

    let maxCos = -999;
    let frontIdx = 0;

    // Cubic ease helper for detail transition
    const t = this.detailProgress < 0.5
      ? 4 * this.detailProgress * this.detailProgress * this.detailProgress
      : 1 - Math.pow(-2 * this.detailProgress + 2, 3) / 2;

    this.items.forEach((item, i) => {
      const el = this.pieceEls[i];
      if (!el) return;

      const theta = this.base + i * this.STEP;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      const k = (1 + c) / 2;

      if (c > maxCos) {
        maxCos = c;
        frontIdx = i;
      }

      // Rest pose on ring
      const ringX = CX + R * s;
      const ringY = CY + (1 - k) * this.DROP;
      const ringScale = this.S0 * (0.72 + 0.28 * k);
      const ringRot = this.TILT * s;
      const ringZIndex = Math.round(k * 100) + 1;
      let opacity = 1;
      let finalX = ringX;
      let finalY = ringY;
      let finalScale = ringScale;
      let finalRot = ringRot;
      let finalZIndex = ringZIndex;

      if (this.detailProgress > 0) {
        if (i === this.detailTargetIdx) {
          // Chosen piece glides to target
          const targetX = isMobile ? CX : CX - stageWidth * 0.22;
          const targetY = isMobile ? CY - 100 : CY;
          const targetScale = isMobile ? 0.88 : 1.15;

          finalX = ringX + (targetX - ringX) * t;
          finalY = ringY + (targetY - ringY) * t;
          finalScale = ringScale + (targetScale - ringScale) * t;
          finalRot = ringRot * (1 - t);
          finalZIndex = 300;
          opacity = 1;
          el.style.pointerEvents = "auto";
        } else {
          // Other pieces drift outward, scale down, and fade
          const driftDirection = ringX >= CX ? 1 : -1;
          finalX = ringX + driftDirection * 250 * t;
          finalScale = ringScale * (1 - 0.46 * t);
          opacity = Math.max(0, 1 - 1.45 * t);
          el.style.pointerEvents = this.detailProgress > 0.05 ? "none" : "auto";
        }
      } else {
        el.style.pointerEvents = "auto";
      }

      el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0) scale(${finalScale}) rotate(${finalRot}deg)`;
      el.style.zIndex = finalZIndex;
      el.style.opacity = opacity;
    });

    // Update active front piece index & dots if changed
    if (!this.isDetailOpen && frontIdx !== this.activeFrontIdx) {
      this.activeFrontIdx = frontIdx;
      this.setIndexNumber(frontIdx);

      if (this.labelEl) {
        const item = this.items[frontIdx];
        this.labelEl.innerHTML = `${item.tag.split("•")[0].trim().toUpperCase()}<br>COLLECTION`;
      }

      // Update dots
      this.dotEls.forEach((dot, dIdx) => {
        if (dIdx === frontIdx) dot.classList.add("active");
        else dot.classList.remove("active");
      });
    }

    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }
};


// ==========================================================================
// 19. Parabolic Fly-To-Cart Animation & Ripple Burst
// ==========================================================================
function flyToCart(startElementOrEvent, imageSrc) {
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight / 2;

  if (startElementOrEvent && startElementOrEvent.getBoundingClientRect) {
    const r = startElementOrEvent.getBoundingClientRect();
    startX = r.left + r.width / 2;
    startY = r.top + r.height / 2;
  } else if (startElementOrEvent && startElementOrEvent.clientX) {
    startX = startElementOrEvent.clientX;
    startY = startElementOrEvent.clientY;
  }

  const targetCart = document.getElementById("cartTriggerBtn") || document.getElementById("floatingCartBtn");
  if (!targetCart) return;
  const targetRect = targetCart.getBoundingClientRect();
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  const flyEl = document.createElement("img");
  flyEl.className = "fly-to-cart-particle";
  flyEl.src = imageSrc || "Logo/99900opo9.png";
  flyEl.style.left = `${startX - 29}px`;
  flyEl.style.top = `${startY - 29}px`;
  document.body.appendChild(flyEl);

  const duration = 720;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const t = 1 - Math.pow(1 - progress, 3);

    const curX = startX + (endX - startX) * t;
    const arcHeight = Math.sin(progress * Math.PI) * 170;
    const curY = startY + (endY - startY) * t - arcHeight;
    const scale = 1 - (progress * 0.65);
    const rotation = progress * 720;

    flyEl.style.transform = `translate(${curX - startX}px, ${curY - startY}px) scale(${scale}) rotate(${rotation}deg)`;
    flyEl.style.opacity = progress > 0.85 ? `${(1 - progress) / 0.15}` : "1";

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      flyEl.remove();
      const b1 = document.getElementById("cartCountBadge");
      const b2 = document.getElementById("mobileCartCount");
      [b1, b2].forEach(b => {
        if (b) {
          b.classList.remove("cart-badge-bounce");
          void b.offsetWidth;
          b.classList.add("cart-badge-bounce");
        }
      });
      targetCart.classList.add("cart-glow-burst");
      setTimeout(() => targetCart.classList.remove("cart-glow-burst"), 700);
    }
  }

  requestAnimationFrame(step);
}

// ==========================================================================
// 12. Initialization & Event Listeners
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Initialize 3D Rotating Shop Picture Ring (Shop PIC Exclusive)
  setTimeout(() => {
    Shop3DRingController.init();
  }, 120);

  // 1. Initialize Store Data
  AppState.initStoreData();
  AppState.initCart();
  AppState.syncCartWithCatalog();
  AppState.updateCartUI();

  // 2. Render Dynamic Brands/Categories & Initial Catalog
  renderStorefrontTaxonomy();
  renderCatalog();

  // 3. Category Filter Dropdown
  const catFilter = document.getElementById("categoryFilter");
  if (catFilter) {
    catFilter.addEventListener("change", (e) => {
      AppState.activeCategory = e.target.value;
      renderCatalog();
    });
  }

  // 6. Sort Selector
  const sortSel = document.getElementById("sortSelector");
  if (sortSel) {
    sortSel.addEventListener("change", (e) => {
      AppState.sortBy = e.target.value;
      renderCatalog();
    });
  }

  // 7. Special Sales Only Checkbox
  const salesCheck = document.getElementById("specialSaleOnly");
  if (salesCheck) {
    salesCheck.addEventListener("change", (e) => {
      AppState.specialSaleOnly = e.target.checked;
      renderCatalog();
    });
  }

  // 8. Live Search Controls (Desktop Header, Mobile Drawer, and Catalog Inline Search)
  const liveSearch = document.getElementById("liveSearchInput");
  const clearSearch = document.getElementById("clearSearchBtn");
  const mobileSearch = document.getElementById("mobileSearchInput");
  const catalogSearch = document.getElementById("catalogSearchInput");
  const clearCatalogSearch = document.getElementById("clearCatalogSearchBtn");

  [liveSearch, mobileSearch, catalogSearch].forEach(inputEl => {
    if (inputEl) {
      inputEl.addEventListener("input", (e) => {
        syncSearchInputs(e.target.value);
        renderCatalog();
      });
    }
  });

  [clearSearch, clearCatalogSearch].forEach(btnEl => {
    if (btnEl) {
      btnEl.addEventListener("click", () => {
        syncSearchInputs("");
        renderCatalog();
      });
    }
  });

  // 9. Reset Search & Filters Button
  const resetBtn = document.getElementById("resetCatalogSearchBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);

  const clearAllFiltersBtn = document.getElementById("clearAllFiltersBtn");
  if (clearAllFiltersBtn) clearAllFiltersBtn.addEventListener("click", resetAllFilters);

  // 10. Cart Drawer Triggers
  const openCartBtn = document.getElementById("openCartBtn");
  const closeCartBtn = document.getElementById("closeCartDrawerBtn");
  const cartBackdrop = document.getElementById("cartDrawerBackdrop");
  const mobileOpenCartBtn = document.getElementById("mobileOpenCartBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const proceedCheckoutBtn = document.getElementById("proceedCheckoutBtn");
  const directWhatsAppCheckoutBtn = document.getElementById("checkoutViaWhatsAppDirectBtn");

  if (openCartBtn) openCartBtn.addEventListener("click", openCartDrawer);
  if (mobileOpenCartBtn) mobileOpenCartBtn.addEventListener("click", openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCartDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartDrawer);
  if (clearCartBtn) clearCartBtn.addEventListener("click", () => AppState.clearCart());
  if (proceedCheckoutBtn) proceedCheckoutBtn.addEventListener("click", openCheckoutModal);
  if (directWhatsAppCheckoutBtn) directWhatsAppCheckoutBtn.addEventListener("click", checkoutViaWhatsAppDirect);

  // 11. Product Modal Triggers
  const closeProdModalBtn = document.getElementById("closeProductModalBtn");
  const prodModalBackdrop = document.getElementById("productModalBackdrop");
  if (closeProdModalBtn) closeProdModalBtn.addEventListener("click", closeProductModal);
  if (prodModalBackdrop) {
    prodModalBackdrop.addEventListener("click", (e) => {
      if (e.target === prodModalBackdrop) closeProductModal();
    });
  }

  // 12. Checkout Modal Triggers
  const closeCheckoutBtn = document.getElementById("closeCheckoutModalBtn");
  const checkoutBackdrop = document.getElementById("checkoutModalBackdrop");
  const checkoutForm = document.getElementById("checkoutForm");
  if (closeCheckoutBtn) closeCheckoutBtn.addEventListener("click", closeCheckoutModal);
  if (checkoutBackdrop) {
    checkoutBackdrop.addEventListener("click", (e) => {
      if (e.target === checkoutBackdrop) closeCheckoutModal();
    });
  }
  if (checkoutForm) checkoutForm.addEventListener("submit", handleCheckoutFormSubmit);

    // Mobile Drawer Triggers
  const mobileToggleBtn = document.getElementById("mobileMenuToggleBtn");
  const closeMobileBtn = document.getElementById("closeMobileDrawerBtn");
  const mobileDrawer = document.getElementById("mobileDrawer");
  const drawerBackdrop = document.getElementById("drawerBackdrop");
  if (mobileToggleBtn && mobileDrawer) {
    mobileToggleBtn.addEventListener("click", () => {
      mobileDrawer.classList.add("open");
      if (drawerBackdrop) drawerBackdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  }
  const closeMobileNav = () => {
    if (mobileDrawer) mobileDrawer.classList.remove("open");
    if (drawerBackdrop) drawerBackdrop.classList.remove("open");
    syncBodyScrollLock();
  };
  if (closeMobileBtn) closeMobileBtn.addEventListener("click", closeMobileNav);
  if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeMobileNav);
  document.querySelectorAll(".mobile-nav-link").forEach(link => {
    link.addEventListener("click", closeMobileNav);
  });

  // Footer & Mobile Admin Access Triggers
  const footerAdmin = document.getElementById("footerAdminLink");
  const shortcutAdmin = document.getElementById("btnAdminAccessShortcut");
  const mobileAdmin = document.getElementById("mobileAdminBtn");
  [footerAdmin, shortcutAdmin, mobileAdmin].forEach(btn => {
    if (btn) btn.addEventListener("click", () => AdminController.openEntryPoint());
  });

  // Cart Trigger Button in Header and Floating Bar
  const cartTrigger = document.getElementById("cartTriggerBtn");
  const floatingCart = document.getElementById("floatingCartBtn");
  [cartTrigger, floatingCart].forEach(btn => {
    if (btn) btn.addEventListener("click", openCartDrawer);
  });

  // Category Filter Select
  const catSel = document.getElementById("categoryFilterSelect");
  if (catSel) {
    catSel.addEventListener("change", (e) => {
      AppState.activeCategory = e.target.value;
      renderCatalog();
    });
  }

  // Sort Select
  const sortSelAlt = document.getElementById("sortSelect");
  if (sortSelAlt) {
    sortSelAlt.addEventListener("change", (e) => {
      AppState.sortBy = e.target.value;
      renderCatalog();
    });
  }

  // Special Deals Only Checkbox
  const dealsCheck = document.getElementById("specialDealsOnlyCheckbox");
  if (dealsCheck) {
    dealsCheck.addEventListener("change", (e) => {
      AppState.specialSaleOnly = e.target.checked;
      renderCatalog();
    });
  }

  // Reset Filters Buttons
  const resetFiltBtn = document.getElementById("resetFiltersBtn");
  const emptyResetBtn = document.getElementById("emptyStateResetBtn");
  [resetFiltBtn, emptyResetBtn].forEach(btn => {
    if (btn) btn.addEventListener("click", resetAllFilters);
  });

  // Checkout Modal Triggers
  const openCheckBtn = document.getElementById("openCheckoutModalBtn");
  if (openCheckBtn) openCheckBtn.addEventListener("click", openCheckoutModal);

  // Lightbox Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.closeLogoModal();
      window.closeTeamModal();
      closeLightbox();
    }
  });
  // 13. Mobile Navigation Drawer Toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileNavDrawer = document.getElementById("mobileNavDrawer");
  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener("click", () => {
      const isOpen = mobileNavDrawer.classList.toggle("open");
      mobileMenuBtn.classList.toggle("open", isOpen);
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    });

    // Close mobile drawer when clicking nav item
    document.querySelectorAll(".mobile-nav-item").forEach(item => {
      item.addEventListener("click", () => {
        mobileNavDrawer.classList.remove("open");
        mobileMenuBtn.classList.remove("open");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // 14. Admin & Settings Panel Listeners
  // All Admin Triggers
    // Logo Modal Backdrop Listener
  const logoModalBackdrop = document.getElementById("logoModalBackdrop");
  if (logoModalBackdrop) {
    logoModalBackdrop.addEventListener("click", (e) => {
      if (e.target === logoModalBackdrop) window.closeLogoModal();
    });
  }

  // Team Member Modal Backdrop Listener
  const teamModalBackdrop = document.getElementById("teamMemberModalBackdrop");
  if (teamModalBackdrop) {
    teamModalBackdrop.addEventListener("click", (e) => {
      if (e.target === teamModalBackdrop) window.closeTeamModal();
    });
  }

  const allAdminButtons = [
    document.getElementById("headerAdminTriggerBtn"),
    document.getElementById("headerNavAdminBtn"),
    document.getElementById("floatingAdminBtn"),
    document.getElementById("openAdminTriggerBtn"),
    document.getElementById("btnAdminAccessShortcut"),
    document.getElementById("mobileAdminBtn"),
    document.querySelector(".announcement-admin-link")
  ];
  allAdminButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        window.openAdminPanel();
      });
    }
  });

  const openAdminBtn = document.getElementById("openAdminTriggerBtn");
  const adminAuthBackdrop = document.getElementById("adminAuthModalBackdrop");
  const closeAdminAuthBtn = document.getElementById("closeAdminAuthModalBtn");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const toggleLoginPassBtn = document.getElementById("toggleLoginPasswordVisBtn");

  const adminPinBackdrop = document.getElementById("adminPinModalBackdrop");
  const closeAdminPinBtn = document.getElementById("closeAdminPinModalBtn");
  const adminPinForm = document.getElementById("adminPinForm");
  const adminPinInput = document.getElementById("adminPinInput");
  const togglePinVisBtn = document.getElementById("toggleAdminPinVisBtn");
  const adminPanelBackdrop = document.getElementById("adminPanelBackdrop");
  const closeAdminPanelBtn = document.getElementById("closeAdminPanelBtn");
  const adminLockBtn = document.getElementById("adminLockBtn");

  if (openAdminBtn) openAdminBtn.addEventListener("click", () => AdminController.openEntryPoint());

  // Step 1: Auth Modal Event Listeners
  if (closeAdminAuthBtn) closeAdminAuthBtn.addEventListener("click", () => AdminController.closeAuthModal());
  if (adminAuthBackdrop) {
    adminAuthBackdrop.addEventListener("click", (e) => {
      if (e.target === adminAuthBackdrop) AdminController.closeAuthModal();
    });
  }

  // Password Visibility Toggle
  if (toggleLoginPassBtn) {
    toggleLoginPassBtn.addEventListener("click", () => {
      const input = document.getElementById("adminLoginPassword");
      if (!input) return;
      const isPass = input.type === "password";
      input.type = isPass ? "text" : "password";
      toggleLoginPassBtn.innerHTML = isPass ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  }

  // Sign In Form Submission
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("adminLoginEmail")?.value || "";
      const pass = document.getElementById("adminLoginPassword")?.value || "";
      const errEl = document.getElementById("adminLoginError");

      const result = AdminController.signIn(email, pass);
      if (result.success) {
        if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }
        adminLoginForm.reset();
        AdminController.closeAuthModal();
        AdminController.openPinModal();
        showToast(`Welcome back, ${result.user.name}!`, "success");
      } else {
        if (errEl) {
          errEl.textContent = result.message;
          errEl.style.display = "block";
        }
        if (result.locked) {
          const alertBox = document.getElementById("adminAuthAlert");
          if (alertBox) {
            alertBox.textContent = result.message;
            alertBox.style.display = "block";
          }
        }
      }
    });
  }

  // Step 2: Secret Admin Code Form Submission (with 3-Attempt Lockout)
  if (closeAdminPinBtn) closeAdminPinBtn.addEventListener("click", () => AdminController.closePinModal());
  if (adminPinBackdrop) {
    adminPinBackdrop.addEventListener("click", (e) => {
      if (e.target === adminPinBackdrop) AdminController.closePinModal();
    });
  }
  if (togglePinVisBtn && adminPinInput) {
    togglePinVisBtn.addEventListener("click", () => {
      const show = adminPinInput.type === "password";
      adminPinInput.type = show ? "text" : "password";
      togglePinVisBtn.innerHTML = show ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  }
  if (adminPinForm) {
    adminPinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pinVal = (adminPinInput?.value || "").trim();
      const errEl = document.getElementById("adminPinError");
      const result = AdminController.verifyAdminCode(pinVal);

      if (result.success) {
        if (errEl) { errEl.style.display = "none"; errEl.textContent = ""; }
        AdminController.closePinModal();
        AdminController.openDashboard();
        showToast("Admin dashboard unlocked!", "success");
      } else {
        if (!result.locked) {
          if (errEl) {
            errEl.textContent = result.message;
            errEl.style.display = "block";
          }
          if (adminPinInput) {
            adminPinInput.value = "";
            adminPinInput.focus();
          }
          const attemptsNotice = document.getElementById("adminPinAttemptsNotice");
          if (attemptsNotice) {
            const left = Math.max(0, 3 - result.attempts);
            attemptsNotice.innerHTML = `<i class="fas fa-exclamation-triangle text-gold"></i> 3-Attempt Rule: ${left} attempt(s) remaining before session lockout!`;
          }
        }
      }
    });
  }

  if (closeAdminPanelBtn) closeAdminPanelBtn.addEventListener("click", () => AdminController.closeDashboard());
  if (adminLockBtn) adminLockBtn.addEventListener("click", () => AdminController.lockPanel());
  if (adminPanelBackdrop) {
    adminPanelBackdrop.addEventListener("click", (e) => {
      if (e.target === adminPanelBackdrop) AdminController.closeDashboard();
    });
  }

  document.querySelectorAll(".admin-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-admin-tab");
      if (tab === "editor" && !document.getElementById("adminEditProductId").value) {
        AdminController.resetProductForm();
      }
      AdminController.switchTab(tab);
    });
  });

  const adminProdSearch = document.getElementById("adminProductSearch");
  const adminBrandFilter = document.getElementById("adminProductBrandFilter");
  const adminQuickAddBtn = document.getElementById("adminQuickAddBtn");
  const adminCancelEditBtn = document.getElementById("adminCancelEditBtn");
  const adminProductForm = document.getElementById("adminProductForm");
  const adminProdImageFile = document.getElementById("adminProdImageFile");
  const adminProdImageUrl = document.getElementById("adminProdImageUrl");
  const adminUseDefaultImgBtn = document.getElementById("adminUseDefaultImgBtn");
  const adminClearUploadedImgBtn = document.getElementById("adminClearUploadedImgBtn");

  if (adminProdSearch) adminProdSearch.addEventListener("input", () => AdminController.renderAdminProductsList());
  if (adminBrandFilter) adminBrandFilter.addEventListener("change", () => AdminController.renderAdminProductsList());
  if (adminQuickAddBtn) adminQuickAddBtn.addEventListener("click", () => AdminController.startNewProduct());
  if (adminCancelEditBtn) {
    adminCancelEditBtn.addEventListener("click", () => {
      AdminController.resetProductForm();
      AdminController.switchTab("products");
    });
  }
  if (adminProductForm) adminProductForm.addEventListener("submit", (e) => AdminController.handleSaveProductForm(e));

  if (adminProdImageFile) {
    adminProdImageFile.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const saveBtn = document.getElementById("adminSaveProductBtn");
      AdminController.isCompressingImage = true;
      if (saveBtn) saveBtn.disabled = true;
      AdminController.setUploadStatus("Processing photo...", false);

      AdminController.compressImageFile(
        file,
        (dataUrl) => {
          AdminController.isCompressingImage = false;
          AdminController.uploadedImageDataUrl = dataUrl;
          if (adminProdImageUrl) adminProdImageUrl.value = "";
          const preview = document.getElementById("adminProdImagePreview");
          if (preview) preview.src = dataUrl;
          const kb = Math.round((dataUrl.length * 0.75) / 1024);
          AdminController.setUploadStatus(`âœ“ Custom photo attached (${file.name}, ~${kb} KB) â€” ready to save!`, true);
          if (saveBtn) saveBtn.disabled = false;
          showToast("Custom photo attached & optimized!", "success");
        },
        () => {
          AdminController.isCompressingImage = false;
          if (saveBtn) saveBtn.disabled = false;
          AdminController.setUploadStatus("Choose a photo from your device â€” automatically optimized & saved with the product.", false);
        }
      );
    });
  }

  if (adminClearUploadedImgBtn) {
    adminClearUploadedImgBtn.addEventListener("click", () => {
      AdminController.uploadedImageDataUrl = "";
      if (adminProdImageFile) adminProdImageFile.value = "";
      const urlVal = adminProdImageUrl ? adminProdImageUrl.value.trim() : "";
      const preview = document.getElementById("adminProdImagePreview");
      if (preview) {
        preview.src = urlVal ? (urlVal.startsWith("data:") ? urlVal : encodeURI(urlVal)) : encodeURI(SHOP_CONFIG.defaultImage);
      }
      AdminController.setUploadStatus("Choose a photo from your device â€” automatically optimized & saved with the product.", false);
    });
  }

  if (adminProdImageUrl) {
    adminProdImageUrl.addEventListener("input", (e) => {
      const val = e.target.value.trim();
      if (val) {
        AdminController.uploadedImageDataUrl = "";
        if (adminProdImageFile) adminProdImageFile.value = "";
        AdminController.setUploadStatus("Using custom image path/URL.", false);
      } else if (!AdminController.uploadedImageDataUrl) {
        AdminController.setUploadStatus("Choose a photo from your device â€” automatically optimized & saved with the product.", false);
      }
      const preview = document.getElementById("adminProdImagePreview");
      if (preview) {
        preview.src = val ? (val.startsWith("data:") ? val : encodeURI(val)) : encodeURI(SHOP_CONFIG.defaultImage);
      }
    });
  }

  if (adminUseDefaultImgBtn) {
    adminUseDefaultImgBtn.addEventListener("click", () => {
      AdminController.uploadedImageDataUrl = "";
      if (adminProdImageUrl) adminProdImageUrl.value = SHOP_CONFIG.defaultImage;
      if (adminProdImageFile) adminProdImageFile.value = "";
      const preview = document.getElementById("adminProdImagePreview");
      if (preview) preview.src = encodeURI(SHOP_CONFIG.defaultImage);
      AdminController.setUploadStatus("Using default Munir Shop logo.", false);
    });
  }

  const adminAddBrandForm = document.getElementById("adminAddBrandForm");
  const adminAddCategoryForm = document.getElementById("adminAddCategoryForm");
  if (adminAddBrandForm) {
    adminAddBrandForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("adminNewBrandInput");
      if (input) {
        AdminController.addBrand(input.value);
        input.value = "";
      }
    });
  }
  if (adminAddCategoryForm) {
    adminAddCategoryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("adminNewCategoryInput");
      if (input) {
        AdminController.addCategory(input.value);
        input.value = "";
      }
    });
  }

  const adminChangePinForm = document.getElementById("adminChangePinForm");
  if (adminChangePinForm) {
    adminChangePinForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const cur = document.getElementById("adminCurrentPin").value.trim();
      const next = document.getElementById("adminNewPin").value.trim();
      const confirm = document.getElementById("adminConfirmPin").value.trim();

      if (!AdminController.verifyAdminCode(cur).success) {
        showToast("Current secret code is incorrect.", "error");
        return;
      }
      if (next.length < 4) {
        showToast("New secret code must be at least 4 characters.", "error");
        return;
      }
      if (next !== confirm) {
        showToast("New secret code and confirmation do not match.", "error");
        return;
      }
      if (AdminController.saveNewPin(next)) {
        adminChangePinForm.reset();
        showToast("Secret admin code updated & saved to localStorage!", "success");
      } else {
        showToast("Failed to save code in localStorage.", "error");
      }
    });
  }

  const adminExportBtn = document.getElementById("adminExportJsonBtn");
  const adminImportFile = document.getElementById("adminImportJsonFile");
  const adminResetBtn = document.getElementById("adminResetStoreBtn");
  if (adminExportBtn) adminExportBtn.addEventListener("click", () => AdminController.exportBackupJson());
  if (adminImportFile) {
    adminImportFile.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) {
        AdminController.importBackupJson(file);
        adminImportFile.value = "";
      }
    });
  }
  if (adminResetBtn) adminResetBtn.addEventListener("click", () => AdminController.handleResetCatalogClick(adminResetBtn));

  // 15. Keyboard Shortcuts: '/' focuses search, 'Escape' closes modals, 'Ctrl+Shift+A' opens Admin
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.closeLogoModal();
      window.closeTeamModal();
      closeProductModal();
      closeCheckoutModal();
      closeCartDrawer();
      AdminController.closeAuthModal();
      AdminController.closePinModal();
      AdminController.closeDashboard();
      if (mobileNavDrawer && mobileNavDrawer.classList.contains("open")) {
        mobileNavDrawer.classList.remove("open");
        if (mobileMenuBtn) {
          mobileMenuBtn.classList.remove("open");
          mobileMenuBtn.setAttribute("aria-expanded", "false");
        }
      }
    }
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      AdminController.openEntryPoint();
      return;
    }
    const activeTag = document.activeElement?.tagName;
    const isTyping = activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT";
    if (e.key === "/" && !isTyping) {
      const targetSearch = (liveSearch && liveSearch.offsetParent !== null) ? liveSearch : catalogSearch;
      if (targetSearch) {
        e.preventDefault();
        targetSearch.focus();
      }
    }
  });

  // 16. Header Scroll Effect
  window.addEventListener("scroll", () => {
    const header = document.getElementById("siteHeader");
    if (!header) return;
    if (window.scrollY > 40) {
      header.style.boxShadow = "0 8px 30px rgba(0, 0, 0, 0.7)";
      header.style.borderBottomColor = "var(--gold-primary)";
    } else {
      header.style.boxShadow = "";
      header.style.borderBottomColor = "var(--border-subtle)";
    }
  });
});
