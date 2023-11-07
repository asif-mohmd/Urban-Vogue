var alphanumericRegex = /^[a-zA-Z\s]*$/;

if (name == null || name.trim() === "") {
  alert("Name can't be blank");
  return false;
} else if (!alphanumericRegex.test(name)) {
  alert("Invalid Name. Please enter alphabetic characters only.");
  return false;
} else if (name.match(/\d/)) {
  alert("Invalid Name. Please do not include numbers.");
  return false;
} else if (!email.match(mailformat)) {
  alert("You have entered an invalid email address!");
  document.getElementById("email").focus();
  return false;
} else if (text == "" || text.trim() === null) {
  alert("Message is empty.");
  return false;
} else if (text.length < 10) {
  alert("Message should be at least 10 characters long.");
  return false;
} else {
  alert("Form Submitted Successfully");
}

function validateform() {
var nameInput = document.getElementById("name");
var name = nameInput.value;
var text = document.getElementById("text").value;
var email = document.getElementById("email").value;
var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
}