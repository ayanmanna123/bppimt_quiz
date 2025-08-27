import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

const Counter = ({ from = 0, to = 1000, duration = 2 }) => {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.floor(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, to, duration]);

  return <motion.span>{rounded}</motion.span>;
};

export default Counter;
