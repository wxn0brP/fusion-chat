## GET /api/account/delete/get

### Description
Change deletion token to user name.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Parameters

| Name | Type   | Description |
|------|--------|-------------|
| `token`  | string | The token to delete the account. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |
| `name` | string | The name of the user retrieved by ID. |

### Example Response (Success)

```json
{
    "err": false,
    "name": "user_name"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "user is not found"
}
```


## POST /api/account/delete/confirm

### Description
Confirm delete user account. Account will be deleted after 24 hours.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Body

| Name | Type   | Description |
|------|--------|-------------|
| `token`  | string | The token to delete the account. |
| `pass`  | string | The password to confirm the deletion. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "account pending to be deleted"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "invalid password"
}
```


## POST /api/account/delete/undo

### Description
Undo pending delete user account.

### Codes
Always 200, but returns a JSON response used flag `err`.

### Body

| Name | Type   | Description |
|------|--------|-------------|
| `token`  | string | The token to delete the account. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "successfully remove pending to be deleted"
}
```

### Example Response (Error)

```json
{
    "err": true,
    "msg": "pending process is not found"
}
```