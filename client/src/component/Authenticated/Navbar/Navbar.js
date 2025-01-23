import handleAxiosError from "../../../utils/ErrorHandler";
import "./Navbar.css";
import axios from 'axios';
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();
    const location = useLocation();

    const logout = () => {
        axios.get("/api/users/logout")
        .then((response) => {
            navigate('/');
        }).catch(handleAxiosError);
    }

    
    return (
        <div className="navbar-container">
                <h3 className="m-0">Banking System</h3>
                <div className="nav-content">
                    <Link to="/home" className="nav-content-link" style={{fontWeight: `${location.pathname === "/home" ? "bold" : ""}`}}>Home</Link>
                    <Link to="/#" className="nav-content-link" style={{fontWeight: `${location.pathname === "/about" ? "bold" : ""}`}}>About</Link>
                    <Link to="/#" className="nav-content-link" style={{fontWeight: `${location.pathname === "/contact" ? "bold" : ""}`}}>Contact</Link>
                    <Link to="/#" className="nav-content-link" style={{fontWeight: `${location.pathname === "/notification" ? "bold" : ""}`}}>Notifications</Link>
                    <button className="nav-content-link" onClick={logout}>logout</button>
                </div>
        </div>
    )
}

export default Navbar;