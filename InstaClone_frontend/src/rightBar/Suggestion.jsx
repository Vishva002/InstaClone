import React, { useEffect, useState } from "react";

function Suggestion() {
    const [suggestions, setSuggestions] = useState([]);
  
    useEffect(() => {
      fetch("http://localhost:3000/suggestions")
        .then((res) => res.json())
        .then((data) => setSuggestions(data))
        .catch((err) => console.log(err));
  }, []);
  return (
    <div>Suggestion</div>
  )
}

export default Suggestion