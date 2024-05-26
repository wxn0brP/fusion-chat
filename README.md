# Fusion Chat

Fusion Chat is an innovative communication application that allows for text conversations. The application is still under development, so some features may not yet be available. Fusion Chat is available for web browsers, desktops, and mobile devices.

## Features

- Text conversations
- Application available for web browsers, desktops, and mobile devices
- Integration with Firebase and other services through configuration files

## Installation and Setup

### Server

1. Clone the repository:
```bash
git clone https://github.com/wxn0brP/fusion-chat.git
cd fusion-chat
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Copy the configuration file `.env.txt` to `.env` and edit accordingly:
```bash
cp .env.txt .env
nano .env
```

4. Start the server:
```bash
yarn start
# or
npm start
```

5. After the first launch, configuration files will be created in the `config/` directory. Edit these files to customize the configuration:
```bash
nano config/firebase.json
nano config/mailConfig.json
```

### Web Client

The web application will be available under `/app` after starting the server.

### Electron Client

1. Navigate to the `/fc-app/electron` directory:
```bash
cd fc-app/electron
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Start the application:
```bash
yarn start
# or
npm start
```

### React Native Client

1. Navigate to the `/fc-app/fc-mobile` directory:
```bash
cd fc-app/fc-mobile
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Launch the application on an emulator or a physical device:
```bash
npx react-native run-android
```

## Contributing

If you would like to contribute to the development of Fusion Chat, please submit a pull request or open an issue on our GitHub repository.

## License

Fusion Chat is licensed under the MIT License. For more information, see the `LICENSE` file.

## Contact

If you have any questions or need assistance, please contact us at fusion@fusion.ct8.pl.

---

Thank you for using Fusion Chat!