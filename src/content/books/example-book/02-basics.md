---
title: '第二章：基础类型'
draft: false
---

## 基础类型

TypeScript 支持与 JavaScript 几乎相同的数据类型，此外还提供了实用的枚举类型。

### 布尔值

```typescript
let isDone: boolean = false;
```

### 数字

```typescript
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
```

### 字符串

```typescript
let color: string = "blue";
let sentence: string = `My favorite color is ${color}`;
```

### 数组

```typescript
let list: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3];
```

### 元组

```typescript
let x: [string, number];
x = ["hello", 10]; // OK
```

下一章我们将学习更高级的类型特性。
