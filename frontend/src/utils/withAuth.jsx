import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {

    const AuthComponent = (props) => {

        const isAuthenticated = () => {
            if (localStorage.getItem("token")) {
                return true;
            } else {
                return false;
            }
        }
        let router = useNavigate();
        useEffect(() => {
            if (!isAuthenticated()) {
                router("/auth");
            }
        }, [])
        return (<WrappedComponent {...props} />);

    }
    return AuthComponent;
}

export default withAuth;