/**
 * api/nfts.js — Vercel Serverless Function
 *
 * GET  /api/nfts?wallet=0x...   → devuelve los NFTs del usuario desde MongoDB
 * POST /api/nfts                → guarda un NFT recién minteado en MongoDB
 *
 * La conexión a MongoDB se hace con el driver nativo (mongodb) para evitar
 * la sobrecarga de Mongoose en funciones serverless.
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'tuplayalimpia';
const COLLECTION = 'nfts';

/** Reutiliza la conexión entre invocaciones en el mismo contenedor (warm start). */
let _client = null;

async function getCollection() {
    if (!_client) {
        _client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
        });
        await _client.connect();
    }
    return _client.db(DB_NAME).collection(COLLECTION);
}

export default async function handler(req, res) {
    // CORS básico para la web app
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const col = await getCollection();

        // ----------------------------------------------------------------
        // GET /api/nfts?wallet=0x...
        // Devuelve todos los NFTs asociados a esa wallet, ordenados por fecha.
        // ----------------------------------------------------------------
        if (req.method === 'GET') {
            const { wallet } = req.query;
            if (!wallet) {
                return res.status(400).json({ error: 'Falta el parámetro wallet' });
            }

            const nfts = await col
                .find({ wallet: wallet.toLowerCase() })
                .sort({ mintedAt: -1 })
                .toArray();

            return res.status(200).json({ nfts });
        }

        // ----------------------------------------------------------------
        // POST /api/nfts
        // Body: { wallet, missionId, txHash, metadata, nftLocalId }
        // Guarda el registro del NFT minteado on-chain.
        // ----------------------------------------------------------------
        if (req.method === 'POST') {
            const { wallet, missionId, txHash, metadata, nftLocalId } = req.body;

            if (!wallet || !txHash) {
                return res.status(400).json({ error: 'Faltan campos requeridos: wallet, txHash' });
            }

            // Evitar duplicados si se llama dos veces con el mismo txHash
            const existing = await col.findOne({ txHash });
            if (existing) {
                return res.status(200).json({ ok: true, duplicate: true, id: existing._id });
            }

            const doc = {
                wallet: wallet.toLowerCase(),
                missionId,
                txHash,
                metadata: metadata || {},
                nftLocalId: nftLocalId || null,
                mintedAt: new Date(),
            };

            const result = await col.insertOne(doc);
            return res.status(201).json({ ok: true, id: result.insertedId });
        }

        return res.status(405).json({ error: 'Método no permitido' });

    } catch (err) {
        console.error('[api/nfts] Error:', err);
        return res.status(500).json({ error: 'Error interno del servidor', details: err.message });
    }
}
