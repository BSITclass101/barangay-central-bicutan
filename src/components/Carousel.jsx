import { useState, useEffect } from "react";

import picture1 from "../assets/picture/picture 1.jpg";
import picture2 from "../assets/picture/picture 2.jpg";
import picture3 from "../assets/picture/picture 3.jpg";

const images = [picture1, picture2, picture3];

const Carousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => {
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      id="carousel-section" // <-- ID NA KINAKAILANGAN PARA MAHANAP NG BUTTON
      style={{
        position: "relative",
        width: "100%",
        height: "700px",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <img
        src={images[current]}
        alt="carousel"
        style={{
          width: "65%",
          height: "90%",
          objectFit: "cover",
          transition: "0.5s ease",
          borderRadius: "4px",
        }}
      />

      {/* Left Button */}
      <button
        onClick={prevSlide}
        style={{
          position: "absolute",
          left: "30px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,255,255,.15)",
          color: "#fff",
          fontSize: "35px",
          cursor: "pointer",
        }}
      >
        ❮
      </button>

      {/* Right Button */}
      <button
        onClick={nextSlide}
        style={{
          position: "absolute",
          right: "30px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,255,255,.15)",
          color: "#fff",
          fontSize: "35px",
          cursor: "pointer",
        }}
      >
        ❯
      </button>
    </div>
  );
};

export default Carousel;