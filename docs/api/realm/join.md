## GET /api/realm/join/meta

### Description
Retrieve metadata about a realm.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Headers

| Name | Type   | Description |
|----------|--------|-------------|
| `Authorization`  | string | The authorization token for authentication. |

### Parameters

| Name | Type   | Description |
|----------|--------|-------------|
| `id`     | string | The ID of the realm to retrieve metadata for. |

### Response
| Name | Type | Description |
|----------|------|-------------|
| `err`    | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `state`  | number | Status of the user in relation to the realm. |
| `data`   | object | Contains realm metadata if the user can join. |

#### `state`
| Value | Description |
|-------|-------------|
| `0`   | User can join the realm. |
| `1`   | User exists in the realm. |
| `2`   | User is banned from the realm. |

#### `data`
| Name | Type | Description |
|----------|------|-------------|
| `name`   | string | Name of the realm. |
| `img`    | boolean | Whether the realm has an image. |

### Example Response (Success)
```json
{
    "err": false,
    "state": 0,
    "data": {
        "name": "RealmName",
        "img": true
    }
}
```

### Example Response (Error)
```json
{
    "err": true,
    "msg": "id is required"
}
```


## GET /realm/join

### Description
Join a realm.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Headers

| Name | Type   | Description |
|----------|--------|-------------|
| `Authorization`  | string | The authorization token for authentication. |

### Query Parameters

| Name | Type   | Description |
|----------|--------|-------------|
| `id`     | string | The ID of the realm to join. |

### Response

| Name | Type    | Description                  |
|----------|---------|------------------------------|
| `err`    | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg`    | string  | A message providing more details about the response. |

### Example Response (Success)
```json
{
    "err": false,
    "msg": "ok"
}
```

### Example Response (Error)
```json
{
    "err": true,
    "msg": "Invalid realm ID"
}
```
