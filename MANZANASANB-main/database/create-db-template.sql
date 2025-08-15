CREATE DATABASE IF NOT EXISTS manzanasANB DEFAULT CHARACTER SET = 'utf8mb4';

USE manzanasANB;

SET NAMES utf8mb4;

SET time_zone = '+00:00';

SET foreign_key_checks = 0;

DROP TABLE IF EXISTS m_s;

DROP TABLE IF EXISTS solicitudes;

DROP TABLE IF EXISTS usuario;

DROP TABLE IF EXISTS servicios;

DROP TABLE IF EXISTS manzanas;

CREATE TABLE manzanas (
    Id_M INT AUTO_INCREMENT PRIMARY KEY,
    NombreManzana VARCHAR(25) NOT NULL,
    Dir VARCHAR(50)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    manzanas (NombreManzana, Dir)
VALUES ('Bosa', 'Kra 103 10-25'),
    ('Suba', 'Kra 114F 10-25'),
    ('Chapinero', 'Kra 63 10-25');

CREATE TABLE servicios (
    Id_S INT AUTO_INCREMENT PRIMARY KEY,
    NombreServicio VARCHAR(25) NOT NULL,
    TipoServicio VARCHAR(50) NOT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    servicios (NombreServicio, TipoServicio)
VALUES (
        'Clase de baile',
        'Entretenimiento'
    ),
    ('Cine', 'Entretenimiento'),
    ('Piscina', 'Deporte'),
    ('Gym', 'Deporte'),
    ('Cocina', 'Gastronomia'),
    ('Lavanderia', 'Aseo'),
    ('Coser', 'Maquina'),
    ('Yoga', 'Deporte');

CREATE TABLE usuario (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    NombreUsuario VARCHAR(50) NOT NULL,
    TipoDocumento ENUM('TI', 'CC') NOT NULL,
    Documento VARCHAR(50) NOT NULL UNIQUE,
    Rol ENUM('usuario', 'administrador') NOT NULL DEFAULT 'usuario',
    Id_M1 INT NULL,
    FOREIGN KEY (Id_M1) REFERENCES manzanas (Id_M) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    usuario (
        NombreUsuario,
        TipoDocumento,
        Documento,
        Rol,
        Id_M1
    )
VALUES (
        'BrayanBT',
        'CC',
        '1234',
        'administrador',
        1
    ),
    (
        'julian',
        'TI',
        '12345',
        'usuario',
        2
    ),
    (
        'Jazmin',
        'TI',
        '7890',
        'usuario',
        1
    ),
    (
        'yurlei',
        'CC',
        '1020',
        'usuario',
        3
    ),
    (
        'andres',
        'TI',
        '1120',
        'usuario',
        1
    ),
    (
        'andres',
        'TI',
        '1121',
        'administrador',
        1
    ),
    (
        'richard',
        'TI',
        '1122',
        'usuario',
        1
    ),
    (
        'Ana',
        'CC',
        '5565',
        'usuario',
        3
    ),
    (
        'sofia',
        'TI',
        '123123',
        'usuario',
        1
    ),
    (
        'Pedro',
        'TI',
        '0000',
        'usuario',
        1
    ),
    (
        'pepe',
        'CC',
        '5555',
        'usuario',
        1
    );

CREATE TABLE solicitudes (
    Id_solicitudes INT AUTO_INCREMENT PRIMARY KEY,
    Fecha DATETIME,
    Id1 INT,
    CodigoS INT,
    FOREIGN KEY (Id1) REFERENCES usuario (Id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (CodigoS) REFERENCES servicios (Id_S) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    solicitudes (Fecha, Id1, CodigoS)
VALUES ('2024-02-13 12:11:00', 1, 4),
    ('2024-02-13 12:11:00', 1, 6);

CREATE TABLE m_s (
    Id_M1 INT,
    Id_S1 INT,
    PRIMARY KEY (Id_M1, Id_S1),
    FOREIGN KEY (Id_M1) REFERENCES manzanas (Id_M) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (Id_S1) REFERENCES servicios (Id_S) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    m_s (Id_M1, Id_S1)
VALUES (1, 6),
    (1, 4),
    (1, 7),
    (2, 6),
    (2, 3),
    (2, 8),
    (3, 1),
    (3, 2),
    (3, 3),
    (3, 4),
    (3, 5);

SET foreign_key_checks = 1;



SELECT m.NombreManzana, s.NombreServicio
FROM
    m_s
    JOIN manzanas m ON m.Id_M = m_s.Id_M1
    JOIN servicios s ON s.Id_S = m_s.Id_S1
ORDER BY m.NombreManzana;

SELECT Id_solicitudes, COUNT(*) 
   FROM solicitudes 
   GROUP BY Id_solicitudes 
   HAVING COUNT(*) > 1;

SELECT Id_solicitudes, COUNT(*) 
FROM solicitudes 
GROUP BY Id_solicitudes 
HAVING COUNT(*) > 1;