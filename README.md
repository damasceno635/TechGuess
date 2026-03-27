# Tech Guess - Sistema de Catálogo e Recomendação de Tecnologia

**Tech Guess** é uma aplicação web interativa que ajuda usuários a encontrar produtos tecnológicos ideais com base em suas necessidades. 
O sistema oferece filtros avançados, comparação inteligente de produtos e recomendações personalizadas usando análise de similaridade e processamento de texto.

O objetivo do projeto é demonstrar a construção de uma aplicação Full Stack com práticas DevOps, integrando:
* frontend web
* API REST
* banco de dados
* containerização com Docker
* pipeline de integração contínua (CI)

## Funcionalidades

### Busca e Filtros
- **Pesquisa textual** por nome, marca, categoria e tags
- **Filtros dinâmicos** por categoria e marca (gerados automaticamente)
- **Filtro por preço** com slider interativo
- **Ordenação** por nome (crescente/decrescente) e preço (menor/maior)

### Visualização de Produtos
- Cards responsivos com imagem, nome, marca e preço
- Modal de Detalhes ao clicar nos cards (ver detalhes do produto)
- Paginação (8 itens por página)
- Checkbox para seleção de produtos para comparação

### Comparação Inteligente
- Selecione múltiplos produtos para comparar
- Algoritmo que analisa palavras-chave e características técnicas
- Recomendação do produto mais adequado com justificativa

### Recomendações Baseadas em Similaridade
- Ao visualizar um produto, sugestões de itens semelhantes aparecem (modal de detalhes)
- Algoritmo que considera: Preço, RAM, Armazenamento, Marca, Tags

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla), Fetch API
- **Fontes**: Google Fonts (Inter)
- **Backend**: Node.js, Express, MySQL, CORS
- **DevOps**: Docker, Docker Compose, GitHub Actions (CI Pipeline)

## Executando o Projeto com Docker
- **Clonar repositório**: git clone https://github.com/damasceno635/TechGuess.git
- **Acessar pasta do projeto**: cd TechGuess
- **Iniciar containers**: docker compose up --build (este comando irá iniciar a API e o BD)
- **Acessar aplicação**:
   - Frontend (página principal): http://localhost:8080/
   - Frontend (página do admin): http://localhost:8080/admin/admin.html
   - API: http://localhost:3000/products
