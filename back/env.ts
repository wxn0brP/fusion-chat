const env = process.env;
import generateJwtSecret from "./logic/token/calculateJwtToken";

if(!env.PORT) env.PORT = "1478";
if(!env.NODE_ENV) env.NODE_ENV = "development";
if(!env.IS_TECHNICAL_BREAK) env.IS_TECHNICAL_BREAK = "false";
if(!env.JWT) env.JWT = generateJwtSecret();