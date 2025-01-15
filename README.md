# Fusion Chat

Fusion Chat is an innovative communication application that allows for text conversations. The application is still under development, so some features may not yet be available. Fusion Chat is available for web browsers, desktops, and mobile devices.

## Features

- Text conversations
- Application available for web browsers, desktops, and mobile devices
- Integration with Firebase and other services through configuration files

## Installation and Setup

Requirements:

* [Node.js](https://nodejs.org/en/download/)
* [Yarn](https://yarnpkg.com/en/docs/install)
* [Git](https://git-scm.com/downloads)
* [TypeScript compiler](https://www.npmjs.com/package/typescript) (`tsc`)
* [TypeScript alias compiler](https://www.npmjs.com/package/tsc-alias) (`tsc-alias`)

### Server

1. Clone the repository:
```bash
git clone https://github.com/wxn0brP/fusion-chat.git
cd fusion-chat
```

2. Install dependencies:
```bash
yarn install
```

3. Compile the TypeScript code:
```bash
yarn build
```

4. Copy the configuration file `.env.txt` to `.env` and edit accordingly:
```bash
cp .env.txt .env
nano .env
```

5. Start the server:
```bash
yarn start
```

6. After the first launch, configuration files will be created in the `config/` directory. Edit these files to customize the configuration:
```bash
nano config/databases.json
nano config/mailConfig.json
nano config/logs.js
nano config/file.js
nano config/firebase.json
```

7. For detailed explanations of configuration options, refer to the files in the docs/config directory.

### Frontend (Web Client) Compilation

1. Navigate to the `front-app` directory:
```bash
cd front-app
```

2. Install dependencies:
```bash
yarn install
```

3. Compile the TypeScript code:
```bash
yarn tsc
```

4. Start the server, and the web application will be available under `/app`.

### Electron Client

1. Navigate to the `fc-app/electron` directory:
```bash
cd fc-app/electron
```

2. Install dependencies:
```bash
yarn install
```

3. Start the application:
```bash
yarn start
```

### React Native Client

1. Navigate to the `fc-app/fc-mobile` directory:
```bash
cd fc-app/fc-mobile
```

2. Install dependencies:
```bash
yarn install
```

3. Launch the application on an emulator or a physical device:
```bash
npx react-native run-android
```
or Open Metro Server:
```bash
yarn start
```

## Contributing

If you would like to contribute to the development of Fusion Chat, please submit a pull request or open an issue on our GitHub repository.

## License

Fusion Chat is licensed under the MIT License. For more information, see the `LICENSE` file.

## Contact

If you have any questions or need assistance, feel free to reach out via GitHub Issues or email us at fusion@fusion.ct8.pl

---

Thank you for using Fusion Chat!