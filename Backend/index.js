require("dotenv").config()
const app = require("./src/app")

// Export the app for Vercel Serverless
module.exports = app

// Only start listening on port in standalone/local development
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}
