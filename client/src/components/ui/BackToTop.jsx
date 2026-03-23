'use client';
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        onClick={scrollToTop}
        className={`p-3 rounded-full bg-(--brand-primary) text-white shadow-lg hover:bg-(--brand-primary-hover) hover:scale-110 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-(--brand-primary) focus:ring-offset-2 focus:ring-offset-white focus:outline-hidden ${isVisible ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'
          }`}
        aria-label="Back to top"
      >
        <ArrowUp size={22} className="stroke-[2.5]" />
      </button>
    </div>
  );
};

export default BackToTop;