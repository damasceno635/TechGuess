Cypress.Commands.add('mockProducts', () => {
  cy.intercept('GET', '**/products', {
    fixture: 'products.json'
  }).as('getProducts');
});

Cypress.Commands.add('visitTechGuess', () => {
  cy.visit('/frontend/index.html');
});

Cypress.Commands.add('waitForProducts', () => {
  cy.get('#produtos .card', { timeout: 10000 })
    .should('have.length.at.least', 1);
});