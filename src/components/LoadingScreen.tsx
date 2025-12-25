import { motion } from "framer-motion";

export default function LoadingScreen({
  text = "Elevating your Style...",
}: {
  text?: string;
}) {
  return (
    <div className="fixed inset-0 z-9999 bg-background flex flex-col items-center justify-center">
      <div className="relative">
        {/* Outer pulsing ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-primary/20 -m-8"
        />

        {/* Logo with breathing animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <motion.img
            src="/logos/logo.png"
            alt="Money's Outlet"
            className="h-24 md:h-32 w-auto object-contain"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>

      {/* Premium Loading Indicator */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white font-bold uppercase tracking-[0.4em] text-[10px] md:text-xs italic"
        >
          {text}
        </motion.p>

        <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
  );
}
