describe('TechGuess - Testes End-to-End', () => {
  
  beforeEach(() => {
    cy.mockProducts();
    cy.visitTechGuess();
    cy.wait('@getProducts');
    cy.waitForProducts();
  });

  describe('Carregamento da Página', () => {
    it('deve carregar a página corretamente', () => {
      cy.contains('Tech Guess').should('be.visible');
      cy.contains('Bem-vindo à Tech Guess').should('be.visible');
      cy.get('#busca').should('be.visible');
      cy.get('#produtos .card').should('have.length.at.least', 1);
    });

    it('deve mostrar loading enquanto carrega', () => {
      cy.mockProducts(); // 🔥 corrigido
      cy.visitTechGuess();
      cy.contains('Carregando produtos...').should('be.visible');
      cy.wait('@getProducts');
      cy.waitForProducts();
      cy.contains('Carregando produtos...').should('not.exist');
    });
  });

  describe('Filtros', () => {
    it('deve filtrar por categoria', () => {
  cy.get('#filtro-categoria').select('Smartphone');

  cy.fixture('products.json').then((products) => {
    const expected = products.filter(p => p.category === 'Smartphone').length;

    cy.get('#produtos .card').should('have.length', expected);
  });
});

    it('deve filtrar por marca', () => {
      cy.get('#filtro-marca').select('Apple');

      cy.fixture('products.json').then((products) => {
        const appleCount = products.filter(p => p.brand === 'Apple').length;
        cy.get('#produtos .card').should('have.length', appleCount);
      });

      cy.get('#produtos .card').each(($card) => {
        cy.wrap($card).should('contain', 'Apple');
      });
    });

    it('deve filtrar por preço', () => {
  cy.get('#filtro-preco')
    .invoke('val', 4000)
    .trigger('input')
    .trigger('change');

  cy.get('#produtos .card .price').each(($price) => {
    const price = parseFloat(
      $price.text()
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(',', '.')
    );

    expect(price).to.be.at.most(4000);
  });
});

    it('deve filtrar por múltiplos critérios', () => {
      cy.get('#filtro-categoria').select('Smartphone');
      cy.get('#filtro-marca').select('Apple');

      cy.get('#produtos .card').should('have.length', 1);
      cy.get('#produtos .card').should('contain', 'iPhone 13');
    });

    it('deve filtrar por busca', () => {
      cy.get('#busca').type('iphone');

      cy.get('#produtos .card').should('have.length', 1);
      cy.get('#produtos .card').should('contain', 'iPhone 13');
    });

    it('deve limpar filtros', () => {
      cy.get('#filtro-categoria').select('Smartphone');
      cy.get('#produtos .card').should('have.length', 3);

      cy.get('#filtro-categoria').select('');
      cy.get('#produtos .card').should('have.length.at.least', 8);
    });
  });

  describe('Ordenação', () => {
    it('nome ascendente', () => {
      cy.get('#ordenacao').select('nome_asc');

      cy.get('#produtos .card h3').then(($els) => {
        const names = [...$els].map(el => el.innerText);
        const sorted = [...names].sort((a, b) => a.localeCompare(b));
        expect(names).to.deep.equal(sorted);
      });
    });

    it('preço ascendente', () => {
      cy.get('#ordenacao').select('preco_asc');

      cy.get('#produtos .card .price').then(($els) => {
        const prices = [...$els].map(el =>
          parseFloat(el.innerText.replace(/\D/g, '')) / 100
        );

        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).to.deep.equal(sorted);
      });
    });
  });

  describe('Paginação', () => {
    it('deve navegar entre páginas', () => {
      cy.get('#paginacao button').contains('Próximo').click();
      cy.get('#paginacao button.ativo').should('exist');
    });

    it('deve voltar página', () => {
      cy.get('#paginacao button').contains('Próximo').click();

      let produto;
      cy.get('#produtos .card h3').first().then(el => {
        produto = el.text();
      });

      cy.get('#paginacao button').contains('Anterior').click();

      cy.get('#produtos .card h3')
        .first()
        .should('not.have.text', produto); // 🔥 corrigido
    });
  });

  describe('Comparação', () => {
    it('deve selecionar produto', () => {
  cy.get('#produtos .card-checkbox')
    .first()
    .click({ force: true })
    .should('have.class', 'checked');
});
  });
});

describe('Performance', () => {
  it('carregamento rápido', () => {
    const start = Date.now();

    cy.mockProducts();
    cy.visitTechGuess();
    cy.wait('@getProducts');
    cy.waitForProducts().then(() => {
      const duration = Date.now() - start;
      expect(duration).to.be.lessThan(5000);
    });
  });
});