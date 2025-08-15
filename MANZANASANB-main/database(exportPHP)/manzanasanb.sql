-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-07-2025 a las 03:25:24
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `manzanasanb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manzanas`
--

CREATE TABLE `manzanas` (
  `Id_M` int(11) NOT NULL,
  `NombreManzana` varchar(25) NOT NULL,
  `Dir` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manzanas`
--

INSERT INTO `manzanas` (`Id_M`, `NombreManzana`, `Dir`) VALUES
(1, 'Bosa', 'Kra 103 10-25'),
(2, 'Suba', 'Kra 114F 10-25');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `m_s`
--

CREATE TABLE `m_s` (
  `Id_M1` int(11) NOT NULL,
  `Id_S1` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `m_s`
--

INSERT INTO `m_s` (`Id_M1`, `Id_S1`) VALUES
(1, 4),
(1, 6),
(1, 7),
(2, 3),
(2, 6),
(2, 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `Id_S` int(11) NOT NULL,
  `NombreServicio` varchar(25) NOT NULL,
  `TipoServicio` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`Id_S`, `NombreServicio`, `TipoServicio`) VALUES
(1, 'Clase de baile', 'Entretenimiento'),
(2, 'Cine', 'Entretenimiento'),
(3, 'Piscina', 'Deporte'),
(4, 'Gym', 'Deporte'),
(5, 'Cocina', 'Gastronomia'),
(6, 'Lavanderia', 'Aseo'),
(7, 'Coser', 'Maquina'),
(8, 'Yoga', 'Deporte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `Id_solicitudes` int(11) NOT NULL,
  `Fecha` datetime DEFAULT NULL,
  `Id1` int(11) DEFAULT NULL,
  `CodigoS` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`Id_solicitudes`, `Fecha`, `Id1`, `CodigoS`) VALUES
(1, '2024-02-13 12:11:00', 1, 4),
(2, '2024-02-13 12:11:00', 1, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `Id` int(11) NOT NULL,
  `NombreUsuario` varchar(50) NOT NULL,
  `TipoDocumento` enum('TI','CC') NOT NULL,
  `Documento` varchar(50) NOT NULL,
  `Rol` enum('usuario','administrador') NOT NULL DEFAULT 'usuario',
  `Id_M1` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`Id`, `NombreUsuario`, `TipoDocumento`, `Documento`, `Rol`, `Id_M1`) VALUES
(1, 'BrayanBT', 'CC', '1234', 'administrador', 1),
(2, 'julian', 'TI', '12345', 'usuario', 2),
(3, 'Jazmin', 'TI', '7890', 'usuario', 1),
(4, 'yurlei', 'CC', '1020', 'usuario', NULL),
(5, 'andres', 'TI', '1120', 'usuario', 1),
(6, 'andres', 'TI', '1121', 'administrador', 1),
(7, 'richard', 'TI', '1122', 'usuario', 1),
(8, 'Ana', 'CC', '5565', 'usuario', NULL),
(9, 'sofia', 'TI', '123123', 'usuario', 1),
(10, 'Pedro', 'TI', '0000', 'usuario', 1),
(11, 'pepe', 'CC', '5555', 'usuario', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `manzanas`
--
ALTER TABLE `manzanas`
  ADD PRIMARY KEY (`Id_M`);

--
-- Indices de la tabla `m_s`
--
ALTER TABLE `m_s`
  ADD PRIMARY KEY (`Id_M1`,`Id_S1`),
  ADD KEY `Id_S1` (`Id_S1`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`Id_S`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`Id_solicitudes`),
  ADD KEY `Id1` (`Id1`),
  ADD KEY `CodigoS` (`CodigoS`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Documento` (`Documento`),
  ADD KEY `Id_M1` (`Id_M1`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `manzanas`
--
ALTER TABLE `manzanas`
  MODIFY `Id_M` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `Id_S` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `Id_solicitudes` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `m_s`
--
ALTER TABLE `m_s`
  ADD CONSTRAINT `m_s_ibfk_1` FOREIGN KEY (`Id_M1`) REFERENCES `manzanas` (`Id_M`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `m_s_ibfk_2` FOREIGN KEY (`Id_S1`) REFERENCES `servicios` (`Id_S`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`Id1`) REFERENCES `usuario` (`Id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`CodigoS`) REFERENCES `servicios` (`Id_S`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`Id_M1`) REFERENCES `manzanas` (`Id_M`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
