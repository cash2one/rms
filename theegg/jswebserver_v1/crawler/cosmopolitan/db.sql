-- phpMyAdmin SQL Dump
-- version 4.0.10deb1
-- http://www.phpmyadmin.net
--
-- 主机: localhost
-- 生成日期: 2014-05-28 19:17:18
-- 服务器版本: 5.5.37-0ubuntu0.14.04.1
-- PHP 版本: 5.5.9-1ubuntu4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- 数据库: `websites`
--

-- --------------------------------------------------------

--
-- 表的结构 `queue`
--

CREATE TABLE IF NOT EXISTS `queue` (
        `id` int(75) NOT NULL AUTO_INCREMENT,
        `url` varchar(1024) NOT NULL,
        `ref` varchar(1024) NOT NULL,
        `status` int(11) NOT NULL DEFAULT '0',
        PRIMARY KEY (`id`),
        UNIQUE KEY `url` (`url`(255))
        ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=540228 ;

-- --------------------------------------------------------

--
-- 表的结构 `websites`
--

    CREATE TABLE IF NOT EXISTS `websites` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `url` varchar(2000) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
            `title` varchar(500) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
            `keywords` varchar(500) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
            `desc` text CHARACTER SET utf32 COLLATE utf32_unicode_ci NOT NULL,
            `body` text,
            `type` varchar(31) DEFAULT NULL,
            PRIMARY KEY (`id`),
            UNIQUE KEY `url` (`url`(255))
            ) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3422 ;

