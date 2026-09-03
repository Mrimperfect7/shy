"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only enable on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    document.body.classList.add("has-custom-cursor");

    const dot = document.getElementById("cursor-dot");
    const follower = document.getElementById("cursor-follower");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setVisible(true);

      if (dot) {
        dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check hovered element
      const target = e.target as HTMLElement | null;
      const clickable = target?.closest("button, a, [data-cursor], .interactive-card");
      if (clickable) {
        setIsHovered(true);
        const text = clickable.getAttribute("data-cursor") || "";
        setCursorText(text);
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    let animationFrameId: number;
    const render = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;

      if (follower) {
        follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(render);
    };
    animationFrameId = requestAnimationFrame(render);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <div
        id="cursor-dot"
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-[#C5A059] rounded-full pointer-events-none z-[99999] transition-transform duration-75"
      />
      <div
        id="cursor-follower"
        className={`fixed top-0 left-0 -ml-5 -mt-5 flex items-center justify-center rounded-full pointer-events-none z-[99998] transition-all duration-300 ease-out ${
          isHovered
            ? "w-16 h-16 -ml-8 -mt-8 bg-[#C5A059]/15 border border-[#C5A059] backdrop-blur-[1px]"
            : "w-10 h-10 border border-[#C5A059]/40"
        }`}
      >
        {cursorText && (
          <span className="text-[9px] uppercase tracking-widest font-semibold text-[#141312]">
            {cursorText}
          </span>
        )}
      </div>
    </>
  );
}
