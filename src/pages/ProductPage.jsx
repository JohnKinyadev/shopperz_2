import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AIAssistantCard from "../components/AIAssistantCard";
import ChatPanel from "../components/ChatPanel";
import { useMarketplace } from "../context/MarketplaceContext";
import { formatCurrency, getProductSpecEntries } from "../lib/productUtils";

function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const {
    authError,
    compareItems,
    currentUser,
    getAvailableStock,
    messages,
    orders,
    placeOrder,
    products,
    profile,
    reviews,
    savedItems,
    sellers,
    sendMessage,
    toggleCompareItem,
    toggleSavedItem,
    cancelOrder,
  } = useMarketplace();
  const product = products.find((item) => item.id === productId);
  const [orderForm, setOrderForm] = useState({
    quantity: "1",
    recipientName: profile.name || "",
    phone: "",
    deliveryLocation: profile.location || "",
    pickupArea: "Nairobi CBD",
    deliveryNotes: "",
    paymentMethod: "Cash on Delivery",
  });

  useEffect(() => {
    setOrderForm((current) => ({
      ...current,
      recipientName: profile.name || current.recipientName,
      deliveryLocation: profile.location || current.deliveryLocation,
    }));
  }, [profile.location, profile.name]);

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
  const productSpecs = getProductSpecEntries(product.category, product.specs);
  const availableStock = getAvailableStock(product.id);
  const myProductOrders = useMemo(() => {
    if (!currentUser.isAuthenticated) {
      return [];
    }

    return orders.filter(
      (order) =>
        order.productId === product.id
        && order.buyerEmail === (currentUser.user?.email || profile.email),
    );
  }, [currentUser.isAuthenticated, currentUser.user?.email, orders, product.id, profile.email]);

  function handleSaveItem() {
    const saved = toggleSavedItem(product.id);
    if (saved === false) {
      navigate("/auth");
    }
  }

  function handleOrderFieldChange(event) {
    const { name, value } = event.target;
    setOrderForm((current) => ({ ...current, [name]: value }));
  }

  function handlePlaceOrder(event) {
    event.preventDefault();
    const orderId = placeOrder({
      productId: product.id,
      quantity: orderForm.quantity,
      recipientName: orderForm.recipientName,
      phone: orderForm.phone,
      deliveryLocation: orderForm.deliveryLocation,
      pickupArea: orderForm.pickupArea,
      deliveryNotes: orderForm.deliveryNotes,
      paymentMethod: orderForm.paymentMethod,
    });

    if (orderId === false && !currentUser.isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (orderId) {
      setOrderForm((current) => ({
        ...current,
        quantity: "1",
        deliveryNotes: "",
      }));
    }
  }

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
              <strong>{formatCurrency(product.price)}</strong>
            </article>
            <article>
              <span>Rating</span>
              <strong>{product.rating ?? 4.7} / 5</strong>
            </article>
            <article>
              <span>Available stock</span>
              <strong>{availableStock} units</strong>
            </article>
          </div>

          <ul className="chip-row" aria-label={`${product.name} tags`}>
            {productTags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          {productSpecs.length > 0 ? (
            <div>
              <p className="panel-kicker">Category features</p>
              <ul className="feature-list" aria-label={`${product.name} specifications`}>
                {productSpecs.map((spec) => (
                  <li key={spec.field}>
                    {spec.label}: {spec.value}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="detail-actions">
            <button className="primary-button" type="button" onClick={handleSaveItem}>
              {savedItems.includes(product.id) ? "Remove from saved" : "Save item"}
            </button>
            <button className="secondary-button" type="button" onClick={() => toggleCompareItem(product.id)}>
              {compareItems.includes(product.id) ? "Remove from compare" : "Add to compare"}
            </button>
          </div>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="panel-kicker">Purchase flow</p>
                <h3>Place an order</h3>
              </div>
              <span className="status-badge">{availableStock} available</span>
            </div>

            {currentUser.isAuthenticated ? (
              <form className="auth-form" onSubmit={handlePlaceOrder}>
                <label>
                  <span>Quantity</span>
                  <input
                    name="quantity"
                    type="number"
                    min="1"
                    max={Math.max(1, availableStock)}
                    value={orderForm.quantity}
                    onChange={handleOrderFieldChange}
                    required
                  />
                </label>

                <label>
                  <span>Recipient name</span>
                  <input
                    name="recipientName"
                    value={orderForm.recipientName}
                    onChange={handleOrderFieldChange}
                    required
                  />
                </label>

                <label>
                  <span>Phone number</span>
                  <input
                    name="phone"
                    value={orderForm.phone}
                    onChange={handleOrderFieldChange}
                    placeholder="0712 345 678"
                    required
                  />
                </label>

                <label>
                  <span>Delivery location</span>
                  <input
                    name="deliveryLocation"
                    value={orderForm.deliveryLocation}
                    onChange={handleOrderFieldChange}
                    placeholder="Town or neighbourhood"
                    required
                  />
                </label>

                <label>
                  <span>Pickup point area</span>
                  <input
                    name="pickupArea"
                    value={orderForm.pickupArea}
                    onChange={handleOrderFieldChange}
                    placeholder="Where Shopperz team will route delivery"
                    required
                  />
                </label>

                <label>
                  <span>Payment method</span>
                  <select name="paymentMethod" value={orderForm.paymentMethod} onChange={handleOrderFieldChange}>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Card on Pickup">Card on Pickup</option>
                  </select>
                </label>

                <label>
                  <span>Delivery notes</span>
                  <input
                    name="deliveryNotes"
                    value={orderForm.deliveryNotes}
                    onChange={handleOrderFieldChange}
                    placeholder="Landmark, preferred time, or pickup instructions"
                  />
                </label>

                <div className="seller-meta">
                  <span>Order total</span>
                  <strong>{formatCurrency(Number(product.price) * Number(orderForm.quantity || 0))}</strong>
                </div>

                <button className="primary-button" type="submit" disabled={availableStock < 1}>
                  {availableStock < 1 ? "Out of stock" : "Place order"}
                </button>

                {authError ? <p className="error-message">{authError}</p> : null}
              </form>
            ) : (
              <div className="page-grid">
                <p>Sign in to place an order, track delivery updates, and manage cancellations.</p>
                <Link to="/auth" className="primary-button link-button">
                  Sign in to buy
                </Link>
              </div>
            )}
          </section>

          {myProductOrders.length > 0 ? (
            <section className="panel">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">My orders</p>
                  <h3>Tracking for this product</h3>
                </div>
              </div>

              <div className="dashboard-list">
                {myProductOrders.map((order) => (
                  <article key={order.id} className="dashboard-row">
                    <div>
                      <strong>{order.status}</strong>
                      <span>
                        {order.quantity} item(s) for {order.pickupArea} - {formatCurrency(order.totalPrice)}
                      </span>
                    </div>
                    {[ "Pending", "Accepted", "Preparing" ].includes(order.status) ? (
                      <button type="button" className="ghost-button" onClick={() => cancelOrder(order.id)}>
                        Cancel order
                      </button>
                    ) : (
                      <span>{order.updatedAt || order.createdAt}</span>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

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
