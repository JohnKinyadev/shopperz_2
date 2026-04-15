import { Link } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function DashboardPage() {
  const { messages, notifications, products, profile, savedItems } = useMarketplace();
  const savedProducts = products.filter((product) => savedItems.includes(product.id));
  const recentMessages = [...messages].slice(-4).reverse();
  const latestNotifications = notifications.slice(0, 3);

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
              <strong>{recentMessages.length}</strong>
              <span>Recent messages</span>
            </Link>
            <Link to="/notifications" className="mini-card">
              <strong>{latestNotifications.length}</strong>
              <span>New updates</span>
            </Link>
            <Link to="/compare" className="mini-card">
              <strong>3</strong>
              <span>Compare slots</span>
            </Link>
            <Link
              to={profile.role === "Seller" && profile.sellerId ? `/sellers/${profile.sellerId}` : "/seller-request"}
              className="mini-card"
            >
              <strong>{profile.role === "Seller" ? "My store" : "Apply"}</strong>
              <span>{profile.role === "Seller" ? "Manage products" : "Become a seller"}</span>
            </Link>
          </div>
        </article>
      </section>

      <div className="dashboard-grid">
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
                    {product.category} • {product.seller}
                  </span>
                </div>
                <span>${product.price}</span>
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
