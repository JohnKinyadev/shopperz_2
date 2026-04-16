import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useMarketplace } from "../context/MarketplaceContext";
import { canBuyerCancelOrder } from "../lib/orderUtils";
import { formatCurrency } from "../lib/productUtils";

function DashboardPage() {
  const {
    cancelOrder,
    compareItems,
    currentSellerRequest,
    messages,
    notifications,
    orders,
    products,
    profile,
    savedItems,
    currentUser,
  } = useMarketplace();
  const currentEmail = currentUser.user?.email || profile.email;
  const currentSellerId = profile.sellerId;
  const savedProducts = products.filter((product) => savedItems.includes(product.id));
  const recentMessages = useMemo(() => {
    if (!currentUser.isAuthenticated) {
      return [];
    }

    return [...messages]
      .filter((message) => {
        const product = products.find((item) => item.id === message.productId);
        if (!product) return false;

        if (profile.role === "Buyer") {
          return message.senderName === profile.name;
        }

        return product.sellerId === currentSellerId || message.senderName === profile.name;
      })
      .slice(-4)
      .reverse();
  }, [currentSellerId, currentUser.isAuthenticated, messages, products, profile.name, profile.role]);
  const latestNotifications = useMemo(() => {
    if (!currentUser.isAuthenticated) {
      return [];
    }

    return notifications
      .filter((notification) => {
        if (profile.role === "Buyer") {
          return notification.targetUserEmail === currentEmail;
        }

        return notification.targetUserEmail === currentEmail || notification.targetSellerId === currentSellerId;
      })
      .slice(0, 3);
  }, [currentEmail, currentSellerId, currentUser.isAuthenticated, notifications, profile.role]);
  const myOrders = useMemo(() => {
    if (!currentUser.isAuthenticated) {
      return [];
    }

    return orders.filter((order) => order.buyerEmail === currentEmail);
  }, [currentEmail, currentUser.isAuthenticated, orders]);
  const updateCount = recentMessages.length + latestNotifications.length + myOrders.length;
  const shouldHideSellerName = profile.role === "Buyer";
  const sellerShopPath = profile.sellerId
    ? `/sellers/${profile.sellerId}`
    : currentSellerRequest?.sellerId
      ? `/sellers/${currentSellerRequest.sellerId}`
      : "/seller-request";
  const sellerCardTitle =
    profile.sellerId
      ? "My store"
      : currentSellerRequest?.status === "Pending"
        ? "Pending"
        : currentSellerRequest?.status === "Approved"
          ? "My store"
          : "Apply";
  const sellerCardText =
    profile.sellerId
      ? "Manage my shop"
      : currentSellerRequest?.status === "Pending"
        ? "Seller request pending"
        : currentSellerRequest?.status === "Approved"
          ? "Manage my shop"
          : "Apply to become a seller";

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <article className="panel profile-card">
          <p className="panel-kicker">User dashboard</p>
          <h1>{profile.name}</h1>
          <p>
            {profile.role} based in {profile.location}
          </p>
          <div className="profile-preference">
            <span>Shopping preference</span>
            <strong>{profile.preference}</strong>
          </div>
        </article>

        <article className="panel quick-links-card">
          <p className="panel-kicker">Quick actions</p>
          <h2>Keep your shopping flow moving</h2>
          <div className="quick-link-grid">
            <Link to="/wishlist" className="mini-card">
              <strong>{savedProducts.length}</strong>
              <span>Saved products</span>
            </Link>
            <Link to="/messages" className="mini-card">
              <strong>{updateCount}</strong>
              <span>Updates & conversations</span>
            </Link>
            <Link to="/notifications" className="mini-card">
              <strong>{latestNotifications.length}</strong>
              <span>New updates</span>
            </Link>
            <Link to="/compare" className="mini-card">
              <strong>{compareItems.length}</strong>
              <span>Compare slots</span>
            </Link>
            <Link
              to={currentSellerRequest?.status === "Pending" ? "/seller-request" : sellerShopPath}
              className="mini-card"
            >
              <strong>{sellerCardTitle}</strong>
              <span>{sellerCardText}</span>
            </Link>
          </div>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Orders</p>
              <h2>{myOrders.length} tracked purchases</h2>
            </div>
          </div>

          <div className="dashboard-list">
            {myOrders.length > 0 ? (
              myOrders.map((order) => (
                <article key={order.id} className="dashboard-row">
                  <div>
                    <strong>{order.productName}</strong>
                    <span>
                      {order.status} - {order.quantity} item(s) to {order.pickupArea}
                    </span>
                  </div>
                  {canBuyerCancelOrder(order.status) ? (
                    <button type="button" className="ghost-button" onClick={() => cancelOrder(order.id)}>
                      Cancel order
                    </button>
                  ) : (
                    <span>{formatCurrency(order.totalPrice)}</span>
                  )}
                </article>
              ))
            ) : (
              <article className="dashboard-row">
                <div>
                  <strong>No purchases yet</strong>
                  <span>Orders you place will appear here for tracking.</span>
                </div>
              </article>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Saved items</p>
              <h2>{savedProducts.length} shortlisted products</h2>
            </div>
          </div>

          <div className="dashboard-list">
            {savedProducts.map((product) => (
              <article key={product.id} className="dashboard-row">
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {product.category} - {shouldHideSellerName ? "Seller shown in product view" : product.seller}
                  </span>
                </div>
                <span>{formatCurrency(product.price)}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Messages</p>
              <h2>Latest conversation activity</h2>
            </div>
          </div>

          <div className="dashboard-list">
            {recentMessages.map((message) => (
              <article key={message.id} className="dashboard-row">
                <div>
                  <strong>{message.senderName}</strong>
                  <span>{message.text}</span>
                </div>
                <span>{message.time}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="panel-kicker">Notifications</p>
              <h2>What changed since your last visit</h2>
            </div>
          </div>

          <div className="dashboard-list">
            {latestNotifications.map((notification) => (
              <article key={notification.id} className="dashboard-row">
                <div>
                  <strong>{notification.title}</strong>
                  <span>{notification.description}</span>
                </div>
                <span>{notification.time}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
