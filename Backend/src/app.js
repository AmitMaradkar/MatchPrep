require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const mongoose = require("mongoose")
const connectToDB = require("./config/database")

const app = express()

// Auto-connect to DB on API requests (essential for serverless environments like Vercel)
app.use(async (req, res, next) => {
    // Allow health check endpoint without blocking on database
    if (req.path === "/" || req.path === "/api" || req.path === "/api/health") {
        connectToDB().catch(() => {}) // Connect in background
        return next()
    }

    try {
        await connectToDB()
        next()
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message)
        res.status(500).json({ error: "Database connection failed", details: err.message })
    }
})

app.use(express.json())
app.use(cookieParser())

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL
].filter(Boolean)

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, server-side)
        if (!origin) return callback(null, true)
        
        // Allow localhost and specified FRONTEND_URL
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
            return callback(null, true)
        }
        
        // Allow Vercel deployment URLs (*.vercel.app)
        if (origin.endsWith(".vercel.app")) {
            return callback(null, true)
        }

        return callback(null, true)
    },
    credentials: true
}))

// Health check routes
const healthHandler = (req, res) => {
    const dbStateMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    }
    res.json({
        status: "ok",
        message: "MatchPrep API is running",
        database: dbStateMap[mongoose.connection.readyState] || "unknown",
        timestamp: new Date().toISOString()
    })
}

app.get("/", healthHandler)
app.get("/api", healthHandler)
app.get("/api/health", healthHandler)


/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app