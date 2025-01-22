import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";

function Navbar() {

    const location = useLocation();

    
    return (
        <div className="navbar-container">
                <h3 className="m-0">Banking System</h3>
                <div className="nav-content">
                    <Link to="/" className="nav-content-link" style={{fontWeight: `${location.pathname === "/" ? "bold" : ""}`}}>Sign in</Link>
                    <Link to="/#" className="nav-content-link" style={{fontWeight: `${location.pathname === "/signup" ? "bold" : ""}`}}>Sign up</Link>
                </div>
        </div>
    )
}

export default Navbar;