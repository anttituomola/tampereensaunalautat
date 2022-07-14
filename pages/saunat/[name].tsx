import { prisma } from 'lib/prisma'
import { Lautta } from 'types'

type Props = {
  sauna: Lautta
}

const name = ({sauna}: Props) => {
  return (
    <div>
      <h1>{sauna.name}</h1>
      <p>{sauna.location}</p>
    </div>
  )
}

export default name

export const getStaticPaths = async () => {
  const saunas = await prisma.lautta.findMany()
  const paths = saunas.map(sauna => ({
    params: {
      name: sauna.name,
    },

  }))

  return {
    paths,
    fallback: false
  };
} 

export const getStaticProps = async (context: any) => {
  const name: string = context.params.name
  const sauna = await prisma.lautta.findUnique({
    where: {
      name: context.params.name,
    },
  })
  return {
    props: {
      sauna,
    },
  }
}
