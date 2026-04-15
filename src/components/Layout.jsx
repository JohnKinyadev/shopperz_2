import { NavLink, Outlet } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function Layout() {
  const { currentUser, profile, signOut, savedItems } = useMarketplace();

  return (
    <div className="app-shell">
      <header className="market-header">
        <div className="topbar">
          <NavLink to="/" className="brand brand-amazon">
            <div>
              <p>shopperz</p>
              <span>.market</span>
            </div>
          </NavLink>

          <div className="header-delivery">
            <small>Deliver to</small>
            <strong>{profile.location}</strong>
          </div>

          <form className="header-search" onSubmit={(event) => event.preventDefault()}>
            <select defaultValue="All" aria-label="Search category">
              <option value="All">All</option>
              <option value="Phones">Phones</option>
              <option value="Audio">Audio</option>
              <option value="Wearables">Wearables</option>
              <option value="Home Office">Home Office</option>
            </select>
            <input type="search" placeholder="Search Shopperz" aria-label="Search Shopperz" />
            <button type="submit">Search</button>
          </form>

          <div className="header-account">
            <small>{currentUser.isAuthenticated ? `Hello, ${profile.name.split(" ")[0]}` : "Hello, sign in"}</small>
            <span>Account & Lists</span>
          </div>

          <NavLink to="/messages" className="header-link-block">
            <small>Track</small>
            <span>& Updates</span>
          </NavLink>

          <NavLink to="/wishlist" className="header-link-block cart-link">
            <strong>{savedItems.length}</strong>
            <span>Saved</span>
          </NavLink>
        </div>

        <div className="subnav">
          <nav className="nav-links">
            <NavLink to="/">All Products</NavLink>
            <NavLink to="/wishlist">Wishlist</NavLink>
            <NavLink to="/compare">Compare</NavLink>
            <NavLink to="/messages">Updates</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/notifications">Notifications</NavLink>
          </nav>

          <div className="topbar-actions">
            {currentUser.isAdmin ? (
              <NavLink to="/admin" className="secondary-button link-button">
                Admin panel
              </NavLink>
            ) : null}
            {currentUser.isAuthenticated ? (
              <button type="button" className="ghost-button" onClick={signOut}>
                Sign out
              </button>
            ) : (
              <NavLink to="/auth" className="ghost-button link-button">
                Sign in
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
