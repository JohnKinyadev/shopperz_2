import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useMarketplace } from "../context/MarketplaceContext";

function SellerPage() {
  const { sellerId } = useParams();
  const { compareItems, products, savedItems, sellers, toggleCompareItem, toggleSavedItem } =
    useMarketplace();
  const seller = sellers.find((item) => item.id === sellerId);

  if (!seller) {
    return (
      <section className="empty-state">
        <h1>Seller not found</h1>
        <Link to="/">Return to browse</Link>
      </section>
    );
  }

  const sellerProducts = products.filter((product) => product.sellerId === seller.id);

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
