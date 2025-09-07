# 📘 JavaScript ES6 Quick Guide

This guide answers some common JavaScript ES6 questions in a simple way 🚀  

---

## 1️⃣ What is the difference between `var`, `let`, and `const`?

- **`var` 🏷️**
  - Function-scoped (available inside the whole function)
  - Can be re-declared and updated
  - Old way, avoid using in modern JS

- **`let` 📝**
  - Block-scoped (only available inside `{ }`)
  - Can be updated but not re-declared
  - Safer than `var`

- **`const` 🔒**
  - Block-scoped
  - Cannot be re-assigned
  - Good for constants and values that should not change

---

## 2️⃣ Difference between `map()`, `forEach()`, and `filter()`

- **`map()` 🗺️**
  - Returns a **new array** after applying a function to each item  
  - Example: multiply all numbers by 2  
  ```js
  const numbers = [1, 2, 3];
  const doubled = numbers.map(num => num * 2);
  console.log(doubled); // [2, 4, 6]
  ```

- **`forEach()` 🔄**
  - Runs a function for each item but **does not return** a new array  
  - Example: log all numbers  
  ```js
  const numbers = [1, 2, 3];
  numbers.forEach(num => console.log(num));
  // Output: 1, 2, 3
  ```

- **`filter()` 🧹**
  - Returns a **new array** with only items that pass a condition  
  - Example: get only even numbers  
  ```js
  const numbers = [1, 2, 3, 4, 5];
  const evens = numbers.filter(num => num % 2 === 0);
  console.log(evens); // [2, 4]
  ```

---

## 3️⃣ Arrow Functions ➡️ (ES6)

- Short way to write functions ✍️  
- Do not have their own `this` (helpful in some cases)  

Example:  
```js
// Normal function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;
```

---

## 4️⃣ Destructuring Assignment 🧩

- Lets you unpack values from arrays or objects into variables easily  

Example:  
```js
// Array
const fruits = ["🍎", "🍌"];
const [apple, banana] = fruits;
console.log(apple);  // 🍎
console.log(banana); // 🍌

// Object
const person = { name: "Rupom", age: 20 };
const { name, age } = person;
console.log(name); // Rupom
console.log(age);  // 20
```

---

## 5️⃣ Template Literals 📝

- Use backticks `` ` ``
- Allow **string interpolation** (insert variables easily)
- Support multi-line strings  

Example:  
```js
const name = "Rupom";
const age = 20;

// Old way ❌
const text1 = "My name is " + name + " and I am " + age + " years old.";

// Template literal ✅
const text2 = `My name is ${name} and I am ${age} years old.`;

console.log(text1);
console.log(text2);

// Multi-line example
const multiLine = `
Hello,
This is a multi-line
string with backticks!
`;
console.log(multiLine);
```


