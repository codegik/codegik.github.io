---
title: Avoiding Code Obscurity
author: Inácio Klassmann
date: 2023-09-20 20:55:00
categories: [software design, code obscurity]
tags: [software design, obscurity, good practice, information hiding, variable scope, maintainable, collaborative code, understandable]
pin: true
math: true
mermaid: true
image:
  path: /assets/img/avoiding-obscurity.png
---

In software development, "obscurity" typically refers to the practice of making code, algorithms, or system design difficult to understand or decipher. This can be done for various reasons, but most of them is due bad practice in software development, generally this is discouraged by community.

This involves writing code in a convoluted manner, using complex or unconventional syntax, variable names, or control structures that make it hard for others (or even oneself at a later date) to comprehend the logic or purpose of the code. Purposefully obscure code can be a security risk and is generally considered bad practice because it decreases maintainability and collaboration.

Code obscurity can be caused by a variety of factors and practices that make the code difficult to read, understand, or maintain. Here are several factors that contribute to code obscurity:

- **Poor Naming Conventions:**
Using unclear, ambiguous, or non-descriptive names for variables, functions, classes, or methods can obscure the intent and purpose of the code.

- **Abbreviations:**
Using abbreviations that are not intuitive or are not widely understood can make the code confusing and difficult to comprehend.

- **Lack of Comments or Documentation:**
Failing to provide adequate comments and documentation explaining the high level of functionality, and design decisions can obscure the code's purpose and make it difficult for others to understand.

- **Complex Control Flow:**
Writing code with convoluted control flow, deeply nested loops, and excessive branching can make the logic hard to follow and understand.

- **Magic Numbers and Hardcoding:**
Using arbitrary constants or "magic numbers" in the code without context or explanation can make the code confusing and difficult to modify or maintain.

- **Overuse of Short-Lived Variables:**
Creating numerous short-lived or poorly named variables can clutter the code and hinder its readability.

- **Improper Error Handling:**
Neglecting to handle errors or exceptions properly and hiding error messages or stack traces can obscure debugging and troubleshooting efforts.

Avoiding code obscurity in software development is crucial for creating maintainable, understandable, and collaborative code.

## Not Obvious Code Example

### Bad practice

This is an example of code that might not be immediately obvious to someone reading it.

```java
void sum() {
  int[] arr1 = {1, 2, 3, 4, 5};
  int[] arr2 = {6, 7, 8, 9, 10};

  int sum = 0;
  for (int i = 0; i < arr1.length; sum += arr1[i] * arr2[i], i++);

  System.out.println("The obscure sum is: " + sum);
}
```
The loop uses a compact representation with a comma operator and no curly braces for the loop body, which might not be immediately clear to everyone.

The calculation of `sum` within the loop header is not a common practice and could be confusing.

### Good practice

To make the code more clear and follow good coding practices, we can rewrite it using more conventional and understandable approaches.

```java
void sum() {
  int[] arr1 = {1, 2, 3, 4, 5};
  int[] arr2 = {6, 7, 8, 9, 10};

  int sum = calculateSum(arr1, arr2);
  System.out.println("The calculated sum is: " + sum);
}

int calculateSum(int[] arr1, int[] arr2) {
  if (arr1.length != arr2.length) {
      throw new IllegalArgumentException("Arrays must have the same length.");
  }

  int sum = 0;
  for (int i = 0; i < arr1.length; i++) {
      sum += arr1[i] * arr2[i];
  }

  return sum;
}
```
We separate the calculation of the `sum` into a named method `calculateSum`, which enhances readability and makes the code more modular.

We added error handling to ensure that the arrays have the same length.

By following these practices, the code becomes more readable, modular, and making it easier for others to understand and maintain.

## Variable Scope Example

### Bad practice

Using global variables (class-level fields) excessively or inappropriately can lead to bad coding practices, decrease code maintainability, and introduce unexpected behavior. 

Here's an example illustrating the misuse of global variables.

```java
class Sum {
  private int totalSum = 0;
  private String message = "Hello";

  public void addValue(int value) {
    totalSum += value;
  }

  public void displayMessage() {
    System.out.println(message);
  }

  public void calculate() {
    addValue(5);
    displayMessage();
    
    totalSum = 10;
    message = "Modified message";
    
    addValue(7);
    displayMessage();
    
    System.out.println("Total sum: " + totalSum);
    System.out.println("Message: " + message);
  }

  public static void main(String[] args) {
      new Sum().calculate();
  }
}
```

Global variables `totalSum` and `message` are accessed and modified directly from many methods, violating encapsulation and hiding the behavior of the class.

Methods like `addValue` and `displayMessage` operate on global variables directly, making the code less modular and harder to reason about.

Modifying global variables from various parts of the code can lead to unexpected behavior and bugs that are difficult to trace.

We make the code less modular, less flexible, and less scalable when we use global variables.

For example, if two modules share a global variable, we can't modify one without considering how that affects the other.

### Good practice

To avoid the issues related to excessive use of global variables, it's important to follow good programming practices, including encapsulation, appropriate variable scoping, and using object-oriented design principles. 

Here's an example that demonstrates better practices to avoid unnecessary global variables.

