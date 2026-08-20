import { Link } from "react-router-dom";
import "../../styles/common/NotFound.css";

export default function NotFound() {
  return (
    <main className="not-found-container">
      <div className="not-found-card">
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Lost in the Stacks</h1>
        <p className="not-found-message">
          The page or volume you are looking for has been misplaced, re-indexed,
          or removed from our archive shelf.
        </p>
        <div className="not-found-actions">
          <Link to="/catalogue" className="btn btn-primary">
            Return to Catalogue
          </Link>
          <Link to="/bookshelf" className="btn btn-secondary">
            Check Bookshelf
          </Link>
        </div>
      </div>
    </main>
  );
}
