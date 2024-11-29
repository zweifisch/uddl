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
  name?: string
  email(unique maxLength:255): string
  gender(default:0 maximum:2): int
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

#### postgresql

```ts
toSQL(input, {flavor: 'postgresql'})
```

```sql
CREATE TABLE "user" (
  id PRIMARY KEY BIGSERIAL,
  name TEXT,
  email VARCHAR(255) NOT NULL,
  gender SMALLINT NOT NULL DEFAULT 0
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
          "type": "string",
          "maxLength": 255
        },
        "gender": {
          "maximum": 2,
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
