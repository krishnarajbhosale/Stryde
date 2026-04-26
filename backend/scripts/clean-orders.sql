-- Clean all orders and related rows (MySQL / MariaDB).
-- Database: strydeeva (change USE if yours differs — see application.properties).
--
-- Run from shell:
--   mysql -h 127.0.0.1 -P 3306 -u projectuser -p strydeeva < scripts/clean-orders.sql
--
-- Or paste into MySQL Workbench / DBeaver after selecting the schema.

USE strydeeva;

START TRANSACTION;

-- Wallet debits/credits tied to specific orders (safe before deleting orders)
DELETE wi FROM wallet_transaction wi
INNER JOIN orders o ON o.id = wi.order_id;

-- Line items
DELETE FROM order_item;

-- Orders
DELETE FROM orders;

COMMIT;

-- Optional: reset auto-increment so next order starts from 1 (comment out if you prefer)
-- ALTER TABLE order_item AUTO_INCREMENT = 1;
-- ALTER TABLE orders AUTO_INCREMENT = 1;
