function lerJSON() {
var req = new XMLHttpRequest();

req.onreadystatechange = function() {
    if( this.readyState == 4 && this.status == 200 ){
        var objJSON = JSON.parse( this.responseText );
        txt = "Modelo: " + objJSON.modelo;
        txt += "<br>Ano: " + objJSON.ano;
        txt += "<br>Câmbio Automático: ";
        if( objJSON.cambioAutomatico ){
            txt += "Sim";
        }
        else{
            txt += "Não";
        }

        txt += "<br>Combustíveis: ";
        objJSON.combustivel.forEach( combustevel => {
            txt += combustevel + " - ";
        });
        
        txt += "<br>Proprietário: " + objJSON.proprietario.nome;
        
        txt += "<br>Opcionais: ";
        objJSON.opcionais.forEach( opeceonal => {
            txt += "<br>" + opeceonal.nome + " Marca: " + opeceonal.marca;
        });
        document.getElementById("divJSON").innerHTML = txt;

    }
    else if( this.readyState == 4) {
        alert( this.status + " - " + this.statusText );
    }
};

req.open("GET", "dados.json", true)
req.send()

}