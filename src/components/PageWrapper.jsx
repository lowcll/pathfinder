// src/components/PageWrapper.jsx
import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

const pageTransition = {
  duration: 0.5,
};

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      style={{ minHeight: "100vh" }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
