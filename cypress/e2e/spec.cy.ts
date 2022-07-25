
describe("See if filters work", () => {
  it('should click checkboxes and have remove filters button', () => {
    cy.visit('localhost:3000')
    cy.get('button').contains("Järjestä / suodata").should('be.visible').click() // open filters
    cy.get(':nth-child(4) > .MuiCheckbox-root > .PrivateSwitchBase-input').check() // check some equipment
    cy.get("button").contains("Näytä kaikki saunat").should('be.visible').click() // remove filters
    cy.get('.hiddenSaunas').should("not.exist") // all saunas should be visible
  }
  )
})

describe("See if tenders work", () => {
  it("should be able to add some saunas to selection see them there", () => {
    cy.visit("localhost:3000")
    cy.get('[data-cy="addButton-Vertical"] > [data-testid="AddIcon"]').click() // add sauna to selection
    cy.get('.SelectedSaunas_selectedSaunas__wIeLc').contains("Vertical") // check if sauna is in selection
  })
})