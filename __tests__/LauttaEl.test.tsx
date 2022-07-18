import { render, screen } from '@testing-library/react'
import LauttaEl from 'pages/saunat/[url_name]'
import '@testing-library/jest-dom'
import {mockSaunas} from '__mocks__/saunas'
const mockSauna = mockSaunas[0]

test('renders sauna name', () => {
    render(<LauttaEl sauna={mockSauna} />)
    expect(screen.getByText(`Tampereen saunalautat: ${mockSauna.name}`)).toBeInTheDocument()
})

test('renders sauna capacity', () => {
    render(<LauttaEl sauna={mockSauna} />)
    expect(screen.getByText(`${mockSauna.name} pystyy kuljettamaan risteilyllä maksimissaan ${mockSauna.capacity} henkilöä.`)).toBeInTheDocument()
})

test('renders sauna location', () => {
    render(<LauttaEl sauna={mockSauna} />)
    expect(screen.getByText(`${mockSauna.location}`)).toBeInTheDocument()
})

test("renders sauna image", () => {
    render(<LauttaEl sauna={mockSauna} />)
    expect(screen.getByAltText(`${mockSauna.name}`)).toBeInTheDocument()
})

