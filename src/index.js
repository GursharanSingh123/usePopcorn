import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
// import StarRating from "./StarRating";

// function Rating() {
//   const [rating, setRating] = useState(0);
//   return (
//     <div>
//       <StarRating onSetRating={setRating} />
//       <div>{setRating}</div>
//     </div>
//   );
// }
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={10}
      color="red"
      size="32"
      messages={[
        "Terrible",
        "Below Average",
        "Average",
        "Above average",
        "Awesome",
      ]}
      defaultRating="3"
    />
    <Rating /> */}
  </React.StrictMode>
);
