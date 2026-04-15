import { Link, useParams } from "react-router-dom";
import AIAssistantCard from "../components/AIAssistantCard";
import ChatPanel from "../components/ChatPanel";
import { useMarketplace } from "../context/MarketplaceContext";

function ProductPage() {
  const { productId } = useParams();
  const {
    compareItems,
    messages,
    products,
    profile,
    reviews,
    savedItems,
    sellers,
    sendMessage,
    toggleCompareItem,
    toggleSavedItem,
  } = useMarketplace();
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return (
      <section className="empty-state">
        <h1>Product not found</h1>
        <Link to="/">Return to browse</Link>
      </section>
    );
  }

  const seller = sellers.find((item) => item.id === product.sellerId);
  const productMessages = messages.filter((item) => item.productId === product.id);
  const productReviews = reviews.filter((item) => item.productId === product.id);
  const productTags = product.tags ?? [];

  return (
    <div className="product-page">
      <section className="product-hero">
        <img src={product.image} alt={product.name} className="detail-image" />

        <div className="detail-copy">
          <p className="panel-kicker">{product.category}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>

          <div className="detail-meta">
            <article>
              <span>Price</span>
              <strong>${product.price}</strong>
            </article>
            <article>
              <span>Rating</span>
              <strong>{product.rating ?? 4.7} / 5</strong>
            </article>
            <article>
              <span>Stock</span>
              <strong>{product.stock} units</strong>
            </article>
          </div>

          <ul className="chip-row" aria-label={`${product.name} tags`}>
            {productTags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          <div className="detail-actions">
            <button className="primary-button" type="button" onClick={() => toggleSavedItem(product.id)}>
              {savedItems.includes(product.id) ? "Remove from saved" : "Save item"}
            </button>
            <button className="secondary-button" type="button" onClick={() => toggleCompareItem(product.id)}>
              {compareItems.includes(product.id) ? "Remove from compare" : "Add to compare"}
            </button>
          </div>

          {seller ? (
            <article className="seller-inline-card">
              <div>
                <p className="panel-kicker">Seller store</p>
                <h3>{seller.name}</h3>
                <p>{seller.tagline}</p>
              </div>
              <div className="seller-meta">
                <span>{seller.rating} / 5 rating</span>
                <span>{seller.responseTime}</span>
              </div>
              <Link to={`/sellers/${seller.id}`} className="text-link">
                Visit seller store
              </Link>
            </article>
          ) : null}
        </div>
      </section>

      <section className="detail-columns">
        <AIAssistantCard product={product} profile={profile} />
        <ChatPanel
          messages={productMessages}
          onSendMessage={(text) => sendMessage(product.id, text)}
          sellerName={product.seller}
          sellerResponseTime={product.sellerResponseTime}
        />
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="panel-kicker">Buyer reviews</p>
            <h2>What shoppers are saying</h2>
          </div>
        </div>

        <div className="review-grid">
          {productReviews.map((review) => (
            <article key={review.id} className="review-card">
              <strong>{review.author}</strong>
              <span>{review.rating} / 5 • {review.time}</span>
              <p>{review.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductPage;
