import { Link, useParams } from "react-router-dom";
import { useRef, useState } from "react";
import ProductCard from "../components/ProductCard";
import { useMarketplace } from "../context/MarketplaceContext";
import { categories } from "../data/mockData";
import { formatPriceInput, getCategorySpecDefinitions, sanitizePriceInput } from "../lib/productUtils";

const defaultProductForm = {
  name: "",
  category: "Phones",
  price: "",
  stock: "",
  description: "",
  image: "",
  tags: "",
  specs: {},
};

function getOrderStatusOptions(currentStatus) {
  const orderStatusFlow = {
    Pending: ["Pending", "Accepted", "Rejected"],
    Accepted: ["Accepted", "Preparing", "Cancelled"],
    Preparing: ["Preparing", "Dispatched", "Cancelled"],
    Dispatched: ["Dispatched", "Delivered"],
    Delivered: ["Delivered", "Completed"],
    Completed: ["Completed"],
    Rejected: ["Rejected"],
    Cancelled: ["Cancelled"],
  };

  return orderStatusFlow[currentStatus] || [currentStatus];
}

function SellerPage() {
  const { sellerId } = useParams();
  const {
    compareItems,
    products,
    savedItems,
    sellers,
    toggleCompareItem,
    toggleSavedItem,
    profile,
    addProduct,
    updateProduct,
    deleteProduct,
    orders,
    updateOrderStatus,
  } = useMarketplace();
  const seller = sellers.find((item) => item.id === sellerId);
  const [newProduct, setNewProduct] = useState(defaultProductForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const productFormRef = useRef(null);

  if (!seller) {
    return (
      <section className="empty-state">
        <h1>Seller not found</h1>
        <Link to="/">Return to browse</Link>
      </section>
    );
  }

  const isSellerOwner = profile.sellerId === seller.id;
  const sellerProducts = products.filter((product) => product.sellerId === seller.id);
  const editingProduct = sellerProducts.find((product) => product.id === editingProductId) ?? null;

  function resetProductForm() {
    setNewProduct(defaultProductForm);
    setEditingProductId(null);
  }

  function loadProductIntoForm(product) {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      description: product.description ?? "",
      image: product.image ?? "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : product.tags ?? "",
      specs: { ...(product.specs ?? {}) },
    });
    requestAnimationFrame(() => {
      productFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleDeleteProduct(product) {
    const confirmed = window.confirm(`Delete "${product.name}" from your store? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    if (editingProductId === product.id) {
      resetProductForm();
    }

    deleteProduct(product.id);
  }

  function handleProductChange(event) {
    const { name, value } = event.target;
    if (name.startsWith("spec_")) {
      const specField = name.replace("spec_", "");
      setNewProduct((current) => ({
        ...current,
        specs: { ...current.specs, [specField]: value },
      }));
    } else if (name === "category") {
      setNewProduct((current) => ({
        ...current,
        category: value,
        specs: {},
      }));
    } else if (name === "price") {
      setNewProduct((current) => ({ ...current, price: sanitizePriceInput(value) }));
    } else {
      setNewProduct((current) => ({ ...current, [name]: value }));
    }
  }

  function handleProductSubmit(event) {
    event.preventDefault();
    const productId = editingProductId
      ? updateProduct(editingProductId, newProduct)
      : addProduct(newProduct);
    if (productId) {
      resetProductForm();
    }
  }

  const currentCategorySpecs = getCategorySpecDefinitions(newProduct.category);

  const sellerOrders = orders.filter((order) => order.sellerId === seller.id);

  return (
    <div className="page-grid">
      <section className="seller-hero">
        <img src={seller.coverImage} alt={seller.name} className="seller-cover" />
        <article className="panel seller-hero-card">
          <p className="panel-kicker">Seller storefront</p>
          <h1>{seller.name}</h1>
          <p>{seller.tagline}</p>
          <div className="seller-stat-grid">
            <article>
              <strong>{seller.rating}</strong>
              <span>Store rating</span>
            </article>
            <article>
              <strong>{seller.followers}</strong>
              <span>Followers</span>
            </article>
            <article>
              <strong>{seller.joined}</strong>
              <span>Joined</span>
            </article>
          </div>
          <div className="seller-meta">
            <span>{seller.location}</span>
            <span>{seller.responseTime}</span>
          </div>
        </article>
      </section>

      {isSellerOwner ? (
        <section className="panel" ref={productFormRef}>
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Seller controls</p>
              <h2>{editingProductId ? "Edit product" : "Add a new product"}</h2>
              {editingProduct ? <p>Editing {editingProduct.name}</p> : null}
            </div>
          </div>

          <form className="auth-form" onSubmit={handleProductSubmit}>
            <label>
              <span>Product name</span>
              <input name="name" value={newProduct.name} onChange={handleProductChange} required />
            </label>

            <label>
              <span>Category</span>
              <select name="category" value={newProduct.category} onChange={handleProductChange} required>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Price</span>
              <input
                name="price"
                type="text"
                inputMode="decimal"
                value={formatPriceInput(newProduct.price)}
                onChange={handleProductChange}
                placeholder="1,200"
                required
              />
            </label>

            <label>
              <span>Stock</span>
              <input name="stock" type="number" value={newProduct.stock} onChange={handleProductChange} required />
            </label>

            <label>
              <span>Description</span>
              <input name="description" value={newProduct.description} onChange={handleProductChange} required />
            </label>

            <label>
              <span>Product image URL</span>
              <input name="image" type="url" value={newProduct.image} onChange={handleProductChange} required />
            </label>

            {currentCategorySpecs.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(255, 116, 172, 0.12)", paddingTop: "16px", marginTop: "8px" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "#531f37", marginBottom: "12px" }}>
                  {newProduct.category} specifications (featured picks)
                </p>
                {currentCategorySpecs.map((spec) => (
                  <label key={spec.field}>
                    <span>{spec.label}</span>
                    <input
                      name={`spec_${spec.field}`}
                      value={newProduct.specs[spec.field] || ""}
                      onChange={handleProductChange}
                      placeholder={spec.placeholder}
                    />
                  </label>
                ))}
              </div>
            )}

            <label>
              <span>Tags (comma-separated)</span>
              <input name="tags" value={newProduct.tags} onChange={handleProductChange} />
            </label>

            <button type="submit" className="primary-button">
              {editingProductId ? "Save changes" : "Post product"}
            </button>
            {editingProductId ? (
              <button type="button" className="secondary-button" onClick={resetProductForm}>
                Cancel edit
              </button>
            ) : null}
          </form>

          {sellerOrders.length > 0 ? (
            <div style={{ marginTop: "24px" }}>
              <h3>Order status updates</h3>
              {sellerOrders.map((order) => (
                <article key={order.id} className="dashboard-row" style={{ marginBottom: "12px" }}>
                  <div>
                    <strong>{order.productName}</strong>
                    <span>
                      {order.status} - {order.quantity} item(s) for {order.pickupArea}
                    </span>
                    <span>
                      {order.buyerName} - {order.deliveryLocation} - {order.buyerPhone}
                    </span>
                  </div>
                  <select
                    value={order.status}
                    onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  >
                    {getOrderStatusOptions(order.status).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="section-heading">
        <div>
          <p className="panel-kicker">Store inventory</p>
          <h2>{sellerProducts.length} available products</h2>
        </div>
      </section>

      <section className="product-grid">
        {sellerProducts.map((product) => (
          <div key={product.id} style={{ display: "grid", gap: "12px" }}>
            <ProductCard
              product={product}
              isCompared={compareItems.includes(product.id)}
              isSaved={savedItems.includes(product.id)}
              onToggleCompare={toggleCompareItem}
              onToggleSave={toggleSavedItem}
            />
            {isSellerOwner ? (
              <div className="inline-actions">
                <button type="button" className="secondary-button" onClick={() => loadProductIntoForm(product)}>
                  Edit product
                </button>
                <button type="button" className="ghost-button" onClick={() => handleDeleteProduct(product)}>
                  Delete product
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}

export default SellerPage;
