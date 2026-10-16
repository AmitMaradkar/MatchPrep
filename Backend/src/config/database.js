const mongoose = require("mongoose")

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null }
}

async function connectToDB() {
    if (cached.conn && mongoose.connection.readyState >= 1) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI).then((mongooseInstance) => {
            console.log("Connected to Database")
            return mongooseInstance
        })
    }

    try {
        cached.conn = await cached.promise
    } catch (err) {
        cached.promise = null
        console.error("Database connection error:", err)
        throw err
    }

    return cached.conn
}

module.exports = connectToDB