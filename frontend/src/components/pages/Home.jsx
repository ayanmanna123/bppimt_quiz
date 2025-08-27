import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { Howl } from "howler";
import SplitText from "./SplitText";
import TextType from "./TextType";
import Footer from "./Footer";
import Features from "./features";
import Footerreal from "./Footerreal";
const Home = () => {
  const { getAccessTokenSilently } = useAuth0();
  const updateProfile = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "http://localhost:5000/api/v2",
      });
      console.log(token);
      playSound();
      console.log(user);
    } catch (error) {
      console.error(error);
    }
  };
  const playSound = () => {
    const sound = new Howl({
      src: ["/notification.wav"],
      volume: 0.7,
    });
    sound.play();
  };

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
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
            <h1>
              <SplitText
                text=" Smart Quiz App"
                className="text-5xl font-semibold text-center"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                onLetterAnimationComplete={handleAnimationComplete}
              />
              <br />
              <SplitText
                text="for College Mock Tests"
                className="text-5xl font-semibold text-center"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="center"
                onLetterAnimationComplete={handleAnimationComplete}
              />
            </h1>

            {/* <p className="text-gray-500 mt-4 max-w-lg">
              A modern platform for students to practice mock tests, track
              progress, and get exam-ready with ease.
            </p> */}
            <p>
              <TextType
                text={[
                  "A modern platform for students to practice mock tests",
                  "Track your progress with ease",
                ]}
                typingSpeed={75}
                as="span"
                pauseDuration={1500}
                deletingSpeed={40}
                loop={true}
                className="font-bold text-2xl"
                textColors={["#000000"]} // cycles black, blue, red
                cursorCharacter="|"
                cursorClassName="text-blue-600"
              />
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
        <Features/>
        <Footer/>
        <Footerreal/>
      </div>
    </>
  );
};

export default Home;
