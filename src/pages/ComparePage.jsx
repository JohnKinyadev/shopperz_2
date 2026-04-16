import { Link } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatCurrency, getProductSpecEntries } from "../lib/productUtils";

function ComparePage() {
  const { compareItems, products, toggleCompareItem, toggleSavedItem } = useMarketplace();
  const comparedProducts = products.filter((product) => compareItems.includes(product.id));

  return (
    <div className="page-grid">
      <section className="section-heading">
        <div>
          <p className="panel-kicker">Compare</p>
          <h1>Side-by-side shortlist</h1>
        </div>
        <span>{comparedProducts.length} of 3 slots used</span>
      </section>

      <section className="compare-grid">
        {comparedProducts.map((product) => {
          const comparedSpecs = getProductSpecEntries(product.category, product.specs);
          const compareFeatures = comparedSpecs.length
            ? comparedSpecs.map((spec) => `${spec.label}: ${spec.value}`)
            : (product.highlights ?? []);

          return (
            <article key={product.id} className="panel compare-card">
              <img src={product.image} alt={product.name} className="compare-image" />
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <div className="compare-metrics">
                <span>{formatCurrency(product.price)}</span>
                <span>{product.rating ?? 4.7} / 5</span>
                <span>{product.stock} in stock</span>
              </div>
              <ul className="feature-list">
                {compareFeatures.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="inline-actions">
                <Link to={`/products/${product.id}`} className="action-link">
                  Open product
                </Link>
                <button type="button" className="secondary-button" onClick={() => toggleSavedItem(product.id)}>
                  Save
                </button>
                <button type="button" className="ghost-button" onClick={() => toggleCompareItem(product.id)}>
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {!comparedProducts.length ? (
        <section className="empty-state">
          <h2>No products in compare yet</h2>
          <p>Add products from browsing or the wishlist to compare them here.</p>
          <Link to="/" className="primary-button">
            Browse products
          </Link>
        </section>
      ) : null}
    </div>
  );
}

export default ComparePage;
