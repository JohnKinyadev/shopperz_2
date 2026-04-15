import { useMarketplace } from "../context/MarketplaceContext";

function NotificationsPage() {
  const { markAllNotificationsRead, markNotificationRead, notifications } = useMarketplace();

  return (
    <div className="page-grid">
      <section className="section-heading">
        <div>
          <p className="panel-kicker">Notifications</p>
          <h1>Recent marketplace activity</h1>
        </div>
        <button type="button" className="secondary-button" onClick={markAllNotificationsRead}>
          Mark all as read
        </button>
      </section>

      <section className="notification-list">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`panel notification-card ${notification.read ? "notification-read" : ""}`}
          >
            <div>
              <p className="panel-kicker">{notification.type}</p>
              <h2>{notification.title}</h2>
              <p>{notification.description}</p>
            </div>
            <div className="notification-actions">
              <span>{notification.time}</span>
              {!notification.read ? (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => markNotificationRead(notification.id)}
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default NotificationsPage;
