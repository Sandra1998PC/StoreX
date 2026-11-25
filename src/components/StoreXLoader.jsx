
import React from "react";
import "./StoreXLoader.css";

const StoreXLoader = () => {
    return (
        <div className="storex-loader-overlay">
            <div className="storex-loader-content">

                <div className="storex-loader-logo">
                    <div className="storex-loader-icon">
                        <i className="bi bi-box-seam"></i>
                    </div>

                    <h2>
                        Store<span>X</span>
                    </h2>
                </div>

                <div className="storex-loading-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <p>Managing your inventory...</p>

            </div>
        </div>
    );
};

export default StoreXLoader;
