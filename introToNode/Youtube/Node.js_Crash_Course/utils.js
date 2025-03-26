function generateRandomNumber() {
  return Math.floor(Math.random() *100) + 1;
}

function celciusToFahrenheit(celsius){
  return (celsius * 9) / 5 + 32;
}

//  default export because I export one function
// module.exports = generateRandomNumber;

module.exports = {
  generateRandomNumber,
  celciusToFahrenheit
};