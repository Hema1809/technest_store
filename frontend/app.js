const API_URL =
  "https://technest-store-h1ja.onrender.com/api/products";

let products = [];
let cart = JSON.parse(localStorage.getItem("technestCart")) || [];
let selectedCategory = "All";
let searchTerm = "";
let selectedProductId = null;

/* ===============================
   DOM ELEMENTS
================================ */

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");
const sortSelect = document.getElementById("sortSelect");
const emptyState = document.getElementById("emptyState");

const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const navCartBtn = document.getElementById("navCartBtn");
const closeCart = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");

const productModal = document.getElementById("productModal");
const closeProductModal = document.getElementById("closeProductModal");
const modalProductImage = document.getElementById("modalProductImage");
const modalProductCategory = document.getElementById("modalProductCategory");
const modalProductName = document.getElementById("modalProductName");
const modalProductRating = document.getElementById("modalProductRating");
const modalProductDescription = document.getElementById(
  "modalProductDescription"
);
const modalProductPrice = document.getElementById("modalProductPrice");
const modalAddToCart = document.getElementById("modalAddToCart");

const toast = document.getElementById("toast");
const newsletterForm = document.getElementById("newsletterForm");

/* ===============================
   HELPER FUNCTIONS
================================ */

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function saveCart() {
  localStorage.setItem("technestCart", JSON.stringify(cart));
}

function showToast(message) {
  if (!toast) {
    alert(message);
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function getProductEmoji(category) {
  const emojis = {
    Laptops: "💻",
    Smartphones: "📱",
    Accessories: "🎧",
    "Smart Home": "🏠",
    Gaming: "🎮",
    Tablets: "📲",
    Wearables: "⌚",
  };

  return emojis[category] || "🛍️";
}

/* ===============================
   FETCH PRODUCTS
================================ */

async function fetchProducts() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    products = await response.json();

    createCategoryFilters();
    renderProducts();
    updateCart();
  } catch (error) {
    console.error("Error loading products:", error);

    if (productGrid) {
      productGrid.innerHTML = `
        <div class="error-message">
          <h3>Unable to load products</h3>
          <p>Please try again after some time.</p>
        </div>
      `;
    }
  }
}

/* ===============================
   CATEGORY FILTERS
================================ */

