import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import { User } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { setuser } from "../../Redux/auth.reducer";
const Home = () => {
  const dispatch = useDispatch()
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
  const updateProfile = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      console.log(token);
      console.log(user);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="min-h-scree bg-white">
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
              <li className="cursor-pointer hover:text-indigo-600">
                Contact Us
              </li>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-10 py-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#03045E] leading-snug">
              Fully Managed Cloud & <br /> Web Hosting
            </h1>
            <p className="text-gray-500 mt-4 max-w-lg">
              Dedicated resources, full root access, & easy scaling. It’s the
              virtual private server you’ve been craving.
            </p>
            <Button
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6"
              onClick={updateProfile}
            >
              View Pricing
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <img
              src="/img-1.png"
              alt="Hero Illustration"
              className="w-[400px] md:w-[500px]"
            />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Home;
