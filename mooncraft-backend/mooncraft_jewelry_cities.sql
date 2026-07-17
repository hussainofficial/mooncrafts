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
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `state_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_city_state` (`name`,`state_id`),
  KEY `idx_state_id` (`state_id`),
  KEY `idx_name` (`name`),
  CONSTRAINT `cities_ibfk_1` FOREIGN KEY (`state_id`) REFERENCES `states` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Mumbai',14,'2026-07-06 07:32:08'),(2,'Pune',14,'2026-07-06 07:32:08'),(3,'Nagpur',14,'2026-07-06 07:32:08'),(4,'Thane',14,'2026-07-06 07:32:08'),(5,'Aurangabad',14,'2026-07-06 07:32:08'),(6,'Nashik',14,'2026-07-06 07:32:08'),(7,'Kolhapur',14,'2026-07-06 07:32:08'),(8,'New Delhi',33,'2026-07-06 07:32:08'),(9,'Delhi',33,'2026-07-06 07:32:08'),(10,'East Delhi',33,'2026-07-06 07:32:08'),(11,'North Delhi',33,'2026-07-06 07:32:08'),(12,'South Delhi',33,'2026-07-06 07:32:08'),(13,'West Delhi',33,'2026-07-06 07:32:08'),(14,'Bangalore',11,'2026-07-06 07:32:08'),(15,'Mysore',11,'2026-07-06 07:32:08'),(16,'Mangalore',11,'2026-07-06 07:32:08'),(17,'Hubballi',11,'2026-07-06 07:32:08'),(18,'Bellary',11,'2026-07-06 07:32:08'),(19,'Davangere',11,'2026-07-06 07:32:08'),(20,'Chennai',23,'2026-07-06 07:32:08'),(21,'Coimbatore',23,'2026-07-06 07:32:08'),(22,'Madurai',23,'2026-07-06 07:32:08'),(23,'Salem',23,'2026-07-06 07:32:08'),(24,'Tirunelveli',23,'2026-07-06 07:32:08'),(25,'Erode',23,'2026-07-06 07:32:08'),(26,'Ahmedabad',7,'2026-07-06 07:32:08'),(27,'Surat',7,'2026-07-06 07:32:08'),(28,'Vadodara',7,'2026-07-06 07:32:08'),(29,'Rajkot',7,'2026-07-06 07:32:08'),(30,'Jamnagar',7,'2026-07-06 07:32:08'),(31,'Bhavnagar',7,'2026-07-06 07:32:08'),(32,'Gandhinagar',7,'2026-07-06 07:32:08'),(33,'Lucknow',26,'2026-07-06 07:32:08'),(34,'Kanpur',26,'2026-07-06 07:32:08'),(35,'Ghaziabad',26,'2026-07-06 07:32:08'),(36,'Agra',26,'2026-07-06 07:32:08'),(37,'Meerut',26,'2026-07-06 07:32:08'),(38,'Varanasi',26,'2026-07-06 07:32:08'),(39,'Allahabad',26,'2026-07-06 07:32:08'),(40,'Jaipur',21,'2026-07-06 07:32:08'),(41,'Jodhpur',21,'2026-07-06 07:32:08'),(42,'Ajmer',21,'2026-07-06 07:32:08'),(43,'Udaipur',21,'2026-07-06 07:32:08'),(44,'Kota',21,'2026-07-06 07:32:08'),(45,'Bikaner',21,'2026-07-06 07:32:08'),(46,'Kolkata',28,'2026-07-06 07:32:08'),(47,'Howrah',28,'2026-07-06 07:32:08'),(48,'Durgapur',28,'2026-07-06 07:32:08'),(49,'Siliguri',28,'2026-07-06 07:32:08'),(50,'Darjeeling',28,'2026-07-06 07:32:08'),(51,'Visakhapatnam',1,'2026-07-06 09:47:35'),(52,'Vijayawada',1,'2026-07-06 09:47:35'),(53,'Hyderabad',1,'2026-07-06 09:47:35'),(54,'Tirupati',1,'2026-07-06 09:47:35'),(55,'Hyderabad',24,'2026-07-06 09:51:56'),(56,'Secunderabad',24,'2026-07-06 09:51:56'),(57,'Warangal',24,'2026-07-06 09:51:56'),(58,'Vijayawada',24,'2026-07-06 09:51:56'),(59,'Itanagar',2,'2026-07-06 09:51:56'),(60,'Naharlagun',2,'2026-07-06 09:51:56'),(61,'Guwahati',3,'2026-07-06 09:51:56'),(62,'Silchar',3,'2026-07-06 09:51:56'),(63,'Patna',4,'2026-07-06 09:51:56'),(64,'Gaya',4,'2026-07-06 09:51:56'),(65,'Raipur',5,'2026-07-06 09:51:56'),(66,'Bhilai',5,'2026-07-06 09:51:56'),(67,'Panaji',6,'2026-07-06 09:51:56'),(68,'Margao',6,'2026-07-06 09:51:56'),(69,'Faridabad',8,'2026-07-06 09:51:56'),(70,'Gurgaon',8,'2026-07-06 09:51:56'),(71,'Shimla',9,'2026-07-06 09:51:56'),(72,'Solan',9,'2026-07-06 09:51:56'),(73,'Ranchi',10,'2026-07-06 09:51:56'),(74,'Jamshedpur',10,'2026-07-06 09:51:56'),(75,'Kochi',12,'2026-07-06 09:51:56'),(76,'Thiruvananthapuram',12,'2026-07-06 09:51:56'),(77,'Indore',13,'2026-07-06 09:51:56'),(78,'Bhopal',13,'2026-07-06 09:51:56'),(79,'Imphal',15,'2026-07-06 09:51:56'),(80,'Churachandpur',15,'2026-07-06 09:51:56'),(81,'Shillong',16,'2026-07-06 09:51:56'),(82,'Tura',16,'2026-07-06 09:51:56'),(83,'Aizawl',17,'2026-07-06 09:51:56'),(84,'Kohima',18,'2026-07-06 09:51:56'),(85,'Dimapur',18,'2026-07-06 09:51:56'),(86,'Bhubaneswar',19,'2026-07-06 09:51:56'),(87,'Cuttack',19,'2026-07-06 09:51:56'),(88,'Chandigarh',20,'2026-07-06 09:51:56'),(89,'Ludhiana',20,'2026-07-06 09:51:56'),(90,'Gangtok',22,'2026-07-06 09:51:56'),(91,'Agartala',25,'2026-07-06 09:51:56'),(92,'Udaipur',25,'2026-07-06 09:51:56'),(93,'Dehradun',27,'2026-07-06 09:51:56'),(94,'Nainital',27,'2026-07-06 09:51:56'),(95,'Port Blair',29,'2026-07-06 09:51:56'),(96,'Chandigarh',30,'2026-07-06 09:51:56'),(97,'Silvassa',31,'2026-07-06 09:51:56'),(98,'Kavaratti',32,'2026-07-06 09:51:56'),(99,'Puducherry',34,'2026-07-06 09:51:56'),(100,'Leh',35,'2026-07-06 09:51:56'),(101,'Srinagar',36,'2026-07-06 09:51:56'),(102,'Jammu',36,'2026-07-06 09:51:56');
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-17  7:22:50
