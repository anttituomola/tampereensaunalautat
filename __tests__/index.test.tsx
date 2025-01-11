import { fireEvent, render, screen } from '@testing-library/react'
import Home from 'pages/index'
import '@testing-library/jest-dom'

describe('Home', () => {
    it("renders a heading", () => {
        render(<Home saunas={[]} />)
        expect(screen.getByText("Tampereen saunalautat")).toBeInTheDocument()
    }),
        it("has a button to toggle filters", () => {
            render(<Home saunas={[]} />)
            expect(screen.getByRole("button", { name: "Järjestä / suodata" })).toBeInTheDocument()
        }),
        it("when clicking Järjestä / suodata button, it renders a location", () => {
            render(<Home saunas={[]} />)
            fireEvent.click(screen.getByRole("button", { name: "Järjestä / suodata" }))
            expect(screen.getByLabelText("Näsijärvi")).toBeInTheDocument()
        })
})