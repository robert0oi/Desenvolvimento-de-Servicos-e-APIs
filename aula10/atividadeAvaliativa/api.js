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

function isAdmin(req, res, next) {
    const adminToken = req.headers['admin-token'];
    if (adminToken === 'senha-admin-secreta') return next();
    next(errors(403, "Acesso restrito a administradores"));
}

// Rotas pública
app.get("/", (req, res) => {
    res.json({ resposta: "Bem-vindo à API da Loja Online" });
});

// Rotas de produtos
app.get("/produtos", (req, res, next) => {
    conn("produtos")
        .join("categorias", "produtos.categoria_id", "categorias.id")
        .select("produtos.*", "categorias.nome as categoria_nome")
        .then(dados => res.json(dados))
        .catch(next);
});

app.get("/produtos/:id", (req, res, next) => {
    conn("produtos")
        .where("produtos.id", req.params.id)
        .join("categorias", "produtos.categoria_id", "categorias.id")
        .select("produtos.*", "categorias.nome as categoria_nome")
        .first()
        .then(produto => {
            if (!produto) return next(errors(404, "Produto não encontrado"));
            res.json(produto);
        })
        .catch(next);
});

// Rotas dos ADM
app.post("/produtos", isAdmin, (req, res, next) => {
    const { nome, preco, quantidade, categoria_id } = req.body;
    
    if (!nome || !preco || !quantidade || !categoria_id) {
        return next(errors(400, "Todos os campos são obrigatórios"));
    }
    
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

app.put("/produtos/:id", isAdmin, (req, res, next) => {
    conn("produtos")
        .where("id", req.params.id)
        .update(req.body)
        .then(count => {
            if (count === 0) return next(errors(404, "Produto não encontrado"));
            res.json({ resposta: "Produto atualizado com sucesso" });
        })
        .catch(next);
});

app.delete("/produtos/:id", isAdmin, (req, res, next) => {
    conn("produtos")
        .where("id", req.params.id)
        .del()
        .then(count => {
            if (count === 0) return next(errors(404, "Produto não encontrado"));
            res.json({ resposta: "Produto removido com sucesso" });
        })
        .catch(next);
});

// Rotas Clienets
app.get("/clientes", (req, res, next) => {
    conn("clientes")
        .then(clientes => res.json(clientes))
        .catch(next);
});

app.post("/clientes", (req, res, next) => {
    const { nome, email, altura, nascimento, cidade_id } = req.body;
    
    if (!nome || !email) {
        return next(errors(400, "Nome e email são obrigatórios"));
    }
    
    conn("clientes")
        .insert(req.body)
        .then(ids => {
            res.status(201).json({
                resposta: "Cliente cadastrado com sucesso",
                id: ids[0]
            });
        })
        .catch(error => {
            if (error.code === 'ER_DUP_ENTRY') {
                next(errors(400, "Email já cadastrado"));
            } else {
                next(error);
            }
        });
});

// Rotas Pedido
app.get("/clientes/:id/pedidos", (req, res, next) => {
    conn("pedidos")
        .where("cliente_id", req.params.id)
        .then(pedidos => {
            if (pedidos.length === 0) {
                return next(errors(404, "Nenhum pedido encontrado para este cliente"));
            }
            res.json(pedidos);
        })
        .catch(next);
});

app.post("/pedidos", (req, res, next) => {
    if (!req.body.cliente_id || !req.body.endereco || !req.body.produtos) {
        return next(errors(400, "cliente_id, endereço e produtos são obrigatórios"));
    }

    conn.transaction(async trx => {
        try {
            const [pedidoId] = await trx("pedidos").insert({
                cliente_id: req.body.cliente_id,
                endereco: req.body.endereco,
                horario: new Date()
            });

            for (const item of req.body.produtos) {
                const produto = await trx("produtos")
                    .where("id", item.produto_id)
                    .first();
                
                if (!produto) {
                    throw errors(404, `Produto com ID ${item.produto_id} não encontrado`);
                }
                
                if (produto.quantidade < item.quantidade) {
                    throw errors(400, `Quantidade insuficiente para o produto ${produto.nome}`);
                }

                await trx("pedidos_produtos").insert({
                    pedido_id: pedidoId,
                    produto_id: item.produto_id,
                    quantidade: item.quantidade,
                    preco: produto.preco
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

// Erros, caem aqui
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
