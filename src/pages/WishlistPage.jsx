import { Link } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function WishlistPage() {
  const { products, savedItems, toggleCompareItem, toggleSavedItem, currentUser, profile } = useMarketplace();
  const savedProducts = products.filter((product) => savedItems.includes(product.id));
  const shouldHideSellerName = !currentUser.isAuthenticated || profile.role === "Buyer";

  if (!savedProducts.length) {
    return (
      <section className="empty-state">
        <h1>Your wishlist is empty</h1>
        <p>Save a few products from the browse page to build a shortlist.</p>
        <Link to="/" className="primary-button">
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <div className="page-grid">
      <section className="section-heading">
        <div>
          <p className="panel-kicker">Wishlist</p>
          <h1>Saved products for later</h1>
        </div>
      </section>

      <section className="wishlist-grid">
        {savedProducts.map((product) => (
          <article key={product.id} className="panel wishlist-card">
            <img src={product.image} alt={product.name} className="wishlist-image" />
            <div className="wishlist-copy">
              <p className="panel-kicker">{product.category}</p>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <div className="seller-meta">
                <span>${product.price}</span>
                <span>{shouldHideSellerName ? "Seller shown in product view" : product.seller}</span>
              </div>
              <div className="inline-actions">
                <Link to={`/products/${product.id}`} className="action-link">
                  View details
                </Link>
                <button type="button" className="secondary-button" onClick={() => toggleCompareItem(product.id)}>
                  Compare
                </button>
                <button type="button" className="ghost-button" onClick={() => toggleSavedItem(product.id)}>
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default WishlistPage;
