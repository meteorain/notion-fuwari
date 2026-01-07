---
title: '第三章：高级类型'
draft: false
---

## 高级类型

本章介绍 TypeScript 中的高级类型特性。

### 联合类型

```typescript
function padLeft(value: string, padding: string | number) {
  if (typeof padding === "number") {
    return Array(padding + 1).join(" ") + value;
  }
  return padding + value;
}
```

### 类型别名

```typescript
type Name = string;
type NameResolver = () => string;
type NameOrResolver = Name | NameResolver;
```

### 接口

```typescript
interface User {
  name: string;
  age: number;
  email?: string; // 可选属性
}

const user: User = {
  name: "Alice",
  age: 25
};
```

### 泛型

```typescript
function identity<T>(arg: T): T {
  return arg;
}

let output = identity<string>("hello");
```

恭喜你完成了本示例图书的学习！
