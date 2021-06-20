import React from "react";

const Home = (props) => {
  const { number1, number2 } = props;
  const number3 = number1 + number2;
  return { number3 };
};

export default Home;
