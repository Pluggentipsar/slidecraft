"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EditableText } from "@/lib/inline-edit";

type Size = "sm" | "md" | "lg" | "xl";

interface GiantTextProps {
  children: ReactNode;
  align?: "left" | "center";
  /** Textstorlek. Default md. */
  size?: Size;
}

const SIZES: Record<Size, string> = {
  sm: "clamp(1.75rem, 4vw, 3.5rem)",
  md: "clamp(2.5rem, 6vw, 5.5rem)",
  lg: "clamp(3.5rem, 8vw, 7.5rem)",
  xl: "clamp(5rem, 11vw, 10rem)",
};

export function GiantText({ children, align = "left", size = "md" }: GiantTextProps) {
  return (
    <div className="slide-container">
      <div
        className={`flex w-full flex-col gap-6 ${
          align === "center" ? "items-center text-center" : "items-start"
        }`}
        style={{ maxWidth: "var(--slide-max-width)" }}
      >
        <EditableText
          path="content"
          block
          label="Text"
          sizeControls={[
            { prop: "size", current: size, options: ["sm", "md", "lg", "xl"], label: "Storlek" },
          ]}
        >
          <motion.div
            className="leading-[1.08]"
            style={{
              fontSize: SIZES[size],
              fontFamily: "var(--font-display)",
              fontWeight: "var(--heading-weight)",
              letterSpacing: "var(--heading-tracking)",
              textTransform: "var(--heading-case)" as "normal" | "uppercase",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </EditableText>
      </div>
    </div>
  );
}
