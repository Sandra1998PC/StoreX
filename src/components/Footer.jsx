import React from 'react'
import './Footer.css'

function Footer() {
  return (
    <div>
      {/* Footer */}
        <footer className="home-footer">
          <p>
            © {new Date().getFullYear()} StoreX.
            Smart Inventory & Business Management.
          </p>
        </footer>
    </div>
  )
}

export default Footer
