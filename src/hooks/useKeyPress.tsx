import { useState, useEffect } from "react";

const useKeyPress = function (targetKey: string): boolean {
  const [keyPressed, setKeyPressed] = useState<boolean>(false);

  function downHandler({ key }: KeyboardEvent): void {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }

  const upHandler = ({ key }: KeyboardEvent): void => {
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", downHandler);
    document.addEventListener("keyup", upHandler);

    return () => {
      document.removeEventListener("keydown", downHandler);
      document.removeEventListener("keyup", upHandler);
    };
  }, [targetKey]); // Add dependency array

  return keyPressed;
};

export default useKeyPress;
