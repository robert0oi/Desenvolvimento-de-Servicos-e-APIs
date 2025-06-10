const express = require("express")
const knex = require("knex")
const errors = require("http-errors")
const app = express()
const cors = require("cors")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors())

// Exemplo de uso do CORS:
// app.use(cors({
//     origin: "http://localhost", // Permitir requisições somente do endereço listado.
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-type', 'Authorization'],
//     credentials: true // cookies
// }))

const PORT = 8001
const hostname = "localhost"

const conn = knex({
    client: "mysql",
    connection: {
        host: hostname,
        user: "root",
        password: "",
        database: "market"
    }
})

app.get("/" , (req, res) => {
    res.json({resposta: "Seja bem-vindo(a) à nossa loja!"}) // Diferença entre objeto json e js, é somente as "" (aspas). Exemplo: {"resposta": "Seja bem-vindo(a) à nossa loja!"}
})

app.get("/product" , (req, res, next) => {
    conn("produto")
    .then((dados) => {res.json(dados)})
    .catch(next)
    //Simplificado:[...](dados => res.json(dados))
})
app.get("/product/:idProd" , (req, res, next) => {
    const id = req.params
    conn("produto")
    .where("id", id)
    .first()
    .then((dados) => {
        if(!dados){
            return next(errors(404, "Produto não encontrado."))
        }
            res.json(dados)
        })
        .catch(next)
    })
    
    app.post( "/product" , (req, res, next) => {
        conn("produto")
        .insert(req.body)
        .then(dados => {
            if(!dados){
                return next(errors(400, "Erro ao inserir.")) 
            }
            res.status(201).json({
                resposta: "Produto Inserido",
                id: dados[0]
            })
        })
        .catch(next)
    })
    
    app.put( "/product/:idProd" , (req, res, next) => {
        const id = req.params.idProd
        conn("produto")
        .where("id", id)
        .update(req.body)
        .then(dados => {
            if(!dados){
                return next(errors(400, "Produto não encontrado.")) 
            }
            res.status(200).json({
                resposta: "Produto editado.",
                retornoBanco: dados[0]
            })
        })
        .catch(next)
    })
    
    app.delete( "/product/:idProd" , (req, res, next) => {
        const id = req.params.idProd
        conn("produto")
        .where("id", id)
        .delete()
        .then(dados => {
            if(!dados){
                return next(errors(400, "Produto não encontrado.")) 
            }
            res.status(200).json({
                resposta: "Produto excluído.",
                retornoBanco: dados[0]
            })
        })
        .catch(next)
    })    
    
    app.listen(PORT, () => {
        console.log(`Loja executando em: http://localhost:${PORT}`)
    })