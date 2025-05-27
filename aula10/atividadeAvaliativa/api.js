// Finalizar: EndPoints com verificação de token para admins terem acesso a respostas diferentes.

const express = require("express");
const knex = require("knex");
const errors = require("http-errors");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;
const hostname = "localhost";

const conn = knex({
    client: "mysql",
    connection: {
        host: hostname,
        user: "root",
        password: "",
        database: "bd_dsapi"
    }
});

app.get("/", (req, res) => {
    res.json({ resposta: "Bem-vindo à API da Loja Online" });
});

app.get("/produtos", (req, res, next) => {
    conn("produtos")
        .then(dados => res.json(dados))
        .catch(next);
});

app.get("/produtos/:id", (req, res, next) => {
    conn("produtos")
        .where("id", req.params.id)
        .first()
        .then(produto => {
            if (!produto) return next(errors(404, "Produto não encontrado"));
            res.json(produto);
        })
        .catch(next);
});

app.post("/produtos", (req, res, next) => {
    conn("produtos")
        .insert(req.body)
        .then(ids => {
            res.status(201).json({
                resposta: "Produto criado com sucesso",
                id: ids[0]
            });
        })
        .catch(next);
});

app.get("/pedidos", (req, res, next) => {
    conn("pedidos")
        .then(pedidos => res.json(pedidos))
        .catch(next);
});

app.post("/pedidos", (req, res, next) => {
    conn.transaction(async trx => {
        try {
            const [pedidoId] = await trx("pedidos").insert({
                cliente_id: req.body.cliente_id,
                endereco: req.body.endereco
            });

            for (const item of req.body.produtos) {
                await trx("pedido_produto").insert({
                    pedido_id: pedidoId,
                    produto_id: item.produto_id,
                    quantidade: item.quantidade,
                    preco: item.preco
                });

                await trx("produtos")
                    .where("id", item.produto_id)
                    .decrement("quantidade", item.quantidade);
            }

            res.status(201).json({
                resposta: "Pedido criado com sucesso",
                id: pedidoId
            });
        } catch (error) {
            throw error;
        }
    }).catch(next);
});

app.get("/clientes", (req, res, next) => {
    conn("clientes")
        .then(clientes => res.json(clientes))
        .catch(next);
});

app.post("/clientes", (req, res, next) => {
    conn("clientes")
        .insert(req.body)
        .then(ids => {
            res.status(201).json({
                resposta: "Cliente cadastrado com sucesso",
                id: ids[0]
            });
        })
        .catch(next);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});
