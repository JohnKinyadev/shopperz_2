import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function AdminPage() {
  const navigate = useNavigate();
  const { currentUser, profile, sellerRequests, approveSellerRequest, rejectSellerRequest } = useMarketplace();

  useEffect(() => {
    if (!currentUser.isAuthenticated || !currentUser.isAdmin) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  if (!currentUser.isAuthenticated || !currentUser.isAdmin) {
    return null;
  }

  const pendingRequests = sellerRequests.filter((request) => request.status === "Pending");
  const reviewedRequests = sellerRequests.filter((request) => request.status !== "Pending");

  return (
    <div className="page-grid">
      <section className="dashboard-hero">
        <article className="panel profile-card">
          <p className="panel-kicker">Admin dashboard</p>
          <h1>{profile.name}</h1>
          <p>Approve sellers and manage the marketplace.</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Pending requests</p>
            <h2>{pendingRequests.length} seller requests</h2>
          </div>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="empty-state">
            <h2>No pending seller requests</h2>
            <p>Seller applications will appear here when users request access.</p>
          </div>
        ) : (
          <div className="dashboard-list">
            {pendingRequests.map((request) => (
              <article key={request.id} className="dashboard-row">
                <div>
                  <strong>{request.storeName}</strong>
                  <span>{request.location} • {request.responseTime}</span>
                  <p>{request.tagline}</p>
                  <small>{request.requesterEmail}</small>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => approveSellerRequest(request.id)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => rejectSellerRequest(request.id)}
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">Reviewed requests</p>
            <h2>{reviewedRequests.length} processed</h2>
          </div>
        </div>

        <div className="dashboard-list">
          {reviewedRequests.map((request) => (
            <article key={request.id} className="dashboard-row">
              <div>
                <strong>{request.storeName}</strong>
                <span>{request.status}</span>
                <p>{request.location}</p>
              </div>
              <Link to="/dashboard" className="text-link">
                View dashboard
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminPage;
