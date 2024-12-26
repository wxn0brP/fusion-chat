## POST /api/realm/profile/upload

### Description
Upload a profile picture to the realm.

### Codes
- 200: Success. Used `err` flag to indicate success or failure.
- 400: Bad request. Used `err` flag to indicate success or failure.
- 403: Forbidden. Used `err` flag to indicate success or failure.
- 500: Internal server error. Used `err` flag to indicate success or failure.

### Headers

| Name | Type   | Description |
|------|--------|-------------|
| `Authorization`  | string | The authorization token for authentication. |
| `realm` | string | The realm to upload the emoji to. |

### Body

| Name | Type   | Description |
|------|--------|-------------|
| `file`  | file | The emoji file to upload. |

### Response

| Name  | Type    | Description                  |
|-------|---------|------------------------------|
| `err` | boolean | Indicates if there was an error. `true` for error, `false` for success. |
| `msg` | string  | A message providing more details about the response (e.g., error or success message). |

### Example Response (Success)

```json
{
    "err": false,
    "msg": "Profile picture uploaded successfully"
}
```

### Example Response (Error)
Code 403

```json
{
    "err": true,
    "msg": "You do not have permission to do that."
}
```