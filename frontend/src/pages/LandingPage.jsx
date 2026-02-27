import "../App.css"
import { Link, Router } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {

    const router = useNavigate();

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeading">
                    <h1>Video Call</h1>
                </div>
                <div className="navList">
                    <p onClick={()=>{
                        router("/meet/guest87654321");
                    }}>Join as Guest</p>

                    <p onClick={() => {
                        router("/auth");
                    }}> <b>Register</b> </p>

                    <div onClick={() => {
                        router("/auth");
                    }}
                        role="button">
                        <p> <b>Login</b> </p>
                    </div>
                </div>
            </nav>
            <div className="landingPageBody">
                <div>
                    <h1><span style={{ color: "#ff9839" }}>Connect</span> with your<br />loved Ones</h1>
                    <p>Cover a distance by video call</p>
                    <div role="button">
                        <Link to={"/home"}>Get Started</Link>
                    </div>
                </div>
                <div>
                    <img src="/mobile.png" alt="phone-image" />
                </div>
            </div>
        </div>
    )
}