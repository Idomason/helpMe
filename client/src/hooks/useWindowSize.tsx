import { useEffect, useState } from "react";

export default function useWindowSize() {
  const [windowWidth, setWindowWidth] = useState<boolean>(false);
  const [windowHeight, setWindowHeight] = useState<number>(0);

  function handleWindowWidthResize() {
    if (window.innerWidth < 640) {
      setWindowWidth(true);
    }
  }
  function handleWindowHeightResize() {
    // if (window.scrollY >= 90) setWindowHeight(true);

    // if (window.scrollY < 90) setWindowHeight(true);

    setWindowHeight(window.scrollY);

    // console.log(window.scrollY);
  }

  useEffect(() => {
    handleWindowWidthResize();
    handleWindowHeightResize();
    window.addEventListener("resize", handleWindowWidthResize);
    window.addEventListener("scroll", handleWindowHeightResize);

    return () => {
      removeEventListener("resize", handleWindowWidthResize);
      removeEventListener("scroll", handleWindowHeightResize);
    };
  }, []);

  return { windowWidth, windowHeight };
}
