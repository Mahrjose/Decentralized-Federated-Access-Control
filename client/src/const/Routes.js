import React from "react";
import Landing, { landingRoutes } from "../component/Landing/Landing/Landing";
import AuthenticatedRoute from "../utils/AuthenticatedRoute";
import Authenticated, { authenticatedRoutes } from "../component/Authenticated/Authenticated/Authenticated";
import Message from "../component/common/Message/Message";

export const routes = [
    {
        path: "/",
        element: <Landing />,
        children: landingRoutes,
    },
    {
        path: "/",
        element: ( 
            <AuthenticatedRoute>
                <Authenticated />
            </AuthenticatedRoute>
        ),
        children: authenticatedRoutes
    },
    {
        path: "/*",
        element: <Message headline="Error 404 Not Found" message="Our system currently does not have your required page" />,
    },
];