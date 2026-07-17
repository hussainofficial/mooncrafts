-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: mooncraft_jewelry
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,'Andhra Pradesh','AP','2026-07-06 07:32:08'),(2,'Arunachal Pradesh','AR','2026-07-06 07:32:08'),(3,'Assam','AS','2026-07-06 07:32:08'),(4,'Bihar','BR','2026-07-06 07:32:08'),(5,'Chhattisgarh','CT','2026-07-06 07:32:08'),(6,'Goa','GA','2026-07-06 07:32:08'),(7,'Gujarat','GJ','2026-07-06 07:32:08'),(8,'Haryana','HR','2026-07-06 07:32:08'),(9,'Himachal Pradesh','HP','2026-07-06 07:32:08'),(10,'Jharkhand','JH','2026-07-06 07:32:08'),(11,'Karnataka','KA','2026-07-06 07:32:08'),(12,'Kerala','KL','2026-07-06 07:32:08'),(13,'Madhya Pradesh','MP','2026-07-06 07:32:08'),(14,'Maharashtra','MH','2026-07-06 07:32:08'),(15,'Manipur','MN','2026-07-06 07:32:08'),(16,'Meghalaya','ML','2026-07-06 07:32:08'),(17,'Mizoram','MZ','2026-07-06 07:32:08'),(18,'Nagaland','NL','2026-07-06 07:32:08'),(19,'Odisha','OD','2026-07-06 07:32:08'),(20,'Punjab','PB','2026-07-06 07:32:08'),(21,'Rajasthan','RJ','2026-07-06 07:32:08'),(22,'Sikkim','SK','2026-07-06 07:32:08'),(23,'Tamil Nadu','TN','2026-07-06 07:32:08'),(24,'Telangana','TG','2026-07-06 07:32:08'),(25,'Tripura','TR','2026-07-06 07:32:08'),(26,'Uttar Pradesh','UP','2026-07-06 07:32:08'),(27,'Uttarakhand','UK','2026-07-06 07:32:08'),(28,'West Bengal','WB','2026-07-06 07:32:08'),(29,'Andaman and Nicobar Islands','AN','2026-07-06 07:32:08'),(30,'Chandigarh','CH','2026-07-06 07:32:08'),(31,'Dadra and Nagar Haveli and Daman and Diu','DN','2026-07-06 07:32:08'),(32,'Lakshadweep','LD','2026-07-06 07:32:08'),(33,'Delhi','DL','2026-07-06 07:32:08'),(34,'Puducherry','PY','2026-07-06 07:32:08'),(35,'Ladakh','LA','2026-07-06 07:32:08'),(36,'Jammu and Kashmir','JK','2026-07-06 07:32:08');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-17  7:22:52
