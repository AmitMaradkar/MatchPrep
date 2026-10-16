require("dotenv").config()

// Polyfill browser globals required by pdf-parse in serverless Node.js environments
if (typeof global.DOMMatrix === "undefined") {
    global.DOMMatrix = class DOMMatrix {
        constructor() {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        }
    }
}
if (typeof global.Path2D === "undefined") {
    global.Path2D = class Path2D {}
}
if (typeof global.ImageData === "undefined") {
    global.ImageData = class ImageData {}
}

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
