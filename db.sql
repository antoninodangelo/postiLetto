-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versione server:              10.4.28-MariaDB - mariadb.org binary distribution
-- S.O. server:                  Win64
-- HeidiSQL Versione:            12.21.0.7344
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dump della struttura di tabella posti_letto.aziende
CREATE TABLE IF NOT EXISTS `aziende` (
  `IDAzienda` int(11) NOT NULL AUTO_INCREMENT,
  `nomeAzienda` varchar(50) NOT NULL DEFAULT '0',
  `codiceAzienda` varchar(50) NOT NULL DEFAULT '0',
  `direttore` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`IDAzienda`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.aziende: ~11 rows (circa)
DELETE FROM `aziende`;
INSERT INTO `aziende` (`IDAzienda`, `nomeAzienda`, `codiceAzienda`, `direttore`) VALUES
	(1, 'Azienda USLToscana Centro', '01', 'Valerio Mari'),
	(2, 'Azienda USL Toscana Nord Ovest', '02', '0'),
	(3, 'Azienda USL Toscana Sud Est', '03', '0'),
	(4, 'VILLA MARIA ASSUNTA', '04', '0'),
	(5, 'VILLA MARIA TERESA', '05', '0'),
	(6, 'MARCONI', '06', '0'),
	(7, 'CRI TORRIGIANI', '07', '0'),
	(8, 'ISTITUTO FRATICINI', '08', '0'),
	(9, 'VILLA DELLE TERME FALCIANI', '09', '0'),
	(10, 'VILLA ULIVELLA GLICINI', '10', '0'),
	(11, 'ISTITUTO PROSPERIUS', '11', '0'),
	(12, 'ISTITUTO CAMERATA', '12', '0'),
	(13, 'ISTITUTO FRATICINI', '13', '0');

-- Dump della struttura di tabella posti_letto.aziende_zone
CREATE TABLE IF NOT EXISTS `aziende_zone` (
  `idAziendaZona` int(11) NOT NULL AUTO_INCREMENT,
  `aziendaZona` varchar(50) NOT NULL DEFAULT '0',
  `idZona` int(11) NOT NULL DEFAULT 0,
  `idAzienda` int(11) NOT NULL,
  `nota` int(11) NOT NULL,
  `attivo` int(11) NOT NULL,
  PRIMARY KEY (`idAziendaZona`),
  KEY `FK_aziende_zone_zone` (`idZona`),
  KEY `FK_aziende_zone_aziende` (`idAzienda`),
  CONSTRAINT `FK_aziende_zone_aziende` FOREIGN KEY (`idAzienda`) REFERENCES `aziende` (`IDAzienda`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_aziende_zone_zone` FOREIGN KEY (`idZona`) REFERENCES `zone` (`IDZona`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.aziende_zone: ~12 rows (circa)
DELETE FROM `aziende_zone`;
INSERT INTO `aziende_zone` (`idAziendaZona`, `aziendaZona`, `idZona`, `idAzienda`, `nota`, `attivo`) VALUES
	(3, '0', 15, 12, 0, 1),
	(5, '0', 15, 7, 0, 1),
	(6, '0', 15, 8, 0, 1),
	(7, '0', 15, 13, 0, 1),
	(8, '0', 15, 11, 0, 1),
	(9, '0', 15, 6, 0, 1),
	(10, '0', 15, 9, 0, 1),
	(11, '0', 15, 4, 0, 1),
	(12, '0', 15, 5, 0, 1),
	(13, '0', 15, 10, 0, 1),
	(21, '0', 15, 1, 0, 1),
	(22, '0', 5, 1, 0, 1),
	(23, '0', 1, 1, 0, 1);

-- Dump della struttura di tabella posti_letto.dettaglio_chiusure
CREATE TABLE IF NOT EXISTS `dettaglio_chiusure` (
  `IDDettaglioSetting` int(11) NOT NULL AUTO_INCREMENT,
  `IDStoricoChiusura` int(11) NOT NULL DEFAULT 0,
  `numPostiChiusiFerie` int(11) NOT NULL DEFAULT 0,
  `dataInserimento` date DEFAULT NULL,
  `dataInizioChiusura` date DEFAULT NULL,
  `dataFineChiusura` date DEFAULT NULL,
  `nota` mediumtext DEFAULT NULL,
  `attivo` smallint(6) NOT NULL DEFAULT 0,
  PRIMARY KEY (`IDDettaglioSetting`),
  KEY `FK_dettaglio_chiusure_storico_chiusure_estive` (`IDStoricoChiusura`),
  CONSTRAINT `FK_dettaglio_chiusure_storico_chiusure_estive` FOREIGN KEY (`IDStoricoChiusura`) REFERENCES `storico_chiusure_estive` (`IDStorico`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.dettaglio_chiusure: ~5 rows (circa)
DELETE FROM `dettaglio_chiusure`;
INSERT INTO `dettaglio_chiusure` (`IDDettaglioSetting`, `IDStoricoChiusura`, `numPostiChiusiFerie`, `dataInserimento`, `dataInizioChiusura`, `dataFineChiusura`, `nota`, `attivo`) VALUES
	(1, 1, 2, '2026-06-01', '2026-06-10', '2026-09-20', NULL, 1),
	(2, 2, 7, '2026-05-01', '2026-06-10', '2026-06-17', NULL, 1),
	(3, 2, 7, '2026-06-01', '2026-06-17', '2026-09-10', NULL, 1),
	(4, 3, 7, '2027-07-16', '2026-06-14', '2026-09-10', NULL, 1),
	(5, 3, 7, '2026-07-16', '2026-06-14', '2026-09-16', NULL, 1);

-- Dump della struttura di tabella posti_letto.paziente
CREATE TABLE IF NOT EXISTS `paziente` (
  `IDPaziente` int(11) NOT NULL AUTO_INCREMENT,
  `IDPostoLetto` int(11) NOT NULL DEFAULT 0,
  `IDPazienteProv` int(11) DEFAULT NULL,
  `IDSettingDestinazione` int(11) DEFAULT NULL,
  `IDProvenienza` int(11) DEFAULT NULL,
  `nomePaziente` varchar(50) NOT NULL,
  `cognomePaziente` varchar(50) NOT NULL,
  `dataNascita` date NOT NULL,
  `dataTrasf` datetime DEFAULT NULL,
  `dataDimissione` datetime DEFAULT NULL,
  `sesso` tinyint(4) NOT NULL,
  `problemiAperti` varchar(200) DEFAULT NULL,
  `IDUtenteTrasf` int(11) NOT NULL,
  `attivo` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`IDPaziente`),
  KEY `FK_paziente_setting_2` (`IDSettingDestinazione`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=518 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.paziente: ~2 rows (circa)
DELETE FROM `paziente`;
INSERT INTO `paziente` (`IDPaziente`, `IDPostoLetto`, `IDPazienteProv`, `IDSettingDestinazione`, `IDProvenienza`, `nomePaziente`, `cognomePaziente`, `dataNascita`, `dataTrasf`, `dataDimissione`, `sesso`, `problemiAperti`, `IDUtenteTrasf`, `attivo`) VALUES
	(511, 119, NULL, 5, 1, 'ANTONIO', 'valenziano', '2026-08-04', '2026-08-26 11:14:41', NULL, 1, 's', 5, 0),
	(512, 94, 511, NULL, 5, 'ANTONIO', 'valenziano', '2026-08-04', '2026-08-26 11:13:29', '2026-08-26 11:13:29', 1, 's', 5, 0),
	(514, 91, NULL, NULL, 6, 'simone', 'piccolo', '2026-08-18', NULL, '2026-08-26 11:13:29', 1, 'j', 0, 0),
	(515, 119, NULL, 5, 1, 'simone', 'piccolo', '2026-08-18', '2026-08-26 12:53:01', NULL, 1, 'j', 5, 0),
	(517, 95, NULL, NULL, 5, 'BRIGNAI', 'CARLO', '1945-05-12', NULL, '2026-08-26 12:12:36', 2, 'S', 0, 0);

-- Dump della struttura di tabella posti_letto.postiletto
CREATE TABLE IF NOT EXISTS `postiletto` (
  `IDPostoLetto` int(11) NOT NULL AUTO_INCREMENT,
  `IDSetting` int(11) NOT NULL DEFAULT 0,
  `numeroLetto` int(11) NOT NULL DEFAULT 0,
  `tipoLetto` int(11) DEFAULT 1,
  `IDStatoLetto` int(11) NOT NULL DEFAULT 1,
  `IDTipoLetto` int(11) NOT NULL DEFAULT 1,
  `numeroStanza` int(11) NOT NULL DEFAULT 1,
  `attivo` int(11) DEFAULT NULL,
  PRIMARY KEY (`IDPostoLetto`),
  KEY `FK_postiletto_stato_postiletto` (`IDStatoLetto`),
  KEY `FK_postiletto_setting` (`IDSetting`),
  CONSTRAINT `FK_postiletto_setting` FOREIGN KEY (`IDSetting`) REFERENCES `setting` (`IDSetting`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_postiletto_stato_postiletto` FOREIGN KEY (`IDStatoLetto`) REFERENCES `stato_postiletto` (`IDStato`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.postiletto: ~42 rows (circa)
DELETE FROM `postiletto`;
INSERT INTO `postiletto` (`IDPostoLetto`, `IDSetting`, `numeroLetto`, `tipoLetto`, `IDStatoLetto`, `IDTipoLetto`, `numeroStanza`, `attivo`) VALUES
	(1, 2, 1, 1, 14, 1, 1, 1),
	(2, 2, 2, 1, 14, 1, 1, 1),
	(3, 2, 3, 1, 14, 1, 1, 1),
	(4, 2, 4, 1, 14, 1, 1, 1),
	(5, 2, 5, 1, 14, 1, 1, 1),
	(6, 2, 6, 1, 14, 1, 1, 1),
	(7, 2, 7, 1, 14, 1, 1, 1),
	(8, 2, 8, 1, 14, 1, 1, 1),
	(9, 2, 9, 1, 14, 1, 1, 1),
	(10, 2, 10, 1, 14, 1, 1, 1),
	(11, 2, 11, 1, 14, 1, 1, 1),
	(12, 2, 12, 1, 14, 1, 1, 1),
	(13, 2, 13, 1, 14, 1, 1, 1),
	(14, 2, 14, 1, 14, 1, 1, 1),
	(15, 2, 15, 1, 14, 1, 1, 1),
	(16, 2, 16, 1, 14, 1, 1, 1),
	(17, 2, 17, 1, 14, 1, 1, 1),
	(18, 2, 18, 1, 14, 1, 1, 1),
	(19, 2, 19, 1, 14, 1, 1, 1),
	(20, 1, 1, 1, 14, 1, 1, 1),
	(21, 1, 2, 1, 14, 1, 1, 1),
	(22, 2, 20, 1, 14, 1, 1, 1),
	(23, 2, 21, 1, 14, 1, 1, 1),
	(24, 2, 22, 1, 14, 1, 1, 1),
	(27, 2, 23, 1, 14, 1, 1, 1),
	(28, 3, 1, 1, 14, 1, 1, 1),
	(29, 3, 2, 1, 14, 1, 1, 1),
	(30, 3, 3, 1, 14, 1, 1, 1),
	(39, 1, 3, 1, 14, 1, 1, 1),
	(83, 6, 1, 1, 14, 1, 1, 1),
	(90, 6, 2, 1, 14, 1, 1, 1),
	(91, 6, 3, 1, 14, 1, 1, 1),
	(94, 5, 3, 1, 14, 1, 1, 1),
	(95, 5, 4, 1, 14, 1, 1, 1),
	(96, 4, 1, 1, 14, 1, 1, 1),
	(99, 4, 2, 1, 14, 1, 1, 1),
	(100, 4, 3, 1, 14, 1, 1, 1),
	(101, 4, 4, 1, 14, 1, 1, 1),
	(104, 7, 2, 1, 14, 1, 1, 1),
	(105, 7, 3, 1, 14, 1, 1, 1),
	(106, 7, 4, 1, 14, 1, 1, 1),
	(119, 7, 5, 1, 14, 1, 1, 1);

-- Dump della struttura di tabella posti_letto.setting
CREATE TABLE IF NOT EXISTS `setting` (
  `IDSetting` int(11) NOT NULL AUTO_INCREMENT,
  `IDZona` int(11) NOT NULL DEFAULT 0,
  `IDAziendaZona` int(11) NOT NULL,
  `setting` varchar(100) NOT NULL DEFAULT '0',
  `direttore` varchar(100) DEFAULT '0',
  `coordinatore` varchar(100) DEFAULT '0',
  `telefono` varchar(100) DEFAULT '0',
  `telefono1` varchar(100) DEFAULT '0',
  `note` varchar(100) DEFAULT '0',
  `dataIns` date DEFAULT NULL,
  `attivo` tinyint(4) DEFAULT NULL,
  `ordine` tinyint(4) NOT NULL,
  `numLettiChiusuraEstiva` tinyint(4) NOT NULL,
  `numLetti` int(11) DEFAULT NULL,
  `ospedaliero` int(11) NOT NULL,
  PRIMARY KEY (`IDSetting`),
  KEY `FK_setting_zone` (`IDZona`),
  CONSTRAINT `FK_setting_zone` FOREIGN KEY (`IDZona`) REFERENCES `zone` (`IDZona`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.setting: ~7 rows (circa)
DELETE FROM `setting`;
INSERT INTO `setting` (`IDSetting`, `IDZona`, `IDAziendaZona`, `setting`, `direttore`, `coordinatore`, `telefono`, `telefono1`, `note`, `dataIns`, `attivo`, `ordine`, `numLettiChiusuraEstiva`, `numLetti`, `ospedaliero`) VALUES
	(1, 1, 0, 'UTIC', 'ANNA TOSO', 'ADRIANA VALENZIANO', '0', '0', '0', NULL, 0, 10, 2, 10, 1),
	(2, 1, 0, 'SETTORE 3, 3° PIANO ', 'PASQUALE PALUMBO', 'GIADA GALANTUCCI', '0', '0', '0', NULL, 0, 20, 14, 52, 1),
	(3, 1, 0, 'SETTORE 2, 3° PIANO ', 'PROVA', 'PROVA', '0', '0', '0', NULL, 0, 30, 14, 52, 1),
	(4, 1, 0, 'BOARDING', 'SIMONE MAGAZZINI', 'STEFANO GORI', '0', '0', '0', NULL, 0, 1, 0, 0, 1),
	(5, 15, 12, 'LUNGODEGENZA', '0', '0', '0', '0', '0', NULL, 1, 1, 0, NULL, 0),
	(6, 15, 12, 'MEDICINA DA DEA', '0', '0', '0', '0', '0', NULL, 1, 1, 0, NULL, 0),
	(7, 15, 0, 'BORDING TERRITORIO', '0', '0', '0', '0', '0', NULL, 1, 1, 0, NULL, 0);

-- Dump della struttura di tabella posti_letto.stato_paziente
CREATE TABLE IF NOT EXISTS `stato_paziente` (
  `IDStatoPaziente` int(11) NOT NULL AUTO_INCREMENT,
  `stato` varchar(50) NOT NULL DEFAULT '',
  `attivo` int(11) NOT NULL,
  PRIMARY KEY (`IDStatoPaziente`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.stato_paziente: ~3 rows (circa)
DELETE FROM `stato_paziente`;
INSERT INTO `stato_paziente` (`IDStatoPaziente`, `stato`, `attivo`) VALUES
	(1, 'RICOVERATO', 1),
	(6, 'IN DIMISSIONE A DOMICILIO', 1),
	(7, 'IN TRASFERIMENTO', 1);

-- Dump della struttura di tabella posti_letto.stato_postiletto
CREATE TABLE IF NOT EXISTS `stato_postiletto` (
  `IDStato` int(11) NOT NULL AUTO_INCREMENT,
  `stato` varchar(50) NOT NULL,
  `attivo` tinyint(4) NOT NULL DEFAULT 1,
  `note` varchar(50) NOT NULL,
  `ordine` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`IDStato`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.stato_postiletto: ~6 rows (circa)
DELETE FROM `stato_postiletto`;
INSERT INTO `stato_postiletto` (`IDStato`, `stato`, `attivo`, `note`, `ordine`) VALUES
	(1, 'OSCURATO', 1, '', 5),
	(2, 'CHIUSO ALTRO', 1, '', 7),
	(3, 'CHIUSURA FERIE', 1, '', 6),
	(14, 'LIBERO', 1, '', 1),
	(15, 'PRENOTATO', 1, '', 4),
	(16, 'OCCUPATO', 1, '', 3);

-- Dump della struttura di tabella posti_letto.storico_chiusure_estive
CREATE TABLE IF NOT EXISTS `storico_chiusure_estive` (
  `IDStorico` int(11) NOT NULL AUTO_INCREMENT,
  `IDSetting` int(11) NOT NULL DEFAULT 0,
  `dataChiusura` date NOT NULL,
  `numLettiChiusi` int(11) NOT NULL,
  `note` int(11) NOT NULL,
  `attivo` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`IDStorico`),
  KEY `FK_storico_chiusureEstive_setting` (`IDSetting`),
  CONSTRAINT `FK_storico_chiusureEstive_setting` FOREIGN KEY (`IDSetting`) REFERENCES `setting` (`IDSetting`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.storico_chiusure_estive: ~3 rows (circa)
DELETE FROM `storico_chiusure_estive`;
INSERT INTO `storico_chiusure_estive` (`IDStorico`, `IDSetting`, `dataChiusura`, `numLettiChiusi`, `note`, `attivo`) VALUES
	(1, 1, '2026-01-01', 2, 0, 1),
	(2, 3, '2026-07-16', 14, 0, 1),
	(3, 2, '2025-07-16', 14, 0, 1);

-- Dump della struttura di tabella posti_letto.tracking_postiletto
CREATE TABLE IF NOT EXISTS `tracking_postiletto` (
  `IDTracking` int(11) NOT NULL,
  `stato` varchar(50) NOT NULL DEFAULT '',
  `data` date NOT NULL,
  `IDInseritore` int(11) DEFAULT NULL,
  PRIMARY KEY (`IDTracking`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.tracking_postiletto: ~0 rows (circa)
DELETE FROM `tracking_postiletto`;

-- Dump della struttura di tabella posti_letto.utenti
CREATE TABLE IF NOT EXISTS `utenti` (
  `IDUtente` int(11) NOT NULL AUTO_INCREMENT,
  `IDPubblico` int(11) NOT NULL,
  `IDUtentiFigura` int(11) NOT NULL,
  `mail` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nome` varchar(50) DEFAULT NULL,
  `cognome` varchar(50) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `telefono1` varchar(50) DEFAULT NULL,
  `attivo` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`IDUtente`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.utenti: ~6 rows (circa)
DELETE FROM `utenti`;
INSERT INTO `utenti` (`IDUtente`, `IDPubblico`, `IDUtentiFigura`, `mail`, `password`, `nome`, `cognome`, `telefono`, `telefono1`, `attivo`) VALUES
	(1, 10, 1, 'antonio@prova.it', '$2b$10$/c9C2h5OQ2Bij4Ij/CvAze/9cOZSm5Kapjj3BWXZWqMVQlcll74SW', 'Antonio', 'D\'angelo', NULL, NULL, 1),
	(2, 10, 1, 'prova@prova.it', '$2b$10$/c9C2h5OQ2Bij4Ij/CvAze/9cOZSm5Kapjj3BWXZWqMVQlcll74SW', 'FILIPPO', 'CANTALE', NULL, NULL, 1),
	(3, 1, 1, 'prova1@prova.it', '$2b$10$/c9C2h5OQ2Bij4Ij/CvAze/9cOZSm5Kapjj3BWXZWqMVQlcll74SW', 'MIKE', 'RICCI', NULL, NULL, 1),
	(4, 10, 1, 'prova2@prova.it', '$2b$10$/c9C2h5OQ2Bij4Ij/CvAze/9cOZSm5Kapjj3BWXZWqMVQlcll74SW', 'ADRIANA', 'VALENZIANO', NULL, NULL, 1),
	(5, 50, 1, 'territorio@prova.it', '$2b$10$/c9C2h5OQ2Bij4Ij/CvAze/9cOZSm5Kapjj3BWXZWqMVQlcll74SW', 'TERRITORIO', 'TERRITORIO', NULL, NULL, 1),
	(6, 10, 1, 'territoriof@prova.it', '$2b$10$/c9C2h5OQ2Bij4Ij/CvAze/9cOZSm5Kapjj3BWXZWqMVQlcll74SW', 'firenze', 'FIRENZE', NULL, NULL, 1);

-- Dump della struttura di tabella posti_letto.utenti_setting
CREATE TABLE IF NOT EXISTS `utenti_setting` (
  `IDUtenteSetting` int(11) NOT NULL AUTO_INCREMENT,
  `IDSetting` int(11) NOT NULL DEFAULT 0,
  `IDUtente` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`IDUtenteSetting`),
  KEY `FK_utenti_setting_setting` (`IDSetting`),
  KEY `FK_utenti_setting_utenti` (`IDUtente`),
  CONSTRAINT `FK_utenti_setting_setting` FOREIGN KEY (`IDSetting`) REFERENCES `setting` (`IDSetting`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_utenti_setting_utenti` FOREIGN KEY (`IDUtente`) REFERENCES `utenti` (`IDUtente`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.utenti_setting: ~8 rows (circa)
DELETE FROM `utenti_setting`;
INSERT INTO `utenti_setting` (`IDUtenteSetting`, `IDSetting`, `IDUtente`) VALUES
	(1, 1, 1),
	(3, 2, 1),
	(4, 3, 2),
	(5, 3, 3),
	(7, 6, 4),
	(8, 7, 5),
	(10, 5, 6);

-- Dump della struttura di tabella posti_letto.zone
CREATE TABLE IF NOT EXISTS `zone` (
  `IDZona` int(11) NOT NULL AUTO_INCREMENT,
  `IDAzienda` int(11) DEFAULT 0,
  `zona` varchar(50) NOT NULL,
  `direttoreSanitario` varchar(50) DEFAULT NULL,
  `note` varchar(200) DEFAULT NULL,
  `ordine` int(11) DEFAULT NULL,
  `dataInserimento` date DEFAULT NULL,
  `attiva` int(11) DEFAULT NULL,
  PRIMARY KEY (`IDZona`),
  KEY `FK_zone_aziende` (`IDAzienda`),
  CONSTRAINT `FK_zone_aziende` FOREIGN KEY (`IDAzienda`) REFERENCES `aziende` (`IDAzienda`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dump dei dati della tabella posti_letto.zone: ~14 rows (circa)
DELETE FROM `zone`;
INSERT INTO `zone` (`IDZona`, `IDAzienda`, `zona`, `direttoreSanitario`, `note`, `ordine`, `dataInserimento`, `attiva`) VALUES
	(1, 1, 'PRATO', NULL, NULL, 1, NULL, 1),
	(2, 1, 'EMPOLI', NULL, NULL, 2, NULL, 1),
	(3, 1, 'PESCIA', NULL, NULL, 3, NULL, 1),
	(4, 1, 'PISTOIA', NULL, NULL, 4, NULL, 1),
	(5, 1, 'BSL', NULL, NULL, 5, NULL, 1),
	(6, 1, 'SMN', NULL, NULL, 6, NULL, 1),
	(7, 1, 'SGD', NULL, NULL, 7, NULL, 1),
	(8, 1, 'OSMA', NULL, NULL, 8, NULL, 1),
	(9, 1, 'PALAGI', NULL, NULL, 9, NULL, 1),
	(10, 1, 'SERRISTORI', NULL, NULL, 10, NULL, 1),
	(11, 1, 'SAN MARCELLO', NULL, NULL, 11, NULL, 1),
	(12, 1, 'SAN MINIATO', NULL, NULL, 12, NULL, 1),
	(15, 4, 'FIRENZE ', NULL, NULL, 13, NULL, 1);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
