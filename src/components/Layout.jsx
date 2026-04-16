import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMarketplace } from "../context/MarketplaceContext";
import { categories } from "../data/mockData";
import { useEffect, useState } from "react";

function Layout() {
  const { currentUser, profile, signOut, savedItems } = useMarketplace();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("q") ?? "");
    setSelectedCategory(params.get("category") ?? "All");
  }, [location.pathname, location.search]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("q", searchTerm.trim());
    }

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }

    navigate({
      pathname: "/",
      search: params.toString() ? `?${params.toString()}` : "",
    });
  }

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

          <form className="header-search" onSubmit={handleSearchSubmit}>
            <select
              value={selectedCategory}
              aria-label="Search category"
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option value="All">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search Shopperz"
              aria-label="Search Shopperz"
            />
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
