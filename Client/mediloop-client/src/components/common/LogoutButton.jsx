import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function LogoutButton(){
    const navigate = useNavigate();

    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-lg">
            Logout
        </button>
    );
}

export default LogoutButton;