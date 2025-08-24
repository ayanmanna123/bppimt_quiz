import React from "react";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
const Navbar = () => {
  const dispatch = useDispatch();
  const {
    logout,
    loginWithRedirect,
    isAuthenticated,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect();
    }
  };
  dispatch(setuser(user));
  return (
    <div>
      <nav className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2">
          <img src="/img-2.png" alt="Shield Logo" className="h-8" />
          <span className="font-bold text-xl text-[#03045E]">SHIELD</span>
        </div>
        <div className="flex justify-center items-center gap-3.5">
          <ul className="hidden md:flex items-center gap-8 text-indigo-900 font-medium">
            <li className="cursor-pointer hover:text-indigo-600">Home</li>
            <li className="cursor-pointer hover:text-indigo-600">About Us</li>
            <li className="cursor-pointer hover:text-indigo-600">Service</li>
            <li className="cursor-pointer hover:text-indigo-600">Contact Us</li>
          </ul>
          {!isAuthenticated ? (
            <Button
              className="bg-[#03045E] hover:bg-indigo-900 text-white rounded-lg px-6"
              onClick={handleLogin}
            >
              Login
            </Button>
          ) : (
            <Popover>
              <PopoverTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    className="object-cover"
                    src={
                      user?.picture ||
                      `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
                    }
                  />
                </Avatar>
              </PopoverTrigger>

              <PopoverContent className="w-80 ">
                <div className="flex items-center ">
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      className="object-cover"
                      src={
                        user?.picture ||
                        `https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`
                      }
                    />
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{user?.name}</h4>
                  </div>
                </div>
                <div className="flex flex-col my-2 text-gray-600">
                  <div className="flex w-fit items-center gap-2 cursor-pointer">
                    <User />
                    <Button variant="link">
                      <Link to={"/profile"}>view profile</Link>
                    </Button>
                  </div>
                  <div className="flex w-fit items-center gap-2 cursor-pointer">
                    <LogOut />
                    <Button
                      variant="link"
                      onClick={() =>
                        logout({
                          logoutParams: { returnTo: window.location.origin },
                        })
                      }
                    >
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
