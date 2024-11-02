import { SignJWT, jwtVerify, jwtDecrypt, EncryptJWT } from "jose";
import keyManager, { KeyIndex } from "./KeyManager.js";

const secretKey = new TextEncoder().encode(process.env.JWT);

/**
 * Creates a JWT token, either encrypted or plain.
 * @param {Object} data - User data to include in the token.
 * @param {boolean|number|string} exp - Expiration time for the token; false means no expiration.
 * @param {boolean|number} encrypt - If true, the token is encrypted; if a number, selects a specific key pair for encryption.
 * @returns {Promise<string>} Returns an encrypted token (JWE) or a signed token (JWS).
 */
export async function create(data, exp=true, encrypt=false){
    // Create the signed JWT token
    const jwt = new SignJWT(data)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt();

    if(exp !== false){
        if(exp === true) exp = "1h";
        else if(typeof exp === "number") exp = exp + "s";
        jwt.setExpirationTime(exp ? exp : "1h");
    }

    const signedToken = await jwt.sign(secretKey);

    // If encryption is required, use the specified key pair for encryption
    if(encrypt){
        const keyIndex = typeof encrypt === "number" ? encrypt : KeyIndex.GENERAL;
        const keyPair = await keyManager.getKeyPair(keyIndex);

        if(!keyPair){
            throw new Error(`Key with index ${keyIndex} does not exist.`);
        }

        const encryptedToken = new EncryptJWT({ token: signedToken })
            .setProtectedHeader({ alg: "RSA-OAEP-256", enc: "A256GCM" });

        if(exp !== false)
            encryptedToken.setExpirationTime(exp ? exp : "1h");

        return await encryptedToken
            .encrypt(keyPair.publicKey);
    }

    return signedToken; // If not encrypted, return the signed token
}

/**
 * Decrypts and verifies a JWT token.
 * @param {string} token - The JWT token to verify.
 * @param {number} keyIndex - Index of the key for decryption (for encrypted tokens).
 * @returns {Promise<Object|null>} Returns the token payload if valid; otherwise, null.
 */
export async function decode(token, keyIndex){
    try{
        if(keyIndex){
            // If token is encrypted, decrypt it first
            const keyPair = await keyManager.getKeyPair(keyIndex);
            if(!keyPair){
                throw new Error(`Key with index ${keyIndex} does not exist.`);
            }

            const decrypted = await jwtDecrypt(token, keyPair.privateKey);
            const decoded = await jwtVerify(decrypted.payload.token, secretKey);
            return decoded.payload;
        }else{
            // For signed-only tokens, verify directly
            const { payload } = await jwtVerify(token, secretKey);
            return payload;
        }
    }catch(error){
        if(process.env.status == "dev") console.error("Token verification error:", error);
        return null;
    }
}

export { KeyIndex };