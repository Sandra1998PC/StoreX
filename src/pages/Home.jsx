
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
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
    <div className="home-page">
      <Navbar />

      {/* Main Content */}
      <main className="home-content">

        <section className="welcome-section">

          <div className="welcome-text">
            <span className="welcome-label">
              <i className="bi bi-stars me-2"></i>
              STOREX MANAGEMENT SYSTEM
            </span>

            <h1>
              Welcome to <span>StoreX</span>
            </h1>

            <p>
              Your business, products and inventory management
              — all in one place.
            </p>

            <p className="welcome-description">
              Manage your products, handle sales and purchases,
              and access important business reports through
              one simple platform.
            </p>
          </div>

          <div className="welcome-illustration">
            <i className="bi bi-boxes"></i>
          </div>

        </section>

        {/* Module Information */}
        <section className="module-section">
          <div className="module-heading">
            <h3>Explore StoreX</h3>
            <p>
              Select a module from the navigation menu to get started.
            </p>
          </div>

          <div className="module-list">

            <div className="module-item">
              <div className="module-icon">
                <i className="bi bi-database"></i>
              </div>

              <div>
                <h5>Masters</h5>
                <p>
                  Manage products, group products and tax details.
                </p>
              </div>
            </div>

            <div className="module-item">
              <div className="module-icon">
                <i className="bi bi-arrow-left-right"></i>
              </div>

              <div>
                <h5>Transactions</h5>
                <p>
                  Manage sales, purchases and their returns.
                </p>
              </div>
            </div>

            <div className="module-item">
              <div className="module-icon">
                <i className="bi bi-file-earmark-bar-graph"></i>
              </div>

              <div>
                <h5>Reports</h5>
                <p>
                  Access financial and inventory reports.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
