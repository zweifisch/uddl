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

### -> TypeScript

```ts
import {toTS} from 'usl'
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
import {toSQL} from 'usl'
toSQL(input)
```
```sql
CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  gender INTEGER DEFAULT 0 NOT NULL
);
```

### -> json-schema

```ts
import {toJSONSchema} from 'usl'
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
