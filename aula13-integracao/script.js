function add(){
    var name = document.getElementById("txtNome").value; // lembrar do ".value" para pegar 
    var price = document.getElementById("txtPreco").value;

    if(name.legth == 0){
        alert("O nome do produto é obrigatório!");
    }
    else{
        if(price.length == 0){
            price = 0.0 //Tratamento para alterar o valor do preço se não colocarem nada, ai quando a requisição mandar os dados para o banco de dados, não acontecerá nada, pois o preço estará zerado.
        };
        var ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function(){
            if(this.readyState == 4 & this.status == 201){
                alert("Produto " + name + " cadastrado!");
                buscarProdutos();
            };
        };

        ajax.open("POST", "http://localhost:8001/product");
        ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        ajax.send("nome=" + name + "&preco=" + price);
    };
};

function buscarProdutos(){
    var tabela = document.getElementById("tblProdutos");
    var ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function(){
        if(this.readyState == 4 & this.status == 200){ // recebendo o JSON
            const obj = JSON.parse(this.responseText) // Transformando em um array de objetos JavaScript
            obj.forEach( prod => {
                if(document.getElementById("p" + prod.id) == null){
                    linha = tabela.insertRow(-1);
                    linha.id = "p" + prod.id;

                    cellId = linha.insertCell(0);
                    cellNome = linha.insertCell(1);
                    cellPreco = linha.insertCell(2);
                    cellExcluir = linha.insertCell(3);
                    
                    cellId.innerHTML = prod.id;
                    cellNome.innerHTML = prod.nome;
                    cellPreco.innerHTML = "R$ " + prod.preco;
                    cellExcluir.innerHTML = '<button onclick="Excluir(' + prod.id + ')">Excluir</button>';


                };
            });
        };
    };

    ajax.open('GET', "http://localhost:8001/product", true);
    ajax.send();
};