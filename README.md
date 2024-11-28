# Universal Schema Language

```
TypeScript <- USL -> SQL
               |
               v
          json-schema
```

Example:

```
User {
  id(primary_key auto_increment): int
  name?: text
  email(unique): text
  gender(default:0): int
}
```

```ts
export class User {
  id: number
  name?: string
  email: string
  gender: number = 0
}
```

```sql
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  gender INT DEFAULT 0
)
```

json-schema

```js
```
