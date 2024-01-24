import { useEffect } from "react";

export function useKey(keyName, action) {
  useEffect(
    function () {
      function callBack(e) {
        if (e.code.toLowerCase() === keyName.toLowerCase()) {
          action();
        }
      }
      document.addEventListener("keydown", callBack);
      return () => document.removeEventListener("keydown", callBack);
    },
    [action, keyName]
  );
}
