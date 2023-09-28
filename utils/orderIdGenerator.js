const generateRandomOrder = function generateRandomOrderId() {
    const timestamp = new Date().getTime(); // Current timestamp
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0 and 999 (adjust as needed)
    const orderId = `${timestamp}${randomNum}`; // Concatenate timestamp and random number
   
    return orderId;
  }
  
  // Example usage:


  module.exports= generateRandomOrder