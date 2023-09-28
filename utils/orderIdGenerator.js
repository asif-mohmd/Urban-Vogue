const generateRandomOrder = () => {
    const timestamp = new Date().getTime(); // Current timestamp
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3-digit random number
    const orderId = `${timestamp}${randomNum}`.slice(0, 10); // Concatenate and truncate to 10 digits
  
    return orderId;
  };

  module.exports= generateRandomOrder