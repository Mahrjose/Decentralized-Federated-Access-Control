import {Outlet} from "react-router-dom";
import Login from '../Login/Login';
import React from "react";
import Navbar from "../Navbar/Navbar";

function Landing() {
    return (
        <>
            <Navbar />
            <div className="d-flex justify-content-center align-items-center w-100" style={{minHeight: "90vh"}}>
                <Outlet/>
            </div>
        </>
    );
}

export const landingRoutes = [
    {
        path: "/",
        element: <Login />
    },
];

export default Landing;