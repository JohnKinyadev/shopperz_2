import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useMarketplace } from "../context/MarketplaceContext";
import { getMarketplaceSuggestions } from "../lib/ai";
import { formatCurrency } from "../lib/productUtils";

const filters = ["All", "Orders", "Product inquiries", "System updates"];

function findRelatedProduct(text, products) {
  const lowerText = text.toLowerCase();
  return products.find((product) => lowerText.includes(product.name.toLowerCase())) ?? null;
}

function buildOrderTitle(status) {
  if (status === "Accepted") return "Order accepted";
  if (status === "Preparing") return "Order being prepared";
  if (status === "Dispatched") return "Order dispatched";
  if (status === "Delivered") return "Order delivered to pickup point";
  if (status === "Completed") return "Order completed";
  if (status === "Cancelled") return "Order cancelled";
  return "Order update";
}

function getSellerNextAction(order) {
  const nextActionByStatus = {
    Pending: { label: "Accept order", status: "Accepted" },
    Accepted: { label: "Start dispatch", status: "Preparing" },
    Preparing: { label: "Mark dispatched", status: "Dispatched" },
    Dispatched: { label: "Mark delivered", status: "Delivered" },
    Delivered: { label: "Mark completed", status: "Completed" },
  };

  return nextActionByStatus[order.status] || null;
}

