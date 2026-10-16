const mongoose = require("mongoose")

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDB() {
    if (cached.conn && mongoose.connection.readyState >= 1) {
        return cached.conn
    }

    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI is missing from environment variables.")
        throw new Error("MONGO_URI environment variable is not defined.")
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        }).then((mongooseInstance) => {
            console.log("Connected to Database")
            return mongooseInstance
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (err) {
        cached.promise = null
        console.error("Database connection error:", err.message)
        throw err
    }

    return cached.conn
}

module.exports = connectToDB