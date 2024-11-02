const env = process.env;
import generateJwtSecret from "./logic/token/calculateJwtToken.js";

if(!env.PORT) env.PORT = 1478;
if(!env.status) env.status = "dev";
if(!env.pageBreak) env.pageBreak = false;
if(!env.JWT) env.JWT = generateJwtSecret();