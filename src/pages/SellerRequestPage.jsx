import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function SellerRequestPage() {
  const navigate = useNavigate();
  const { becomeSeller, sellerRequests, currentUser, profile, authError } = useMarketplace();
  const [form, setForm] = useState({
    storeName: "",
    location: "",
    responseTime: "Usually replies in 15 min",
    tagline: "",
    coverImage: "",
  });

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!currentUser.isAuthenticated) {
      navigate("/auth");
    }
  }, [currentUser.isAuthenticated, navigate]);

  // Redirect to seller store if already a seller
  useEffect(() => {
    if (currentUser.isAuthenticated && currentUser.role === "Seller") {
      navigate(`/sellers/${currentUser.sellerId}`);
    }
  }, [currentUser, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!currentUser.isAuthenticated) {
      navigate("/auth");
      return;
    }

    const requestId = await becomeSeller(form);
    if (requestId) {
      navigate("/dashboard");
    }
  }

  const existingRequest = sellerRequests.find(
    (request) => request.requesterEmail === currentUser.user?.email,
  );

  const isRequestPending = existingRequest?.status === "Pending";
  const isRequestApproved = existingRequest?.status === "Approved";

  useEffect(() => {
    if (profile.role === "Seller") {
      navigate(`/sellers/${profile.sellerId}`);
    }
    if (currentUser.isAdmin) {
      navigate("/admin");
    }
  }, [currentUser.isAdmin, navigate, profile.role, profile.sellerId]);

  return (
    <div className="auth-layout">
      <section className="panel auth-side-card">
        <p className="panel-kicker">Seller onboarding</p>
        <h1>Start selling on Shopperz</h1>
        <p>Fill in your seller profile details so you can post products and manage your store.</p>
        <div className="seller-stat-grid">
          <article>
            <strong>Location</strong>
            <span>Where you ship from</span>
          </article>
          <article>
            <strong>Response time</strong>
            <span>How quickly you reply</span>
          </article>
          <article>
            <strong>Store identity</strong>
            <span>Seller name and tagline</span>
          </article>
        </div>
      </section>

      <section className="panel auth-form-card">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Store name</span>
            <input name="storeName" value={form.storeName} onChange={handleChange} required />
          </label>

          <label>
            <span>Location</span>
            <input name="location" value={form.location} onChange={handleChange} required />
          </label>

          <label>
            <span>Response time</span>
            <input name="responseTime" value={form.responseTime} onChange={handleChange} required />
          </label>

          <label>
            <span>Tagline</span>
            <input name="tagline" value={form.tagline} onChange={handleChange} />
          </label>

          <label>
            <span>Cover image URL</span>
            <input name="coverImage" value={form.coverImage} onChange={handleChange} />
          </label>

          <button type="submit" className="primary-button" disabled={isRequestPending || isRequestApproved}>
            {isRequestPending ? "Request pending" : isRequestApproved ? "Approved" : "Become a seller"}
          </button>

          {authError && <p className="error-message">{authError}</p>}
          {isRequestPending ? (
            <p className="error-message">Your seller request is pending approval from admin.</p>
          ) : null}
          {isRequestApproved ? (
            <p className="error-message">Your seller request has been approved. Please refresh to access your seller store.</p>
          ) : null}
        </form>
      </section>
    </div>
  );
}

export default SellerRequestPage;
