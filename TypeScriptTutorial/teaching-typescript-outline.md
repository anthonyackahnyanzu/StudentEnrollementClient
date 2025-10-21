
# Teaching TypeScript: Presentation

---


## 1. Introduction to TypeScript
**What is TypeScript?**
TypeScript is a programming language that builds on JavaScript by adding type safety. This means you can catch mistakes before running your code.

**Benefits:**
- TypeScript helps you find bugs early, making your code more reliable.
- It works well with modern editors, giving you better autocompletion and error checking.
- Large projects are easier to manage because types make your code easier to understand.

**Setup:**
To start using TypeScript, install it globally with npm. You write `.ts` files and compile them to JavaScript using the TypeScript compiler.
```shell
npm install -g typescript
```
Compile your code with:
```shell
tsc file.ts
```

---


## 2. Basic Types
TypeScript lets you specify what kind of data your variables hold. This helps prevent mistakes and makes your code easier to read.

**Number, String, Boolean:**
Numbers, strings, and booleans are the most common types.
```typescript
let age: number = 25; // Only numbers allowed
let name: string = "Alice"; // Only text allowed
let isStudent: boolean = true; // Only true or false
```

**Arrays and Tuples:**
Arrays hold lists of values, and tuples hold a fixed number of values of different types.
```typescript
let scores: number[] = [90, 80, 70]; // Array of numbers
let person: [string, number] = ["Bob", 30]; // Tuple: string and number
```

**Enums:**
Enums let you define a set of named constants.
```typescript
enum Color { Red, Green, Blue }
let c: Color = Color.Green; // Only values from Color allowed
```

**Any, Unknown, Void, Never:**
Use `any` for variables that can hold any type, but avoid it for safety. `void` is for functions that return nothing, and `never` is for functions that never finish.
```typescript
let randomValue: any = 10; // Can be anything
function log(): void { console.log("Hello"); } // Returns nothing
function error(): never { throw new Error("Error!"); } // Never returns
```

---



## 3. Functions
Functions let you organize your code into reusable blocks. TypeScript lets you specify what types of values functions take and return.

**Function Types:**
You can declare the types of parameters and the return value.
```typescript
function add(x: number, y: number): number {
	return x + y; // Returns a number
}
```

**Arrow Function Declaration:**
Arrow functions provide a shorter way to write functions and automatically bind `this` from the surrounding context.
```typescript
const multiply = (a: number, b: number): number => a * b;
```
Use arrow functions for concise function expressions, especially in callbacks.

**Optional and Default Parameters:**
Parameters can be optional or have default values.
```typescript
function greet(name: string, greeting: string = "Hello"): string {
	return `${greeting}, ${name}`;
}
```

**Rest Parameters:**
Use rest parameters to accept any number of arguments.
```typescript
function sum(...numbers: number[]): number {
	return numbers.reduce((a, b) => a + b, 0);
}
```

---


## 4. Interfaces and Types
Interfaces and type aliases let you describe the shape of objects and make your code more readable and maintainable.

**Defining Interfaces:**
Interfaces describe what properties an object should have.
```typescript
interface Student {
	name: string;
	age: number;
}
let student: Student = { name: "Alice", age: 20 }; // Must match the interface
```

**Extending Interfaces:**
Interfaces can build on each other to add more properties.
```typescript
interface Graduate extends Student {
	degree: string;
}
```

**Type Aliases:**
Type aliases let you create custom names for types.
```typescript
type Point = { x: number; y: number };
```

---


## 5. Classes
Classes let you create objects with properties and methods. They help organize code and model real-world things.

**Class Syntax:**
Define a class with properties and methods.
```typescript
class Animal {
	name: string;
	constructor(name: string) {
		this.name = name;
	}
	move(distance: number) {
		console.log(`${this.name} moved ${distance}m.`);
	}
}
```

**Inheritance:**
Classes can inherit from other classes to reuse code.
```typescript
class Dog extends Animal {
	bark() {
		console.log("Woof!");
	}
}
```

**Access Modifiers, Readonly, Static:**
Control who can access properties, make them unchangeable, or share them across all instances.
```typescript
class Person {
	private id: number; // Only accessible inside the class
	readonly name: string; // Cannot be changed after creation
	static species = "Homo sapiens"; // Shared by all Person objects
	constructor(id: number, name: string) {
		this.id = id;
		this.name = name;
	}
}
```

---


## 6. Generics
Generics let you write flexible, reusable code that works with any type.

**Generic Functions:**
Use generics to make functions work with any type.
```typescript
function identity<T>(arg: T): T {
	return arg; // Returns whatever type you pass in
}
```

**Generic Classes:**
Classes can also use generics to store any type of value.
```typescript
class Box<T> {
	contents: T;
	constructor(value: T) {
		this.contents = value;
	}
}
```

**Constraints:**
You can restrict generics to types that have certain properties.
```typescript
function logLength<T extends { length: number }>(item: T): void {
	console.log(item.length); // Only works if item has a length property
}
```

---


## 7. Modules
Modules help you organize code into separate files. You can export code from one file and import it into another.

**Import and Export:**
Export functions or variables from one file and import them in another.
```typescript
// math.ts
export function add(x: number, y: number): number { return x + y; }

// main.ts
import { add } from "./math";
```

**Namespaces:**
Namespaces group related code together inside a single file.
```typescript
namespace Geometry {
	export function area(width: number, height: number): number {
		return width * height;
	}
}
```

---


## 8. Advanced Types
Advanced types let you write more powerful and flexible code.

**Union and Intersection Types:**
Unions let a variable be one of several types. Intersections combine multiple types into one.
```typescript
type NumberOrString = number | string; // Can be a number or a string
type Employee = Person & { salary: number }; // Has all properties of Person and salary
```

**Type Guards:**
Type guards help you check what type a variable is at runtime.
```typescript
function isString(x: any): x is string {
	return typeof x === "string"; // Returns true if x is a string
}
```


**Type Assertions:**
Type assertions let you tell TypeScript, "I know the type of this value better than you do." This is useful when you know more about the data than TypeScript can infer, such as when working with values from external sources or the DOM.

You can use `as` or angle brackets to assert a type:
```typescript
let someValue: any = "hello";
let strLength: number = (someValue as string).length; // Treat someValue as a string
```
or
```typescript
let strLength: number = (<string>someValue).length;
```
Type assertions do not change the runtime type—they only tell TypeScript how to treat the value during type checking. Use them when you are confident about the type, but avoid overusing them as they can hide real errors.

---


## 9. Practical Example: Simple Student App
Let's put it all together with a simple app that lists students and prints their names and ages.
```typescript
interface Student {
	name: string;
	age: number;
}
const students: Student[] = [
	{ name: "Alice", age: 20 },
	{ name: "Bob", age: 22 }
];
function printStudents(list: Student[]): void {
	list.forEach(s => console.log(`${s.name} (${s.age})`));
}
printStudents(students);
```

---


## 10. Resources
Explore these resources to learn more and practice TypeScript:
- [TypeScript Official Docs](https://www.typescriptlang.org/docs/)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- Community: Stack Overflow, Discord, GitHub
