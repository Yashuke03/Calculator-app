const { add, subtract, multiply, divide } = require("./math");

console.log("Addition:", add(10, 5));
console.log("Subtraction:", subtract(10, 5));
console.log("Multiplication:", multiply(10, 5));

try {
    console.log("Division:", divide(10, 5));
    console.log("Division by zero:", divide(10, 0));
} catch (error) {
    console.error(error.message);
}