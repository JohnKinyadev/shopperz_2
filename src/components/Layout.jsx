import { NavLink, Outlet } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";

function Layout() {
  const { currentUser, signOut, unreadNotifications } = useMarketplace();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-main">
          <NavLink to="/" className="brand">
            <span className="brand-mark">S</span>
            <div>
              <p>Shopperz</p>
              <span>Pink-powered marketplace demo</span>
            </div>
          </NavLink>

          <nav className="nav-links">
            <NavLink to="/">Browse</NavLink>
            <NavLink to="/wishlist">Wishlist</NavLink>
            <NavLink to="/compare">Compare</NavLink>
            <NavLink to="/messages">Messages</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </nav>
        </div>

        <div className="topbar-actions">
          <NavLink to="/notifications" className="topbar-chip">
            Notifications
            {unreadNotifications ? <span>{unreadNotifications}</span> : null}
          </NavLink>

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
      </header>

      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
