import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useMarketplace } from "../context/MarketplaceContext";

function MessagesPage() {
  const { messages, products } = useMarketplace();

  const threads = useMemo(() => {
    const map = new Map();

    messages.forEach((message) => {
      const product = products.find((item) => item.id === message.productId);

      if (!product) {
        return;
      }

      const current = map.get(message.productId);
      map.set(message.productId, {
        product,
        count: (current?.count ?? 0) + 1,
        lastMessage: message,
      });
    });

    return [...map.values()].reverse();
  }, [messages, products]);

  return (
    <div className="page-grid">
      <section className="section-heading">
        <div>
          <p className="panel-kicker">Messages</p>
          <h1>Conversation threads</h1>
        </div>
      </section>

      <section className="thread-list">
        {threads.map((thread) => (
          <article key={thread.product.id} className="panel thread-card">
            <img src={thread.product.image} alt={thread.product.name} className="thread-image" />
            <div className="thread-copy">
              <div className="panel-heading">
                <div>
                  <p className="panel-kicker">{thread.product.seller}</p>
                  <h2>{thread.product.name}</h2>
                </div>
                <span className="status-badge">{thread.count} messages</span>
              </div>
              <p>{thread.lastMessage.text}</p>
              <div className="seller-meta">
                <span>{thread.lastMessage.senderName}</span>
                <span>{thread.lastMessage.time}</span>
              </div>
              <Link to={`/products/${thread.product.id}`} className="text-link">
                Open product chat
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default MessagesPage;
