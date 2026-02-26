
export async function sha256(message) {
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
        try {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            // fallback
        }
    }
    return sha256Fallback(message);
}
/**
 * Pure JS SHA-256 fallback for environments without SubtleCrypto
 */
function sha256Fallback(message) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
        0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
        0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
        0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
        0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
        0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
        0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
        0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
        0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    let H = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];
    // Pre-processing: convert to bytes
    const bytes = [];
    for (let i = 0; i < message.length; i++) {
        const code = message.charCodeAt(i);
        if (code < 0x80) {
            bytes.push(code);
        } else if (code < 0x800) {
            bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else {
            bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        }
    }
    const bitLength = bytes.length * 8;
    bytes.push(0x80);
    while ((bytes.length % 64) !== 56) bytes.push(0);
    // Append bit length (big-endian 64-bit)
    for (let i = 56; i >= 0; i -= 8) {
        bytes.push((bitLength >>> i) & 0xff);
    }
    // Process each 512-bit chunk
    for (let offset = 0; offset < bytes.length; offset += 64) {
        const W = new Array(64);
        for (let i = 0; i < 16; i++) {
            W[i] = (bytes[offset + i * 4] << 24) |
                (bytes[offset + i * 4 + 1] << 16) |
                (bytes[offset + i * 4 + 2] << 8) |
                (bytes[offset + i * 4 + 3]);
        }
        for (let i = 16; i < 64; i++) {
            const s0 = rightRotate(W[i - 15], 7) ^ rightRotate(W[i - 15], 18) ^ (W[i - 15] >>> 3);
            const s1 = rightRotate(W[i - 2], 17) ^ rightRotate(W[i - 2], 19) ^ (W[i - 2] >>> 10);
            W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
        }
        let [a, b, c, d, e, f, g, h] = H;
        for (let i = 0; i < 64; i++) {
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + K[i] + W[i]) | 0;
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) | 0;
            h = g;
            g = f;
            f = e;
            e = (d + temp1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) | 0;
        }
        H = [
            (H[0] + a) | 0, (H[1] + b) | 0, (H[2] + c) | 0, (H[3] + d) | 0,
            (H[4] + e) | 0, (H[5] + f) | 0, (H[6] + g) | 0, (H[7] + h) | 0,
        ];
    }
    return H.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}
/**
 * Hash a PIN with a salt for secure storage
 * Double-hashing with salt for additional security
 */
export async function hashPin(pin) {
    const salt = 'tpl_web3_secure_v1';
    const firstHash = await sha256(salt + pin + salt);
    return sha256(firstHash + salt); 
}
export async function verifyPin(pin, storedHash) {
    const computed = await hashPin(pin);
    return computed === storedHash;
}
function extractFingerprint(strokes) {
    if (!strokes || strokes.length === 0) return '';
    const allPoints = strokes.flatMap(s => s);
    if (allPoints.length < 3) return '';
    const strokeCount = strokes.length;
    // Aspect ratio
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of allPoints) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    const bboxW = Math.max(maxX - minX, 1);
    const bboxH = Math.max(maxY - minY, 1);
    const aspectRatio = bboxW / bboxH;
    const arBin = aspectRatio < 0.6 ? 'T' : aspectRatio < 1.7 ? 'S' : 'W';
    let totalDist = 0;
    for (const stroke of strokes) {
        for (let i = 1; i < stroke.length; i++) {
            const dx = stroke[i].x - stroke[i - 1].x;
            const dy = stroke[i].y - stroke[i - 1].y;
            totalDist += Math.sqrt(dx * dx + dy * dy);
        }
    }
    const diag = Math.sqrt(bboxW * bboxW + bboxH * bboxH);
    const normDist = totalDist / Math.max(diag, 1);
    const cxBin = normDist < 4 ? 'S' : normDist < 12 ? 'M' : 'C';
    const orientations = [];
    for (const stroke of strokes) {
        if (stroke.length < 2) { orientations.push('P'); continue; }
        let pathLen = 0;
        for (let i = 1; i < stroke.length; i++) {
            const dx = stroke[i].x - stroke[i - 1].x;
            const dy = stroke[i].y - stroke[i - 1].y;
            pathLen += Math.sqrt(dx * dx + dy * dy);
        }
        const sdx = stroke[stroke.length - 1].x - stroke[0].x;
        const sdy = stroke[stroke.length - 1].y - stroke[0].y;
        const endDist = Math.sqrt(sdx * sdx + sdy * sdy);
        const closedness = endDist / Math.max(pathLen, 1);
        if (closedness < 0.35) {
            orientations.push('C');
        } else {
            const absDx = Math.abs(sdx);
            const absDy = Math.abs(sdy);
            const ratio = Math.min(absDx, absDy) / Math.max(absDx, absDy, 1);
            if (ratio < 0.5) {
                orientations.push(absDx > absDy ? 'H' : 'V');
            } else {
                orientations.push('D');
            }
        }
    }
    const strokeInfos = orientations.map((orient, idx) => {
        const stroke = strokes[idx];
        const cx = stroke.reduce((s, p) => s + p.x, 0) / stroke.length;
        const cy = stroke.reduce((s, p) => s + p.y, 0) / stroke.length;
        const normY = (cy - minY) / Math.max(bboxH, 1);
        const normX = (cx - minX) / Math.max(bboxW, 1);
        return { orient, normY, normX };
    });
    strokeInfos.sort((a, b) => {
        if (Math.abs(a.normY - b.normY) > 0.15) return a.normY - b.normY;
        return a.normX - b.normX;
    });
    const orientSig = strokeInfos.map(s => s.orient).join('');
    return `${strokeCount}-${arBin}-${cxBin}-${orientSig}`;
}
/**
 * "Hash" a drawing — returns the behavioral fingerprint string.
 */
