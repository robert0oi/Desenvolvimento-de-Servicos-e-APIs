<?php

header("Content-type: application/json");

$local = "localhost";
$user = "root";
$senha = "";
$banco = "market";

if(isset($_REQUEST["consultar"] ) ){
    try {
        $conn = mysqli_connect($local, $user, $senha, $banco);
        if( $conn ){
            $sql = "SELECT * FROM produto ORDER BY nome";
            $result = mysqli_query($conn, $sql);
            $linhas = array();
            while ($row = mysqli_fetch_assoc( $result) ) {
                $linhas[] = $row;
            }
            mysqli_close($conn);
            echo ' { "produtos" : ' . json_encode($linhas) . ' } ';
        }
        else{
            echo ' { "resposta" : "Erro ao tentar conectar no servidor... } ';
        }
    } catch (\Throwable $th) {
        echo ' { "resposta" : "Erro no servidor..." } ';
    }    
}


if(isset($_REQUEST["inserir"] ) ){

}






?>