```java
class Sum {
  private int totalSum = 0;
  private String message = "Hello";

  private void addValue(int value) {
    totalSum += value;
  }

  private void displayMessage() {
    System.out.println(message);
  }

  private int getTotalSum() {
    return totalSum;
  }

  private String getMessage() {
    return message;
  }

  public void calculate() {
    addValue(5);
    displayMessage();

    addValue(7);
    displayMessage();

    System.out.println("Total sum: " + getTotalSum());
    System.out.println("Message: " + getMessage());
  }
  
  public void main(String[] args) {
    new Sum().calculate();
  }
}
```

The variables `totalSum` and `message` are now controlled through getter methods `getTotalSum()` and `getMessage()`. This promotes encapsulation and information hiding.

The initialization of these variables and their manipulation is done through appropriate methods within the class, maintaining a clear and understandable interface.

The `main` method interacts with the class using public methods, promoting a modular and encapsulated design.

By following these practices, the code becomes more maintainable, extensible, and easier to understand. 

We should encapsulate data as much as possible. That means that we should define all the attributes that a class needs inside that class and use explicit methods to access or modify them.

## Overuse of Short-Lived Variables Example

### Bad practice

Refers to the practice of creating numerous variables with short lifespans and unclear names, making the code harder to understand. Here's an example illustrating this bad practice:

```java
void calculate() {
  int a = 10;
  int b = 5;
  int c = a * b;
  int d = c + a;
  int e = d / b;
  
  System.out.println("The result is: " + e);
}
```

Each variable is used for a single operation, making the code harder to follow, especially if the operations become more complex.

### Good practice

A better practice would involve giving variables more meaningful names and consolidating related operations, which would improve code readability and maintainability. For instance:

```java
void calculate() {
  int startRangeAt = 5;
  int endRangeAt = 10;
  int result = (startRangeAt * endRangeAt) + (startRangeAt / endRangeAt);

  System.out.println("The result is: " + result);
}
```

In this improved example, variables have more descriptive names, and related operations are consolidated in one line, making the code easier to understand.

## Complex Control Flow Example

### Bad practice

Here's an example with many branches demonstrating complex control flow.

```java
void calculate() {
  int[] numbers = {1, 5, 8, 2, 10, 4};
  int sum = 0;

  for (int i = 0; i < numbers.length; i++) {
      if (numbers[i] % 2 == 0) {
          if (numbers[i] < 5) {
              sum += numbers[i] * 2;
          } else if (numbers[i] >= 5 && numbers[i] < 10) {
              sum += numbers[i] * 3;
          } else {
              sum += numbers[i] * 4;
          }
      } else {
          if (numbers[i] < 5) {
              sum -= numbers[i];
          } else if (numbers[i] >= 5 && numbers[i] < 10) {
              sum -= numbers[i] / 2;
          } else {
              sum -= numbers[i] / 3;
          }
      }
  }

  System.out.println("The calculated sum is: " + sum);
}

```

Its king hard to understand at the first look, isn't?

The control flow within the loop involves multiple nested if-else conditions, each with multiple branches.

Depending on the value and parity of each number, different actions are taken, making the logic complex and harder to follow.

Complex control flow with many branches can lead to code that is difficult to understand, especially as the number of conditions and actions increases. It's important to simplify such control flow, if possible, for improved readability and maintainability.


### Good practice

Let's refactor the previous complex control flow example to improve its readability and maintainability using the best practices.

```java
void calculate() {
  int[] numbers = {1, 5, 8, 2, 10, 4};
  int sum = 0;

  for (int num : numbers) {
    sum += calculateSumForNumber(num);
  }

  System.out.println("The calculated sum is: " + sum);
}

int calculateSumForNumber(int num) {
  if (num % 2 == 0) {
    if (num < 5) {
        return num * 2;
    } else if (num < 10) {
        return num * 3;
    }
    return num * 4;
  } else {
    if (num < 5) {
        return -num;
    } else if (num < 10) {
        return -num / 2;
    }
    return -num / 3;
  }
}
```

We've extracted the complex logic for calculating the sum of each number into a separate method `calculateSumForNumber`. The method `calculateSumForNumber` calculates the sum for a given number based on its properties (even/odd and value).

By breaking down the logic into methods, we've made the code more modular and easier to understand.

Meaningful method names and descriptive comments can further aid in understanding the purpose of each method.

This refactoring improves the readability and maintainability of the code by encapsulating the complex control flow within a separate function. We tried to reduce branches as much as we could, but looks like we still have many branches. Indeed, this happens because this example is complex by nature. There are other ways to solve that, but this is a conversation for another article.


## Keep in mind
To avoid complex control flow and enhance code clarity, it's important to follow best practices that promote simplicity, modularity, and readability. Here are some guidelines to achieve cleaner and more maintainable code:

- Use Meaningful Variable and Method Names.
- Break Down Complex Logic into functions based on cohesion.
- Reduce nesting and use early returns:
- Utilize switch statements for multiple branches.
- Use guard clauses for special cases.
- Comment complex logic.
- Apply design patterns.
- Write unit tests.
- Regular code reviews and refactorings.

By adhering to these best practices, you can significantly reduce complex control flow, enhance code maintainability, and improve the readability of your codebase.
