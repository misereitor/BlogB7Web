const mongoose = require("mongoose")

require('dotenv').config({ path: "variables.env" })
//conexão com o banco de dados
mongoose.connect(process.env.DATABASE, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
mongoose.Promise = global.Promise
mongoose.connection.on("error", (error) => console.error("Erro: " + error.message))

//carregando todos os models
require("./models/Post")
const app = require("./app")
app.set("port", process.env.PORT || 3000)

const server = app.listen(app.get("port"))