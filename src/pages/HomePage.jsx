import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import heroImage from "../assets/hero_1.jpg";
import { categories } from "../data/mockData";
import { useMarketplace } from "../context/MarketplaceContext";

function HomePage() {
  const { compareItems, products, savedItems, sellers, toggleCompareItem, toggleSavedItem, currentUser, profile } =
    useMarketplace();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = [product.name, product.description, product.seller, ...product.tags]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const trendingSellers = sellers.slice(0, 3);

  return (
    <div className="page-grid">
      <section className="hero-card">
        <div className="hero-media">
          <img src={heroImage} alt="Shopperz featured products" className="hero-image" />
        </div>

        <div className="hero-copy">
          <p className="hero-kicker">Frontend capstone</p>
          <h1>Shop your shortlist with pink energy, quick seller chat, and guided AI help.</h1>
          <p>
            This frontend demo now covers browsing, compare flows, seller storefronts, saved
            products, notifications, and an AI assistant experience without needing backend setup.
          </p>

          <div className="hero-actions">
            <Link to="/wishlist" className="primary-button">
              View wishlist
            </Link>
            <Link to="/compare" className="secondary-button link-button">
              Open compare
            </Link>
            {currentUser.isAuthenticated ? (
              profile.role === "Seller" ? (
                <Link to={`/sellers/${profile.sellerId}`} className="ghost-button">
                  My {profile.sellerName || "shop"}
                </Link>
              ) : (
                <Link to="/seller-request" className="ghost-button">
                  Become a seller
                </Link>
              )
            ) : null}
          </div>
        </div>
      </section>

      <section className="filter-bar">
        <label>
          <span>Search products</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by product, seller, or use case"
          />
        </label>

        <label>
          <span>Category</span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="All">All</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="spotlight-grid">
        <article className="panel spotlight-card">
          <p className="panel-kicker">Smart shopping</p>
          <h2>Built-in compare flow</h2>
          <p>Shortlist up to three products and view their strengths side by side before messaging a seller.</p>
          <Link to="/compare" className="text-link">
            Jump to comparison
          </Link>
        </article>

        <article className="panel spotlight-card">
          <p className="panel-kicker">Live feel</p>
          <h2>Seller-first experience</h2>
          <p>Each seller has a dedicated storefront page, response-time badge, and conversation history.</p>
          <Link to={`/sellers/${trendingSellers[0].id}`} className="text-link">
            Explore a seller store
          </Link>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <p className="panel-kicker">Product browsing</p>
          <h2>Featured listings</h2>
        </div>
        <span>{visibleProducts.length} items</span>
      </section>

      <section className="product-grid">
        {visibleProducts.map((product) => (
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

      <section className="section-heading">
        <div>
          <p className="panel-kicker">Seller highlights</p>
          <h2>Stores buyers are engaging with</h2>
        </div>
      </section>

      <section className="seller-strip">
        {trendingSellers.map((seller) => (
          <article key={seller.id} className="panel seller-teaser">
            <p className="panel-kicker">{seller.location}</p>
            <h3>{seller.name}</h3>
            <p>{seller.tagline}</p>
            <div className="seller-meta">
              <span>{seller.rating} / 5 rating</span>
              <span>{seller.responseTime}</span>
            </div>
            <Link to={`/sellers/${seller.id}`} className="text-link">
              Visit store
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

export default HomePage;
