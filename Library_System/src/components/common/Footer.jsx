import { Link } from "react-router-dom";
import "../../styles/common/Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-col brand-col">
          <h3 className="footer-brand">Meridian Public Library</h3>
          <p className="footer-tagline">
            Serving readers, researchers, and the curious since 1912.
          </p>
          <span className="archival-stamp">Archives & Collection Hub</span>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            <li>
              <Link to="/catalogue">Catalogue Search</Link>
            </li>
            <li>
              <Link to="/bookshelf">My Bookshelf</Link>
            </li>
            <li>
              <Link to="/auth">Account Access</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Library Hours</h4>
          <ul className="footer-hours">
            <li>
              <span>Mon – Thu:</span> 8:00 AM – 8:00 PM
            </li>
            <li>
              <span>Fri – Sat:</span> 9:00 AM – 5:00 PM
            </li>
            <li>
              <span>Sunday:</span> Closed
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Location & Contact</h4>
          <address className="footer-address">
            404 Reading Way, Suite 12
            <br />
            Meridian Central
            <br />
            <a href="mailto:contact@meridianlibrary.org">
              contact@meridianlibrary.org
            </a>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Meridian Public Library System. All
          rights reserved.
        </p>
        <p className="footer-motto">"Every Book a Door"</p>
      </div>
    </footer>
  );
}
