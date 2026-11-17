import React from 'react'
import { useEffect, useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css'

function Navbar() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const data = JSON.parse(sessionStorage.getItem("data"));
        console.log("data from sessionStorage:", data);
        if (!data) {
            navigate("/");
        }
        else {
            setUserData(data);
        }
    }, []);
  return (
    <div>
        {/* Navbar */}
      <nav className="navbar navbar-expand-lg storex-navbar">
        <div className="container-fluid px-4">

          {/* Logo */}
          <Link className="navbar-brand storex-logo" to="/home">
            <i className="bi bi-box-seam"></i>
            StoreX
          </Link>

          {/* Mobile Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#storexNavbar"
            aria-controls="storexNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Navigation Menus */}
          <div
            className="collapse navbar-collapse"
            id="storexNavbar"
          >
            <ul className="navbar-nav mx-auto">

              {/* Masters */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Masters
                </a>

                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/masters/product-master">
                      <i className="bi bi-box me-2"></i>
                      Product Master
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/masters/group-product-master">
                      <i className="bi bi-boxes me-2"></i>
                      Group Product Master
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/masters/tax-master">
                      <i className="bi bi-percent me-2"></i>
                      Tax Master
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Transactions */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Transactions
                </a>

                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/transactions/sales">
                      <i className="bi bi-receipt me-2"></i>
                      Sales
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/transactions/sales-return">
                      <i className="bi bi-arrow-return-left me-2"></i>
                      Sales Return
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/transactions/purchase">
                      <i className="bi bi-cart-plus me-2"></i>
                      Purchase
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item" to="/transactions/purchase-return">
                      <i className="bi bi-arrow-return-left me-2"></i>
                      Purchase Return
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Reports */}
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Reports
                </a>

                <ul className="dropdown-menu reports-menu">

                  <li>
                    <Link className="dropdown-item" to="/reports/financial">
                      <i className="bi bi-graph-up me-2"></i>
                      Financial
                    </Link>
                  </li>

                  <li><hr className="dropdown-divider" /></li>

                  <li className="dropdown-header">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Inventory
                  </li>

                  <li className="dropdown-header submenu-heading">
                    Sales
                  </li>

                  <li>
                    <Link className="dropdown-item submenu-item" to="/reports/inventory/sales/pay-book">
                      Pay Book
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item submenu-item" to="/reports/inventory/sales/sales-statement">
                      Sales Statement
                    </Link>
                  </li>

                  <li>
                    <Link className="dropdown-item submenu-item" to="/reports/inventory/sales/sales-summary">
                      Sales Summary
                    </Link>
                  </li>

                  <li><hr className="dropdown-divider" /></li>

                  <li className="dropdown-header submenu-heading">
                    Purchase
                  </li>

                  <li>
                    <Link className="dropdown-item submenu-item" to="/reports/inventory/purchase/purchase-report">
                      Purchase Report
                    </Link>
                  </li>

                </ul>
              </li>

            </ul>

            {/* Right Side */}
            <div className="navbar-user-section">
              <div className="user-info">
                <div className="user-avatar">
                  <i className="bi bi-person"></i>
                </div>

                <div className="user-details">
                  <span className="user-name">Welcome</span>
                  <small>{userData?.existingUser.name || "User"}</small>
                </div>
              </div>

              <Link to="/" className="logout-btn">
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Link>
            </div>

          </div>
        </div>
      </nav>
    </div>
  )
}

export default Navbar
