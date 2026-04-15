import { Link } from "react-router-dom";

function ProductCard({ product, isSaved, isCompared, onToggleCompare, onToggleSave }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap" style={{ "--card-accent": product.accent }}>
        <img src={product.image} alt={product.name} className="product-image" />
        <button className="save-pill" type="button" onClick={() => onToggleSave(product.id)}>
          {isSaved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="product-copy">
        <div className="eyebrow-row">
          <span>{product.category}</span>
          <span>{product.rating} / 5</span>
        </div>

        <h3>{product.name}</h3>
        <p>{product.description}</p>

        <ul className="chip-row" aria-label={`${product.name} highlights`}>
          {product.highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="product-footer">
          <div>
            <strong>${product.price}</strong>
            <span>{product.seller}</span>
          </div>

          <div className="product-actions">
            <button type="button" className="secondary-button" onClick={() => onToggleCompare(product.id)}>
              {isCompared ? "Compared" : "Compare"}
            </button>
            <Link className="action-link" to={`/products/${product.id}`}>
              View product
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
