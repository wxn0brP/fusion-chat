# Fusion Chat

Fusion Chat is an innovative communication application designed to provide seamless text-based conversations and more. The app is still under development, meaning some features may not yet be available or fully functional. The main goal of Fusion Chat is to offer a user-friendly and versatile communication platform with support across multiple devices and operating systems, including web browsers, desktops, and mobile devices.

## Features

- **Text-based conversations**  
  Fusion Chat allows users to have real-time text-based discussions, providing a fast and reliable communication experience. The chat interface is intuitive and designed for effortless conversations, regardless of device.

- **Voice and video calls**  
  In addition to text messaging, Fusion Chat supports voice and video calls. Users can easily switch between text, voice, or video during conversations, making it a dynamic platform for both casual chats and professional meetings.

- **Multi-platform availability**  
  Fusion Chat works across a wide range of platforms. Whether you're using a web browser, desktop application, or mobile device, you can continue your conversations without interruptions. The app adapts to various screen sizes and interfaces, ensuring a smooth experience across devices.

- **Integration with Firebase and other services**  
  The app is designed to integrate easily with Firebase and other third-party services. Through configurable files, developers can adjust or add integrations to enhance functionality. This provides flexibility for customization and makes Fusion Chat adaptable to different use cases or specific user requirements.

## Installation and Setup (Pre-built Version)

### Requirements:

- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/en/docs/install)
- [Git](https://git-scm.com/downloads)

### Steps:

1. Clone the repository and switch to the `dist` branch:
   ```bash
   git clone https://github.com/wxn0brP/fusion-chat.git
   cd fusion-chat
   git checkout dist
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Copy and configure the environment file:
   ```bash
   cp .env.txt .env
   nano .env
   ```

4. Set up configuration files:
   ```bash
   node dist-back/setUp.js
   ```

5. Customize configuration files created in the `config/` directory:
   ```bash
   nano config/database.json
   nano config/mailConfig.json
   nano config/logs.js
   nano config/file.js
   nano config/firebase.json
   ```

6. For detailed explanations of configuration options, refer to the documentation in the `docs/config` directory.

## Installation and Setup (Source Code Version)

### Additional Requirements:

- [TypeScript compiler](https://www.npmjs.com/package/typescript) (`tsc`)
- [TypeScript alias compiler](https://www.npmjs.com/package/tsc-alias) (`tsc-alias`)

### Server Setup:

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

4. Proceed with the configuration steps as outlined above.

## Frontend (Web Client) Compilation

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
   yarn build
   ```

4. Start the server. The web application will be accessible under `/app`.

## Electron Client Setup

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

## React Native Client Setup

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

4. Alternatively, open the Metro Server:
   ```bash
   yarn start
   ```

## Contributing

Contributions to Fusion Chat are welcome! Please submit a pull request or open an issue on our GitHub repository.

## License

Fusion Chat is licensed under the MIT License. For details, see the `LICENSE` file.

## Contact

For questions or assistance, reach out via GitHub Issues or email us at fusion@fusion.ct8.pl.

---

Thank you for using Fusion Chat!