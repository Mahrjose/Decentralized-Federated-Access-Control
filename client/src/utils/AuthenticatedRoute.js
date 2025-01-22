import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Message from "../component/common/Message/Message";
import { useAuth } from "./AuthContext";

const AuthenticatedRoute = ({ children, redirect }) => {

    const { checkAuth } = useAuth();
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            const result = await checkAuth();
            setIsAuthenticated(result!=='unauthorized');
        };
        verifyAuth();
    }, [checkAuth]);

    if (isAuthenticated === null) {
        return <Message headline="Loading..." message="Please be patient while the page loads" />;
    }

    return isAuthenticated ? children : redirect || <Navigate to="/" />;
};

export default AuthenticatedRoute;