function MessagesPage() {
  const {
    cancelOrder,
    currentUser,
    messages,
    notifications,
    orders,
    products,
    profile,
    sellers,
    updateOrderStatus,
  } = useMarketplace();
  const [activeFilter, setActiveFilter] = useState("All");
  const currentEmail = currentUser.user?.email || profile.email;
  const currentSellerId = profile.sellerId;

  const aiSuggestions = useMemo(() => {
    if (profile.role !== "Buyer") {
      return [];
    }

    return getMarketplaceSuggestions(products, profile, 3);
  }, [products, profile]);

  const visibleMessages = useMemo(() => {
    if (!currentUser.isAuthenticated) {
      return [];
    }

    return messages.filter((message) => {
      const product = products.find((item) => item.id === message.productId);
      if (!product) return false;

      if (profile.role === "Buyer") {
        return message.senderName === profile.name;
      }

      return product.sellerId === currentSellerId || message.senderName === profile.name;
    });
  }, [currentSellerId, currentUser.isAuthenticated, messages, products, profile.name, profile.role]);

  const visibleOrders = useMemo(() => {
    if (!currentUser.isAuthenticated) {
      return [];
    }

    return orders.filter((order) => {
      const isBuyerOrder = order.buyerEmail === currentEmail;
      const isSellerOrder = order.sellerId === currentSellerId;

      if (profile.role === "Buyer") {
        return isBuyerOrder;
      }

      return isBuyerOrder || isSellerOrder;
    });
  }, [currentEmail, currentSellerId, currentUser.isAuthenticated, orders, profile.role]);

  const visibleNotifications = useMemo(() => {
    if (!currentUser.isAuthenticated) {
      return [];
    }

    return notifications.filter((notification) => {
      if (profile.role === "Buyer") {
        return notification.targetUserEmail === currentEmail;
      }

      const isTargetedToBuyer = notification.targetUserEmail === currentEmail;
      const isTargetedToSeller = notification.targetSellerId === currentSellerId;
      return isTargetedToBuyer || isTargetedToSeller;
    });
  }, [currentEmail, currentSellerId, currentUser.isAuthenticated, notifications, profile.role]);

  const updates = useMemo(() => {
    const productInquiryUpdates = [...visibleMessages]
      .reverse()
      .map((message) => {
        const product = products.find((item) => item.id === message.productId);

        if (!product) {
          return null;
        }

        const seller = sellers.find((item) => item.id === product.sellerId);
        return {
          id: `message-${message.id}`,
          filter: "Product inquiries",
          kicker: message.sender === "seller" ? "Seller reply" : "Product inquiry",
          title: message.sender === "seller" ? "Seller replied" : "Product inquiry sent",
          description: `${product.name}: ${message.text}`,
          time: message.time,
          image: product.image,
          meta: `${message.senderName} - ${product.category}`,
          primaryHref: `/products/${product.id}`,
          primaryLabel: "Open product",
          secondaryHref: seller ? `/sellers/${seller.id}` : null,
          secondaryLabel: seller ? "View seller" : null,
        };
      })
      .filter(Boolean);

    const orderUpdates = [...visibleOrders]
      .reverse()
      .map((order) => {
        const product = products.find((item) => item.id === order.productId);
        const seller = sellers.find((item) => item.id === order.sellerId);
        const isSellerOrder = order.sellerId === currentSellerId;
        const sellerAction = isSellerOrder ? getSellerNextAction(order) : null;
        const canBuyerCancel =
          order.buyerEmail === currentEmail
          && ["Pending", "Accepted", "Preparing"].includes(order.status);

        return {
          id: `order-${order.id}`,
          filter: "Orders",
          kicker: isSellerOrder ? "Store order" : "Order progress",
          title: buildOrderTitle(order.status),
          description: `${order.productName} - ${order.quantity} item(s) for ${order.pickupArea}.`,
          time: order.updatedAt || order.createdAt || "Just now",
          image: product?.image || seller?.coverImage || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
          meta: isSellerOrder
            ? `${order.buyerName} - ${order.deliveryLocation}`
            : `${seller?.name || order.sellerName} - ${formatCurrency(order.totalPrice)}`,
          primaryHref: product ? `/products/${product.id}` : "/",
          primaryLabel: product ? "Open product" : "Browse products",
          secondaryHref: seller ? `/sellers/${seller.id}` : null,
          secondaryLabel: seller ? "View seller" : null,
          order,
          sellerAction,
          canBuyerCancel,
        };
      });

    const systemUpdates = visibleNotifications.map((notification) => {
      const relatedProduct = findRelatedProduct(
        `${notification.title} ${notification.description}`,
        products,
      );
      const relatedSeller = relatedProduct
        ? sellers.find((seller) => seller.id === relatedProduct.sellerId)
        : null;

      return {
        id: `notification-${notification.id}`,
        filter: "System updates",
        kicker: notification.type === "assistant" ? "AI suggestion" : "Marketplace update",
        title: notification.title,
        description: notification.description,
        time: notification.time,
        image: relatedProduct?.image || relatedSeller?.coverImage || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
        meta: notification.type,
        primaryHref: relatedProduct ? `/products/${relatedProduct.id}` : "/notifications",
        primaryLabel: relatedProduct ? "Open product" : "Open notifications",
        secondaryHref: relatedSeller ? `/sellers/${relatedSeller.id}` : null,
        secondaryLabel: relatedSeller ? "View seller" : null,
      };
    });

    return [...productInquiryUpdates, ...orderUpdates, ...systemUpdates];
  }, [currentEmail, currentSellerId, products, sellers, visibleMessages, visibleNotifications, visibleOrders]);

  const filteredUpdates = activeFilter === "All"
    ? updates
    : updates.filter((item) => item.filter === activeFilter);

  return (
    <div className="page-grid">
      <section className="section-heading">
        <div>
          <p className="panel-kicker">Updates & Conversations</p>
          <h1>Track product activity without live chat</h1>
          <p className="section-support">
            Follow your own product inquiries, order movement, and marketplace nudges from one place.
          </p>
        </div>
        <span>{filteredUpdates.length} visible updates</span>
      </section>

      {currentUser.isAuthenticated && profile.role === "Buyer" && aiSuggestions.length > 0 ? (
        <section className="page-grid">
          <div className="section-heading">
            <div>
              <p className="panel-kicker">AI Suggestions</p>
              <h2>Products matched to your preference</h2>
            </div>
            <span>{aiSuggestions.length} picks</span>
          </div>

          <div className="ai-suggestion-grid">
            {aiSuggestions.map(({ product, reason, matches }) => {
              const seller = sellers.find((item) => item.id === product.sellerId);

              return (
                <article key={`suggestion-${product.id}`} className="panel ai-suggestion-card">
                  <img src={product.image} alt={product.name} className="update-image" />
                  <div className="ai-suggestion-copy">
                    <div className="panel-heading">
                      <div>
                        <p className="panel-kicker">AI product pick</p>
                        <h3>{product.name}</h3>
                      </div>
                      <span className="status-badge">{product.category}</span>
                    </div>
                    <p>{reason}</p>
                    <div className="chip-row">
                      {(matches.length > 0 ? matches : product.highlights?.slice(0, 2) || []).map((item) => (
                        <span key={`${product.id}-${item}`} className="suggestion-chip">
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="inline-actions">
                      <Link to={`/products/${product.id}`} className="action-link">
                        View product
                      </Link>
                      {seller ? (
                        <Link to={`/sellers/${seller.id}`} className="secondary-button link-button">
                          View seller
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="panel updates-toolbar">
        <div>
          <p className="panel-kicker">Filters</p>
          <h2>Choose what you want to review</h2>
        </div>
        <div className="filter-chip-row">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`filter-chip ${activeFilter === filter ? "filter-chip-active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {filteredUpdates.length > 0 ? (
        <section className="update-list">
          {filteredUpdates.map((update) => (
            <article key={update.id} className="panel update-card">
              <img src={update.image} alt={update.title} className="update-image" />
              <div className="update-copy">
                <div className="panel-heading">
                  <div>
                    <p className="panel-kicker">{update.kicker}</p>
                    <h2>{update.title}</h2>
                  </div>
                  <span className="status-badge">{update.time}</span>
                </div>
                <p>{update.description}</p>
                <div className="seller-meta">
                  <span>{update.filter}</span>
                  <span>{update.meta}</span>
                </div>
                <div className="inline-actions">
                  <Link to={update.primaryHref} className="action-link">
                    {update.primaryLabel}
                  </Link>
                  {update.secondaryHref ? (
                    <Link to={update.secondaryHref} className="secondary-button link-button">
                      {update.secondaryLabel}
                    </Link>
                  ) : null}
                  {update.filter === "Orders" && update.sellerAction ? (
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => updateOrderStatus(update.order.id, update.sellerAction.status)}
                    >
                      {update.sellerAction.label}
                    </button>
                  ) : null}
                  {update.filter === "Orders" && update.canBuyerCancel ? (
                    <button
                      type="button"
                      className="ghost-button"
                      onClick={() => cancelOrder(update.order.id)}
                    >
                      Cancel order
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="empty-state panel">
          <h2>No updates in this filter yet</h2>
          <p>Switch filters or browse products to generate more activity in this workspace.</p>
          <Link to="/" className="primary-button">
            Browse products
          </Link>
        </section>
      )}
    </div>
  );
}

export default MessagesPage;
