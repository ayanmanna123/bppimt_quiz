import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";

import { motion } from "framer-motion";

const Home = () => {
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
        <Navbar />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-10 py-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="px-20"
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
