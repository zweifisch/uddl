# Universal Data Description Language

```
TypeScript <- UDDL -> SQL
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

### -> TypeScript

```ts
import {toTS} from 'uddl'
toTS(input)
```
```ts
export class User {
  id: number
  name?: string
  email: string
  gender: number = 0
}
```

### -> SQL

```ts
import {toSQL} from 'uddl'
toSQL(input)
```

```sql
CREATE TABLE "user" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  gender INTEGER DEFAULT 0 NOT NULL
);
```

```ts
toSQL(input, {flavor: 'postgresql'})
```

```sql
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  gender INTEGER DEFAULT 0 NOT NULL
);
```

```ts
import {toSQL} from 'uddl'
toSQL(`
User {
  id(primary_key auto_increment): int
  name(maxLength:255)?: text
  email(maxLength:255): text
  gender(default:0, maximum:3): int
}`, {flavor: 'postgresql'})
```

```sql
CREATE TABLE "user" (
  id PRIMARY KEY BIGSERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  gender SMALLINT default 0
);
```

### -> json-schema

```ts
import {toJSONSchema} from 'uddl'
toJSONSchema(input)
```

```json
{
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string"
        },
        "gender": {
          "type": "integer"
        },
        "id": {
          "type": "integer"
        },
        "name": {
          "type": "string"
        }
      },
      "required": [ "id", "email", "gender" ]
    }
  }
}
```
