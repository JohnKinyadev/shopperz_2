import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { useMarketplace } from "../context/MarketplaceContext";
import { categories, categorySpecs } from "../data/mockData";

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
    orders,
    updateOrderStatus,
  } = useMarketplace();
  const seller = sellers.find((item) => item.id === sellerId);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "Phones",
    price: "",
    stock: "",
    description: "",
    image: "",
    tags: "",
    specs: {},
  });

  if (!seller) {
    return (
      <section className="empty-state">
        <h1>Seller not found</h1>
        <Link to="/">Return to browse</Link>
      </section>
    );
  }

  const isSellerOwner = profile.role === "Seller" && profile.sellerId === seller.id;
  const sellerProducts = products.filter((product) => product.sellerId === seller.id);

  function handleProductChange(event) {
    const { name, value } = event.target;
    if (name.startsWith("spec_")) {
      const specField = name.replace("spec_", "");
      setNewProduct((current) => ({
        ...current,
        specs: { ...current.specs, [specField]: value },
      }));
    } else {
      setNewProduct((current) => ({ ...current, [name]: value }));
    }
  }

  function handleProductSubmit(event) {
    event.preventDefault();
    addProduct(newProduct);
    setNewProduct({ name: "", category: "Phones", price: "", stock: "", description: "", image: "", tags: "", specs: {} });
  }

  const currentCategorySpecs = categorySpecs[newProduct.category] || [];

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
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Seller controls</p>
              <h2>Add a new product</h2>
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
              <input name="price" type="number" value={newProduct.price} onChange={handleProductChange} required />
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
              Post product
            </button>
          </form>

          {sellerOrders.length > 0 ? (
            <div style={{ marginTop: "24px" }}>
              <h3>Order status updates</h3>
              {sellerOrders.map((order) => (
                <article key={order.id} className="dashboard-row" style={{ marginBottom: "12px" }}>
                  <div>
                    <strong>{order.productName}</strong>
                    <span>{order.status}</span>
                  </div>
                  <select
                    value={order.status}
                    onChange={(event) => updateOrderStatus(order.id, event.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Arrived">Arrived</option>
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
          <ProductCard
            key={product.id}
            product={product}
            isCompared={compareItems.includes(product.id)}
            isSaved={savedItems.includes(product.id)}
            onToggleCompare={toggleCompareItem}
            onToggleSave={toggleSavedItem}
          />
        ))}
      </section>
    </div>
  );
}

export default SellerPage;