function createCategoryFilters() {
  if (!categoryFilters) return;

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button
          class="category-btn ${
            category === selectedCategory ? "active" : ""
          }"
          data-category="${category}"
        >
          ${category}
        </button>
      `
    )
    .join("");

  document.querySelectorAll(".category-btn").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;

      document.querySelectorAll(".category-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      button.classList.add("active");
      renderProducts();
    });
  });
}

/* ===============================
   RENDER PRODUCTS
================================ */

function renderProducts() {
  if (!productGrid) return;

  let filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (sortSelect) {
    const sortValue = sortSelect.value;

    if (sortValue === "low-high") {
      filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (sortValue === "high-low") {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    if (sortValue === "rating") {
      filteredProducts.sort((a, b) => b.rating - a.rating);
    }
  }

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = "";

    if (emptyState) {
      emptyState.style.display = "block";
    }

    return;
  }

  if (emptyState) {
    emptyState.style.display = "none";
  }

  productGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card" data-id="${product._id}">
          <div class="product-image">
            ${getProductEmoji(product.category)}
          </div>

          <div class="product-info">
            <span class="product-category">
              ${product.category}
            </span>

            <h3>${product.name}</h3>

            <div class="product-rating">
              ⭐ ${product.rating || 4.5}
              <span>(${product.reviews || 0})</span>
            </div>

            <div class="product-bottom">
              <strong>${formatPrice(product.price)}</strong>

              <button class="add-btn" data-id="${product._id}">
                Add to Cart
              </button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      const productId = button.dataset.id;
      addToCart(productId);
    });
  });

  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", () => {
      openProductModal(card.dataset.id);
    });
  });
}

/* ===============================
   PRODUCT MODAL
================================ */

function openProductModal(productId) {
  const product = products.find(
    (item) => String(item._id) === String(productId)
  );

  if (!product || !productModal) return;

  selectedProductId = productId;

  if (modalProductImage) {
    modalProductImage.textContent = getProductEmoji(product.category);
  }

  if (modalProductCategory) {
    modalProductCategory.textContent = product.category;
  }

  if (modalProductName) {
    modalProductName.textContent = product.name;
  }

  if (modalProductRating) {
    modalProductRating.textContent = `⭐ ${
      product.rating || 4.5
    } (${product.reviews || 0} reviews)`;
  }

  if (modalProductDescription) {
    modalProductDescription.textContent =
      product.description ||
      `Experience excellent quality and performance with the ${product.name}.`;
  }

  if (modalProductPrice) {
    modalProductPrice.textContent = formatPrice(product.price);
  }

  productModal.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
}

function closeProductDetailsModal() {
  if (!productModal) return;

  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
  selectedProductId = null;
}

if (closeProductModal) {
  closeProductModal.addEventListener("click", closeProductDetailsModal);
}

if (productModal) {
  productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
      closeProductDetailsModal();
    }
  });
}

if (modalAddToCart) {
  modalAddToCart.addEventListener("click", () => {
    if (selectedProductId) {
      addToCart(selectedProductId);
      closeProductDetailsModal();
    }
  });
}

/* ===============================
   CART FUNCTIONS
================================ */

function addToCart(productId) {
  const product = products.find(
    (item) => String(item._id) === String(productId)
  );

  if (!product) return;

  const existingItem = cart.find(
    (item) => String(item.id) === String(productId)
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      quantity: 1,
    });
  }

  saveCart();
  updateCart();
  showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
  cart = cart.filter(
    (item) => String(item.id) !== String(productId)
  );

  saveCart();
  updateCart();
}

function changeQuantity(productId, change) {
  const item = cart.find(
    (cartItem) => String(cartItem.id) === String(productId)
  );

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCart();
}

function updateCart() {
  saveCart();

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = document.getElementById("cartCount");

  if (cartCount) {
    cartCount.textContent = totalItems;
  }

  if (cartTotal) {
    cartTotal.textContent = formatPrice(totalPrice);
  }

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div>🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add some products to get started.</p>
      </div>
    `;

    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div class="cart-item-image">
            ${getProductEmoji(item.category)}
          </div>

          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <p>${formatPrice(item.price)}</p>

            <div class="quantity-controls">
              <button
                class="quantity-btn"
                onclick="changeQuantity('${item.id}', -1)"
              >
                −
              </button>

              <span>${item.quantity}</span>

              <button
                class="quantity-btn"
                onclick="changeQuantity('${item.id}', 1)"
              >
                +
              </button>

              <button
                class="remove-btn"
                onclick="removeFromCart('${item.id}')"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

/* ===============================
   CART DRAWER
================================ */

function openCart() {
  if (cartOverlay) {
    cartOverlay.classList.add("open");
  }

  if (cartDrawer) {
    cartDrawer.classList.add("open");
  }
}

function closeCartDrawer() {
  if (cartOverlay) {
    cartOverlay.classList.remove("open");
  }

  if (cartDrawer) {
    cartDrawer.classList.remove("open");
  }
}

if (navCartBtn) {
  navCartBtn.addEventListener("click", openCart);
}

if (closeCart) {
  closeCart.addEventListener("click", closeCartDrawer);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCartDrawer);
}

/* ===============================
   CHECKOUT
================================ */

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      showToast("Your cart is empty!");
      return;
    }

    const orderTotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderId =
      "TN" + Date.now().toString().slice(-6);

    alert(
      `Order placed successfully! 🎉\n\n` +
        `Order ID: ${orderId}\n` +
        `Total Amount: ${formatPrice(orderTotal)}\n\n` +
        `Thank you for shopping with TechNest!`
    );

    cart = [];
    saveCart();
    updateCart();
    closeCartDrawer();
  });
}

/* ===============================
   SEARCH AND SORT
================================ */

if (searchInput) {
  searchInput.addEventListener("input", (event) => {
    searchTerm = event.target.value;
    renderProducts();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", renderProducts);
}

/* ===============================
   NEWSLETTER
================================ */

if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Thank you for subscribing! 🎉");
    newsletterForm.reset();
  });
}

/* ===============================
   MOBILE MENU
================================ */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}

/* ===============================
   START APPLICATION
================================ */

fetchProducts();