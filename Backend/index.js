require("dotenv").config()

let app
let initError = null

try {
    app = require("./src/app")
} catch (err) {
    initError = err
    console.error("CRITICAL: Failed to load Express app:", err)
}

module.exports = (req, res) => {
    if (initError || !app) {
        return res.status(500).json({
            error: "Application Initialization Failed",
            message: initError ? initError.message : "Express app is not initialized",
            details: initError ? initError.stack : null
        })
    }

    return app(req, res)
}
