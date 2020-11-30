-- Adminer 4.6.2 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `admin_user`;
CREATE TABLE `admin_user` (
  `rid` char(36) NOT NULL,
  `user_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'User ID',
  `firstname` varchar(32) DEFAULT NULL COMMENT 'User First Name',
  `lastname` varchar(32) DEFAULT NULL COMMENT 'User Last Name',
  `email` varchar(128) DEFAULT NULL COMMENT 'User Email',
  `username` varchar(40) DEFAULT NULL COMMENT 'User Login',
  `password` varchar(255) NOT NULL COMMENT 'User Password',
  `created_by` int(11) NOT NULL,
  `phone_number1` varchar(20) NOT NULL,
  `phone_number2` varchar(20) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'User Created Time',
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'User Modified Time',
  `is_deleted` tinyint(4) NOT NULL DEFAULT '0' COMMENT 'User Delete Status',
  `logdate` timestamp NULL DEFAULT NULL COMMENT 'User Last Login Time',
  `lognum` smallint(5) unsigned NOT NULL DEFAULT '0' COMMENT 'User Login Number',
  `is_active` smallint(6) NOT NULL DEFAULT '1' COMMENT 'User Is Active',
  `extra` text COMMENT 'User Extra Data',
  `rp_token` text COMMENT 'Reset Password Link Token',
  `rp_token_created_at` timestamp NULL DEFAULT NULL COMMENT 'Reset Password Link Token Creation Date',
  `interface_locale` varchar(16) NOT NULL DEFAULT 'en_US' COMMENT 'Backend interface locale',
  `failures_num` smallint(6) DEFAULT '0' COMMENT 'Failure Number',
  `lock_expires` timestamp NULL DEFAULT NULL COMMENT 'Expiration Lock Dates',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `ADMIN_USER_USERNAME` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Admin User Table';


DROP TABLE IF EXISTS `admin_user_session`;
CREATE TABLE `admin_user_session` (
  `rid` char(36) NOT NULL,
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Entity ID',
  `session_id` varchar(255) NOT NULL COMMENT 'Session id value',
  `user_id` int(10) unsigned DEFAULT NULL COMMENT 'Admin User ID',
  `status` smallint(5) unsigned NOT NULL DEFAULT '1' COMMENT 'Current Session status',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Created Time',
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Update Time',
  `ip` varchar(15) NOT NULL COMMENT 'Remote user IP',
  `platform` varchar(50) NOT NULL COMMENT 'iPad, iPhone, Android, Desktop',
  `device_id` varchar(200) NOT NULL,
  `device_token` varchar(200) NOT NULL COMMENT 'FCM token',
  PRIMARY KEY (`id`),
  KEY `ADMIN_USER_SESSION_SESSION_ID` (`session_id`),
  KEY `ADMIN_USER_SESSION_USER_ID` (`user_id`),
  CONSTRAINT `ADMIN_USER_SESSION_USER_ID_ADMIN_USER_USER_ID` FOREIGN KEY (`user_id`) REFERENCES `admin_user` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Admin User sessions table';


DROP TABLE IF EXISTS `authorization_role`;
CREATE TABLE `authorization_role` (
  `rid` char(36) NOT NULL,
  `role_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Role ID',
  `parent_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'Parent Role ID',
  `tree_level` smallint(5) unsigned NOT NULL DEFAULT '0' COMMENT 'Role Tree Level',
  `sort_order` smallint(5) unsigned NOT NULL DEFAULT '0' COMMENT 'Role Sort Order',
  `role_type` varchar(1) NOT NULL DEFAULT '0' COMMENT 'Role Type',
  `user_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'User ID',
  `user_type` varchar(16) DEFAULT NULL COMMENT 'User Type',
  `role_name` varchar(50) DEFAULT NULL COMMENT 'Role Name',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`role_id`),
  KEY `AUTHORIZATION_ROLE_PARENT_ID_SORT_ORDER` (`parent_id`,`sort_order`),
  KEY `AUTHORIZATION_ROLE_TREE_LEVEL` (`tree_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Admin Role Table';

INSERT INTO `authorization_role` (`rid`, `role_id`, `parent_id`, `tree_level`, `sort_order`, `role_type`, `user_id`, `user_type`, `role_name`, `created_date`, `updated_date`) VALUES
('0386d500-2f06-4848-88e3-6b8f76825914',	1,	0,	0,	1,	'G',	0,	'',	'Administrators',	'2018-05-25 07:50:18',	'2018-05-25 07:50:18'),
('08f5cf63-d534-4050-9c03-b3e4fc314495',	2,	1,	0,	2,	'U',	1,	NULL,	'admin',	'2018-05-25 07:50:50',	'2018-05-25 07:50:50'),
('0b2aa8c9-64a6-11e8-a41b-021a018d4e0e',	3,	1,	0,	2,	'U',	2,	NULL,	'as-admin',	'2018-05-25 07:50:50',	'2018-05-25 07:50:50'),
('940fc4e7-64d6-11e8-a41b-021a018d4e0e',	4,	0,	0,	0,	'G',	0,	NULL,	'Sales',	'2018-05-31 13:29:00',	'2018-05-31 13:29:00'),
('ab04e8ab-64d6-11e8-a41b-021a018d4e0e',	5,	0,	0,	0,	'G',	0,	NULL,	'Finance',	'2018-05-31 13:29:38',	'2018-05-31 13:29:38'),
('b700b236-763a-4771-9ac0-799618e104d2',	8,	1,	0,	0,	'U',	14,	NULL,	'pp',	'2018-06-01 14:15:34',	'2018-06-01 14:15:34'),
('e7d49839-73ce-49b7-a515-2a8730c283ca',	9,	1,	0,	0,	'U',	15,	NULL,	'pp',	'2018-06-01 14:50:43',	'2018-06-01 14:50:43'),
('1fa71a70-7ed9-4ff8-818d-93a82ef7be09',	10,	4,	0,	0,	'U',	16,	NULL,	'pp',	'2018-06-01 14:51:40',	'2018-06-01 14:51:40'),
('dff2c57f-310b-436c-aff1-bb5c90343199',	11,	4,	0,	0,	'U',	17,	NULL,	'pp',	'2018-06-01 14:51:58',	'2018-06-01 14:51:58'),
('072f1ed8-94ce-47f2-a32b-a372cab93286',	12,	5,	0,	0,	'U',	18,	NULL,	'pp',	'2018-06-01 14:52:22',	'2018-06-01 14:52:22'),
('2cc84f39-2b5a-463a-8070-a71b31a2cc76',	13,	5,	0,	0,	'U',	19,	NULL,	'pp',	'2018-06-01 14:52:34',	'2018-06-01 14:52:34'),
('dc1c9569-1a31-4dce-9235-d518c02e93ca',	14,	1,	0,	0,	'U',	20,	NULL,	'pp',	'2018-06-01 14:53:15',	'2018-06-01 14:53:15'),
('74c7dbdd-e8d3-4658-b38a-6d86c4b88be9',	15,	4,	0,	0,	'U',	21,	NULL,	'pp',	'2018-06-08 16:19:46',	'2018-06-08 16:19:46'),
('4d741568-5ba9-41c5-9749-4aeac286250a',	16,	4,	0,	0,	'U',	22,	NULL,	'pp',	'2018-06-08 16:21:29',	'2018-06-08 16:21:29'),
('a800e512-fd86-4a64-b499-ed9a7d35cc4d',	17,	4,	0,	0,	'U',	23,	NULL,	'pp',	'2018-06-09 10:56:55',	'2018-06-09 10:56:55'),
('755bff3a-f2d7-4286-84b3-c9081d9017ef',	18,	4,	0,	0,	'U',	24,	NULL,	'pp',	'2018-06-11 10:04:58',	'2018-06-11 10:04:58'),
('4335f037-1cb2-45c0-8c70-f71b86f12ccc',	19,	4,	0,	0,	'U',	25,	NULL,	'pp',	'2018-06-11 10:05:34',	'2018-06-11 10:05:34'),
('f9b52dd0-5e66-44a9-b88e-6f9e454a374f',	20,	4,	0,	0,	'U',	26,	NULL,	'pp',	'2018-06-11 11:16:29',	'2018-06-11 11:16:29'),
('40578b7d-9a2b-410e-b27f-0333777b10be',	21,	4,	0,	0,	'U',	27,	NULL,	'test',	'2018-06-11 11:28:55',	'2018-06-11 11:28:55'),
('a5a6b057-27a8-4936-a0b4-1921d088500f',	22,	4,	0,	0,	'U',	28,	NULL,	'test',	'2018-06-11 11:42:26',	'2018-06-11 11:42:26'),
('16d97667-4342-42dd-8d22-378fed6564d1',	23,	1,	0,	0,	'U',	29,	NULL,	'test',	'2018-06-11 11:42:53',	'2018-06-11 11:42:53'),
('9cbdea2b-9ef8-48e3-939a-4530bdfe9633',	24,	5,	0,	0,	'U',	30,	NULL,	'test',	'2018-06-11 11:47:54',	'2018-06-11 11:47:54'),
('ca873c97-c81b-4f89-88ea-ba4428cd1747',	25,	5,	0,	0,	'U',	31,	NULL,	'test',	'2018-06-11 11:50:50',	'2018-06-11 11:50:50'),
('a1ce782b-27d5-4ccd-b4b1-2b06c3be0ed4',	26,	4,	0,	0,	'U',	32,	NULL,	'test',	'2018-06-11 11:57:34',	'2018-06-11 11:57:34'),
('e9d85827-6bb0-4ad6-9c32-2f8bd45454bf',	27,	1,	0,	0,	'U',	33,	NULL,	'test',	'2018-06-11 11:58:37',	'2018-06-11 11:58:37'),
('24e5de1e-fb7d-458c-9ac1-d510f26e80dc',	28,	5,	0,	0,	'U',	34,	NULL,	'test',	'2018-06-11 11:59:56',	'2018-06-11 11:59:56'),
('4842991e-6cb5-4403-bf99-fa3a49659604',	29,	1,	0,	0,	'U',	35,	NULL,	'test',	'2018-06-11 12:00:44',	'2018-06-11 12:00:44');

DROP TABLE IF EXISTS `authorization_rule`;
CREATE TABLE `authorization_rule` (
  `rid` char(36) NOT NULL,
  `rule_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Rule ID',
  `role_id` int(10) unsigned NOT NULL DEFAULT '0' COMMENT 'Role ID',
  `module_id` int(11) DEFAULT NULL COMMENT 'Module ID from Rule Set',
  `privileges` varchar(20) DEFAULT NULL COMMENT 'Privileges',
  `permission` varchar(10) DEFAULT NULL COMMENT 'Permission',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rule_id`),
  KEY `AUTHORIZATION_RULE_RESOURCE_ID_ROLE_ID` (`module_id`,`role_id`),
  KEY `AUTHORIZATION_RULE_ROLE_ID_RESOURCE_ID` (`role_id`,`module_id`),
  CONSTRAINT `AUTHORIZATION_RULE_ROLE_ID_AUTHORIZATION_ROLE_ROLE_ID` FOREIGN KEY (`role_id`) REFERENCES `authorization_role` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Admin Rule Table';


DROP TABLE IF EXISTS `authorization_rule_set`;
CREATE TABLE `authorization_rule_set` (
  `rid` char(36) NOT NULL,
  `module_id` int(11) NOT NULL AUTO_INCREMENT,
  `parent_id` int(11) NOT NULL,
  `level` int(2) NOT NULL,
  `module_name` varchar(200) NOT NULL,
  `action` varchar(100) DEFAULT NULL,
  `routes` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`module_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `core_config_data`;
CREATE TABLE `core_config_data` (
  `rid` char(36) NOT NULL,
  `config_id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Config Id',
  `country_id` varchar(2) NOT NULL DEFAULT '0' COMMENT 'country iso2 code',
  `config_key` varchar(255) NOT NULL DEFAULT 'general' COMMENT 'Config Key',
  `config_value` text COMMENT 'Config Value',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`config_id`),
  UNIQUE KEY `CORE_CONFIG_DATA_SCOPE_SCOPE_ID_PATH` (`country_id`,`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Config Data';


DROP TABLE IF EXISTS `directory_country`;
CREATE TABLE `directory_country` (
  `country_id` varchar(2) NOT NULL COMMENT 'Country Id in ISO-2',
  `iso2_code` varchar(2) DEFAULT NULL COMMENT 'Country ISO-2 format',
  `iso3_code` varchar(3) DEFAULT NULL COMMENT 'Country ISO-3',
  PRIMARY KEY (`country_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Directory Country';


DROP TABLE IF EXISTS `server_endpoint`;
CREATE TABLE `server_endpoint` (
  `rid` char(36) NOT NULL,
  `endpoint_id` int(11) NOT NULL AUTO_INCREMENT,
  `country_id` varchar(2) NOT NULL,
  `frontend_url` varchar(255) NOT NULL,
  `api_url` varchar(255) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`endpoint_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `store_business_info`;
CREATE TABLE `store_business_info` (
  `rid` char(36) NOT NULL,
  `store_id` int(22) NOT NULL AUTO_INCREMENT,
  `business_legal_name` varchar(200) NOT NULL,
  `store_name` varchar(200) NOT NULL COMMENT 'store name',
  `mobile_number` varchar(20) NOT NULL COMMENT 'number to be verified',
  `phone_number_verification` int(1) NOT NULL,
  `parent_categories` varchar(200) NOT NULL,
  `zipcode` int(10) NOT NULL,
  `address_line1` varchar(200) NOT NULL COMMENT 'required',
  `address_line2` varchar(200) NOT NULL COMMENT 'optional',
  `city` int(5) NOT NULL,
  `state` int(5) NOT NULL,
  `country_id` varchar(2) NOT NULL COMMENT 'country code',
  `created_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`store_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `store_document_info`;
CREATE TABLE `store_document_info` (
  `rid` char(35) NOT NULL,
  `document_id` int(11) NOT NULL,
  `document_type_id` int(11) NOT NULL,
  `document_value` text NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `store_document_type`;
CREATE TABLE `store_document_type` (
  `rid` char(36) NOT NULL,
  `document_type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(200) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`document_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `store_product_revenue_info`;
CREATE TABLE `store_product_revenue_info` (
  `rid` char(36) NOT NULL,
  `products_revenue_id` int(11) NOT NULL AUTO_INCREMENT,
  `categories_subcategories` int(11) NOT NULL,
  `annual_turnover` int(11) NOT NULL,
  `product_count_to_sell` int(50) NOT NULL,
  `sell_in_other_website` int(2) NOT NULL,
  `other_website_url` varchar(200) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`products_revenue_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `store_scheme_info`;
CREATE TABLE `store_scheme_info` (
  `rid` char(36) NOT NULL,
  `scheme_info_id` int(11) NOT NULL AUTO_INCREMENT,
  `scheme_type_id` int(11) NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `duration` int(11) NOT NULL,
  `end_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`scheme_info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `store_scheme_type`;
CREATE TABLE `store_scheme_type` (
  `rid` char(36) NOT NULL,
  `scheme_id` int(11) NOT NULL AUTO_INCREMENT,
  `scheme_name` varchar(200) NOT NULL,
  `duration` int(11) NOT NULL,
  `commission_b2b` double NOT NULL,
  `commission_b2c` double NOT NULL,
  `logistics_type` int(11) NOT NULL COMMENT 'international or domestic or both',
  `validity` varchar(50) NOT NULL,
  `membership_price` double NOT NULL,
  `additional_data` text NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`scheme_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `store_tax_info`;
CREATE TABLE `store_tax_info` (
  `rid` char(36) NOT NULL,
  `store_tax_id` int(11) NOT NULL AUTO_INCREMENT,
  `tax_state` int(5) NOT NULL,
  `tax_number` varchar(100) NOT NULL COMMENT 'GST/VAT Number',
  `business_registration_number` varchar(50) NOT NULL,
  `additional_data` text NOT NULL COMMENT 'Additional data in json form',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`store_tax_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2018-06-11 14:41:04
