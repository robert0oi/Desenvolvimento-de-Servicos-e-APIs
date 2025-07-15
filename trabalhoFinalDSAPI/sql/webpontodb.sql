-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 15/07/2025 às 05:24
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS webpontodb;
USE webpontodb;

-- Estrutura para tabela `atestados`
CREATE TABLE `atestados` (
  `id` char(21) NOT NULL,
  `user_id` char(21) DEFAULT NULL,
  `data_envio` date NOT NULL,
  `motivo` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

-- Estrutura para tabela `registros`
CREATE TABLE `registros` (
  `id` char(21) NOT NULL,
  `user_id` char(21) DEFAULT NULL,
  `data_ponto` date NOT NULL,
  `checkin` time DEFAULT NULL,
  `checkout` time DEFAULT NULL,
  `mes_fechado` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

-- Estrutura para tabela `users`
CREATE TABLE `users` (
  `id` char(21) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `cargo` enum('estagiario','chefe','supervisor','admin') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Despejando dados para a tabela `users`
INSERT INTO `users` (`id`, `nome`, `email`, `cargo`) VALUES
('aCiowh8LDzuxrORj0Cmb9', 'Simone Souza', 'simonebeatriz2018@gmail.com', 'estagiario'),
('GzdoF5e8u9GWSpYJwdDp2', 'Roberto', 'robertocamillo1610@gmail.com', 'admin');

-- --------------------------------------------------------

-- Estrutura para tabela `validacoes`
CREATE TABLE `validacoes` (
  `id` char(21) NOT NULL,
  `mes` int(11) NOT NULL,
  `ano` int(11) NOT NULL,
  `supervisor_id` char(21) DEFAULT NULL,
  `data_validacao` datetime NOT NULL,
  `status` enum('pendente','validado') DEFAULT 'pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Índices para tabelas despejadas

-- Índices de tabela `atestados`
ALTER TABLE `atestados`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

-- Índices de tabela `registros`
ALTER TABLE `registros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

-- Índices de tabela `users`
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

-- Índices de tabela `validacoes`
ALTER TABLE `validacoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

-- Restrições para tabelas despejadas

-- Restrições para tabelas `atestados`
ALTER TABLE `atestados`
  ADD CONSTRAINT `atestados_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

-- Restrições para tabelas `registros`
ALTER TABLE `registros`
  ADD CONSTRAINT `registros_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

-- Restrições para tabelas `validacoes`
ALTER TABLE `validacoes`
  ADD CONSTRAINT `validacoes_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
