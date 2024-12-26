# Database Configuration

Each database can be of type `local` or `remote`. For `remote` databases, `url` and `auth` are required. If not specified, the default values from `remoteDefault` are used.

## Database List

| **Name**          | **Description**                        |
|-------------------|----------------------------------------|
| `data`            | All types of data                      |
| `dataGraph`       | All types of data graph                |
| `system`          | System configuration and data          |
| `logs`            | Logs                                   |
| `mess`            | Messages                               |
| `userData`        | User data                              |
| `botData`         | Bot data                               |
| `realmConf`       | Realm settings                         |
| `realmRoles`      | Realm roles                            |
| `realmUser`       | Realm users                            |
| `realmData`       | Realm data of all types                |
| `realmDataGraph`  | Realm data graph of all types          |

## Example of Database Configuration

This example demonstrates how the database configuration is structured with `local` and `remote` types:

```js
{
    remoteDefault: {
        url: "https://example.com",        // Default URL for remote databases
        auth: "jwt-token",                 // Default authentication token for remote connections
    },
    
    data: {
        type: "local",                     // Local database, uses the path for storage
        path: "data/data",                 // Local path to store data
    },
    
    dataGraph: {
        type: "remote",                    // Remote database, requires URL and auth
        path: "data/dataGraph",            // Path for data graph storage
    },
    
    system: {
        type: "remote",                    // Remote database
        path: "data/system",               // Path for system data storage
        url: "https://example.com/system",  // Custom URL for this remote database
        auth: "jwt-token",                 // Custom authentication token for this remote database
    },
}
