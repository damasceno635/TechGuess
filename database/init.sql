CREATE TABLE products (

id INT AUTO_INCREMENT PRIMARY KEY,

name VARCHAR(150),

image VARCHAR(255),

category VARCHAR(50),

brand VARCHAR(50),

price DECIMAL(10,2),

ram VARCHAR(20),

storage VARCHAR(50),

description TEXT,

tags TEXT

);

INSERT INTO products
(name,image,category,brand,price,ram,storage,description,tags)
VALUES
(
"Galaxy S23",
"https://images.samsung.com/galaxy-s23.jpg",
"smartphone",
"Samsung",
5000,
"8GB",
"256GB",
"Samsung topo de linha",
"android,camera,gaming,performance"
);