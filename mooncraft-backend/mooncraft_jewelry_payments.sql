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
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `razorpay_order_id` varchar(100) DEFAULT NULL,
  `razorpay_payment_id` varchar(100) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `transaction_id` varchar(100) DEFAULT NULL,
  `gateway_name` varchar(50) DEFAULT NULL,
  `gateway_order_id` varchar(100) DEFAULT NULL,
  `gateway_response` json DEFAULT NULL,
  `failure_reason` text,
  `completed_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,3,276790.00,'razorpay','pending',NULL,NULL,NULL,'2026-07-07 16:12:14','2026-07-07 16:12:15',NULL,NULL,'order_TAfrWRlDvrpLNa',NULL,NULL,NULL,NULL),(2,4,276790.00,'razorpay','pending',NULL,NULL,NULL,'2026-07-07 16:13:12','2026-07-07 16:13:13',NULL,NULL,'order_TAfsXdQV19944y',NULL,NULL,NULL,NULL),(3,5,276790.00,'razorpay','pending',NULL,NULL,NULL,'2026-07-07 16:15:35','2026-07-07 16:15:35',NULL,NULL,'order_TAfv3P5ECQLIw7',NULL,NULL,NULL,NULL),(4,6,276790.00,'razorpay','pending',NULL,NULL,NULL,'2026-07-07 16:23:08','2026-07-07 16:23:08',NULL,NULL,'order_TAg31mxHnwmruV',NULL,NULL,NULL,NULL),(5,7,276790.00,'razorpay','failed',NULL,NULL,NULL,'2026-07-07 16:34:48','2026-07-07 17:05:31',NULL,NULL,'order_TAgFM77bOgFHkp',NULL,'User cancelled payment',NULL,'2026-07-07 17:05:31'),(6,8,276790.00,'razorpay','failed',NULL,NULL,NULL,'2026-07-07 18:19:12','2026-07-07 18:21:25',NULL,NULL,'order_TAi1dkjAN2bH6z',NULL,'User cancelled payment',NULL,'2026-07-07 18:21:25'),(7,9,276790.00,'razorpay','failed',NULL,NULL,NULL,'2026-07-08 20:24:42','2026-07-08 20:25:14',NULL,NULL,'order_TB8hIczi5yWaw5',NULL,'User cancelled payment',NULL,'2026-07-08 20:25:14');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-17  7:22:51
