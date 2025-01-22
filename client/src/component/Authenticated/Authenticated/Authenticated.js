import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import AuthorizedRoute from "../../../utils/AuthorizedRoute";
import Home from "../Home/Home";

const Authenticated = () => {

    return (
        <main className="w-100 min-vh-100">
            <Navbar/>
            <Outlet />
        </main>
    );
};

export const authenticatedRoutes = [
    {
        path: "/home",
        element: <AuthorizedRoute roles={["admin"]}><Home /></AuthorizedRoute>
    },
];

export default Authenticated;