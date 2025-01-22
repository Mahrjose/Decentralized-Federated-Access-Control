import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import Message from "../component/common/Message/Message";

const AuthorizedRoute = ({ children, roles }) => {

    const { checkAuth } = useAuth();
    const [authorizedRole, setAuthorizedRole] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            const result = await checkAuth();
            setAuthorizedRole(result);
        };
        verifyAuth();
    }, [checkAuth]);

    if (roles === null) {
        return <Message headline="Loading..." message="Please be patient while the page loads" />;
    }

    return roles.includes(authorizedRole) ? children : <Message headline="Unauthorized" message="You don't have access to view this page" />
};

export default AuthorizedRoute;