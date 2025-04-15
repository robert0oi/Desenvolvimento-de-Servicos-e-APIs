function lerXML() {
    const tabela = document.getElementById("tableXML");
    const req = new XMLHttpRequest();
    
    req.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const dadosXML = this.responseXML;
            const clientes = dadosXML.getElementsByTagName("cliente");

            let conteudo =  "<tr>" +
                                "<th>ID</th>" +
                                "<th>Nome</th>" +
                                "<th>Altura</th>" +
                            "</tr>";

            for (let i = 0; i < clientes.length; i++) {
                const id = clientes[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
                const nome = clientes[i].getElementsByTagName("nome")[0].childNodes[0].nodeValue;
                const altura = clientes[i].getElementsByTagName("altura")[0].childNodes[0].nodeValue;
                
                conteudo += "<tr>";
                conteudo += "<td>" + id + "</td>";
                conteudo += "<td>" + nome + "</td>";
                conteudo += "<td>" + altura + "</td>";
                conteudo += "</tr>";
            }
            
            tabela.innerHTML = conteudo;
        }
    };
    
    req.open("GET", "dados.xml", true);
    req.send();
}