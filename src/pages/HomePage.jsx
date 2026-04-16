import { Link, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import ProductCard from "../components/ProductCard";
import heroImage from "../assets/hero_1.jpg";
import { categories } from "../data/mockData";
import { useMarketplace } from "../context/MarketplaceContext";

function HomePage() {
  const {
    compareItems,
    products,
    savedItems,
    sellers,
    toggleCompareItem,
    toggleSavedItem,
    currentUser,
    profile,
    currentSellerRequest,
  } =
    useMarketplace();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") ?? "";
  const selectedCategory = searchParams.get("category") ?? "All";

  function updateFilters(nextValues) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if ("searchTerm" in nextValues) {
      const nextSearchTerm = nextValues.searchTerm.trim();
      if (nextSearchTerm) {
        nextSearchParams.set("q", nextSearchTerm);
      } else {
        nextSearchParams.delete("q");
      }
    }

    if ("selectedCategory" in nextValues) {
      if (nextValues.selectedCategory && nextValues.selectedCategory !== "All") {
        nextSearchParams.set("category", nextValues.selectedCategory);
      } else {
        nextSearchParams.delete("category");
      }
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = [
        product.name,
        product.description,
        product.seller,
        ...(product.tags ?? []),
        ...Object.values(product.specs ?? {}),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const trendingSellers = sellers.slice(0, 3);
  const featuredSeller = trendingSellers[0] ?? null;
  const sellerShopPath = profile.sellerId
    ? `/sellers/${profile.sellerId}`
    : currentSellerRequest?.sellerId
      ? `/sellers/${currentSellerRequest.sellerId}`
      : "/seller-request";
  const sellerCtaLabel =
    profile.sellerId
      ? "Manage my shop"
      : currentSellerRequest?.status === "Pending"
        ? "Pending"
        : currentSellerRequest?.status === "Approved"
          ? "Manage my shop"
          : "Apply to become a seller";

  return (
    <div className="page-grid">
      <section className="hero-card">
        <div className="hero-media">
          <img src={heroImage} alt="Shopperz featured products" className="hero-image" />
        </div>

        <div className="hero-copy">
          <p className="hero-kicker">Welcome to Shopperz Market</p>
          <h1>Welcome To Your One Place Marketplace For Everything.</h1>
          <p>
            Everything you need, all in one place. Discover unique products, connect with passionate sellers, and experience shopping like never before. Whether you're looking for the latest gadgets, handmade crafts, or vintage treasures, Shopperz Market has it all. Start exploring today and find something special that speaks to you.
          </p>

          <div className="hero-actions">
            <Link to="/wishlist" className="primary-button">
              View wishlist
            </Link>
            <Link to="/compare" className="secondary-button link-button">
              Compare products
            </Link>
            {currentUser.isAuthenticated ? (
              <Link to={sellerCtaLabel === "Pending" ? "/seller-request" : sellerShopPath} className="ghost-button">
                {sellerCtaLabel}
              </Link>
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
            onChange={(event) => updateFilters({ searchTerm: event.target.value })}
            placeholder="Search by product, seller, or use case"
          />
        </label>

        <label>
          <span>Category</span>
          <select
            value={selectedCategory}
            onChange={(event) => updateFilters({ selectedCategory: event.target.value })}
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
          <h2>Compare Products To Your Preference</h2>
          <p>Shortlist up to three products and view their specifications before making a decision</p>
          <Link to="/compare" className="text-link">
            Jump to comparison
          </Link>
        </article>

        <article className="panel spotlight-card">
          <p className="panel-kicker">Live feel</p>
          <h2>See The Listed Stores</h2>
          <p>Each seller has a dedicated storefront page, response-time badge, and conversation history.</p>
          {featuredSeller ? (
            <Link to={`/sellers/${featuredSeller.id}`} className="text-link">
              Explore a seller store
            </Link>
          ) : (
            <span className="text-link">Seller stores will appear once Firestore has data</span>
          )}
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
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isCompared={compareItems.includes(product.id)}
              isSaved={savedItems.includes(product.id)}
              onToggleCompare={toggleCompareItem}
              onToggleSave={toggleSavedItem}
            />
          ))
        ) : (
          <section className="empty-state panel">
            <h2>No products available yet</h2>
            <p>Once Firestore has product documents, featured listings will appear here.</p>
          </section>
        )}
      </section>

      <section className="section-heading">
        <div>
          <p className="panel-kicker">Seller highlights</p>
          <h2>Stores buyers are engaging with</h2>
        </div>
      </section>

      <section className="seller-strip">
        {trendingSellers.length > 0 ? (
          trendingSellers.map((seller) => (
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
          ))
        ) : (
          <article className="panel seller-teaser">
            <p className="panel-kicker">Seller highlights</p>
            <h3>No seller data yet</h3>
            <p>Enable Firestore writes and seed or add sellers so storefront cards can render here.</p>
          </article>
        )}
      </section>
    </div>
  );
}

export default HomePage;