export async function hashDrawing(strokes) {
    const fingerprint = extractFingerprint(strokes);
    if (!fingerprint) return '';
    return fingerprint;
}
/**
 * Compare two fingerprint strings with tolerance.
 *
 * Format: "strokeCount-AR-CX-orientations"
 *
 * Rules:
 *  - Stroke count: exact match required
 *  - AR & CX: adjacent-or-exact
 *  - Per-stroke orientations (sorted):
 *    → D can match H or V (diagonal is ambiguous)
 *    → C must match C (closed ≠ open)
 *    → At most 1 such D↔H/D↔V tolerance allowed
 */
export function compareFingerprints(fp1, fp2) {
    if (!fp1 || !fp2) return false;
    const p1 = fp1.split('-');
    const p2 = fp2.split('-');
    if (p1.length !== 4 || p2.length !== 4) return false;
    const [sc1, ar1, cx1, orient1] = p1;
    const [sc2, ar2, cx2, orient2] = p2;
    // Stroke count: exact
    if (parseInt(sc1, 10) !== parseInt(sc2, 10)) return false;
    // Orientations must be same length (implied by stroke count match)
    if (orient1.length !== orient2.length) return false;
    // Compare per-stroke orientations character by character
    let orientTolerance = 0;
    for (let i = 0; i < orient1.length; i++) {
        if (orient1[i] === orient2[i]) continue; // exact match
        const pair = orient1[i] + orient2[i];
        // D (diagonal) can be confused with H or V — allow 1 such mismatch
        if (pair === 'DH' || pair === 'HD' || pair === 'DV' || pair === 'VD') {
            orientTolerance++;
            if (orientTolerance > 1) return false; 
        } else {
            return false; 
        }
    }
    const isClose = (a, b, order) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        return ia !== -1 && ib !== -1 && Math.abs(ia - ib) <= 1;
    };
    if (!isClose(ar1, ar2, ['T', 'S', 'W'])) return false;
    if (!isClose(cx1, cx2, ['S', 'M', 'C'])) return false;
    return true;
}
export async function verifyDrawing(strokes, storedFingerprint) {
    const fingerprint = extractFingerprint(strokes);
    if (!fingerprint || !storedFingerprint) return false;
    return compareFingerprints(fingerprint, storedFingerprint);
}
export async function hashExportPassword(password) {
    const salt = 'tpl_export_cipher_v1';
    const h1 = await sha256(salt + password);
    return sha256(h1 + salt + password);
}
export async function encryptData(text, password) {
    const salt = 'tpl_salt_v2'; 
    const keyMaterial = await sha256(salt + password); 
    if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
        try {
            const enc = new TextEncoder();
            const keyBuffer = enc.encode(keyMaterial); 
            const key = await globalThis.crypto.subtle.importKey(
                'raw',
                keyBuffer.slice(0, 32), 
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
            const iv = globalThis.crypto.getRandomValues(new Uint8Array(12)); 
            const encodedText = enc.encode(text);
            const encrypted = await globalThis.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv },
                key,
                encodedText
            );
            const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
            const cipherHex = Array.from(new Uint8Array(encrypted)).map(b => b.toString(16).padStart(2, '0')).join('');
            return `v2:${ivHex}:${cipherHex}`;
        } catch (e) {
            console.log('WebCrypto AES-GCM failed, falling back to JS CTR:', e);
        }
    }
    // Fallback: AES-CTR-like Stream Cipher (Robust JS implementation)
    // We utilize the SHA-256 hash as a PRNG to generate a keystream (like ChaCha20)
    // This is cryptographically much stronger than Vigenere/XOR
    // 1. Generate random IV
    const iv = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
    const ivHex = iv.map(b => b.toString(16).padStart(2, '0')).join('');
    // 2. Generate Keystream & XOR
    // Key = passwordHash, IV = Random
    let keystream = [];
    const blockCount = Math.ceil(text.length / 32);
    // Generate blocks using SHA256(key + iv + counter)
    let ciphertext = '';
    for (let i = 0; i < text.length; i++) {
        // Refresh keystream buffer every 32 bytes
        if (i % 32 === 0) {
            const counter = Math.floor(i / 32);
            // This acts as our PRNG function
            const blockKey = await sha256(keyMaterial + ivHex + counter.toString(16));
            keystream = blockKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
        }
        const charCode = text.charCodeAt(i);
        // Supports UTF-16 somewhat by splitting high chars, but JSON.stringify mostly ascii/utf8 compliant range for logic
        // For robustness, we process utf16 char codes (0-65535)
        // To keep it simple and hex-compatible:
        const keyByte = keystream[i % 32];
        const xored = charCode ^ keyByte;
        // Store as 4-char hex to support full UTF-16 range safely
        ciphertext += xored.toString(16).padStart(4, '0');
    }
    return `v2-js:${ivHex}:${ciphertext}`;
}
export async function decryptData(encryptedStr, password) {
    if (!encryptedStr) return null;
    try {
        const salt = 'tpl_salt_v2';
        const keyMaterial = await sha256(salt + password);
        if (encryptedStr.startsWith('v2:')) {
            const parts = encryptedStr.split(':');
            const ivHex = parts[1];
            const cipherHex = parts[2];
            if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.subtle) {
                const enc = new TextEncoder();
                const dec = new TextDecoder();
                const keyBuffer = enc.encode(keyMaterial);
                const key = await globalThis.crypto.subtle.importKey(
                    'raw',
                    keyBuffer.slice(0, 32),
                    { name: 'AES-GCM' },
                    false,
                    ['encrypt', 'decrypt']
                );
                const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                const ciphertext = new Uint8Array(cipherHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    key,
                    ciphertext
                );
                return dec.decode(decryptedBuffer);
            }
        }
        if (encryptedStr.startsWith('v2-js:')) {
            const parts = encryptedStr.split(':');
            const ivHex = parts[1];
            const ciphertext = parts[2];
            let plaintext = '';
            let keystream = [];
            // 4 hex chars per original char
            const totalChars = ciphertext.length / 4;
            for (let i = 0; i < totalChars; i++) {
                if (i % 32 === 0) {
                    const counter = Math.floor(i / 32);
                    const blockKey = await sha256(keyMaterial + ivHex + counter.toString(16));
                    keystream = blockKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
                }
                const hexSegment = ciphertext.substr(i * 4, 4);
                const xored = parseInt(hexSegment, 16);
                const keyByte = keystream[i % 32];
                const charCode = xored ^ keyByte;
                plaintext += String.fromCharCode(charCode);
            }
            return plaintext;
        }
        // Legacy V1 (Hex XOR) support attempt? 
        // User wants "impossible to decipher", implying we might not care about old weak exports, 
        // but for safety we return null if format doesn't match new secure V2.
        return null;
    } catch (e) {
        console.warn('Decryption error:', e);
        return null;
    }
}
export const obfuscateData = encryptData;
export const deobfuscateData = decryptData;
