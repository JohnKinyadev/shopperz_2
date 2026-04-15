import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMarketplace } from "../context/MarketplaceContext";

function SellerRequestPage() {
  const navigate = useNavigate();
  const { becomeSeller, currentUser, profile, authError, currentSellerRequest } = useMarketplace();
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
    if (profile.role === "Seller" && profile.sellerId) {
      navigate(`/sellers/${profile.sellerId}`);
    }
  }, [navigate, profile.role, profile.sellerId]);

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

  const isRequestPending = currentSellerRequest?.status === "Pending";
  const isRequestApproved = currentSellerRequest?.status === "Approved";
  const sellerShopPath = profile.sellerId
    ? `/sellers/${profile.sellerId}`
    : currentSellerRequest?.sellerId
      ? `/sellers/${currentSellerRequest.sellerId}`
      : "/dashboard";

  useEffect(() => {
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

          {isRequestApproved ? (
            <Link to={sellerShopPath} className="primary-button link-button">
              Manage my shop
            </Link>
          ) : (
            <button type="submit" className="primary-button" disabled={isRequestPending}>
              {isRequestPending ? "Pending" : "Apply to become a seller"}
            </button>
          )}

          {authError && <p className="error-message">{authError}</p>}
          {isRequestPending ? (
            <p className="error-message">Your seller request is pending approval from admin.</p>
          ) : null}
          {isRequestApproved ? (
            <p className="error-message">Your seller request has been approved. You can now manage your shop.</p>
          ) : null}
        </form>
      </section>
    </div>
  );
}

export default SellerRequestPage;
