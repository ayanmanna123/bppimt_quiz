import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const Home = () => {
  const { logout, loginWithRedirect, isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect();
    }
  };

  const updateProfile = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v1", // 👈 matches backend audience
      });

      const res = await axios.put(
        "https://ultimate-login.vercel.app/api/v1/user/update",
        { fullname: "New Full Name" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="absolute inset-0 bg-black flex justify-center items-center gap-3.5">
      <div className="p-1.5">
        {isAuthenticated && (
          <div>
            <div className="flex items-center justify-center">
              <img
                src={user?.picture}
                alt={user?.name}
                className="text-white rounded-full"
              />
            </div>
            <div>
              <h2 className="text-white">{user?.name}</h2>
              <p className="text-white">{user?.email}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center gap-2.5 p-3.5">
          {isAuthenticated ? (
            <Button
              onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              className="bg-white text-black cursor-pointer hover:bg-gray-200"
            >
              Log Out
            </Button>
          ) : (
            <Button
              onClick={handleLogin}
              className="bg-white text-black cursor-pointer hover:bg-gray-200"
            >
              Log In
            </Button>
          )}
        </div>

        {isAuthenticated && (
          <Button onClick={updateProfile}>Update</Button>
        )}
      </div>
    </div>
  );
};

export default Home;
