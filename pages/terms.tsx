import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import Head from 'next/head';

const Terms: React.FC = () => {
  return (
    <Container maxWidth='md'>
      <Head>
        <title>Käyttöehdot - Tampereensaunalautat.fi</title>
        <meta
          name='description'
          content='Tampereensaunalautat.fi käyttöehdot ja tietosuoja'
        />
      </Head>

      <Box sx={{ py: 4 }}>
        <Typography variant='h3' component='h1' gutterBottom>
          Käyttöehdot
        </Typography>

        <Paper elevation={1} sx={{ p: 4, mb: 4 }}>
          <Typography variant='h5' component='h2' gutterBottom>
            Tietojen käyttö
          </Typography>

          <Typography variant='body1' paragraph>
            Tampereensaunalautat.fi-palveluun rekisteröidyt tiedot käytetään
            ainoastaan saunalauttasi esittelemiseen tällä sivustolla. Tietojasi
            ei käytetä kaupallisiin tarkoituksiin.
          </Typography>

          <Typography variant='h6' component='h3' gutterBottom sx={{ mt: 3 }}>
            Mitä tietoja keräämme:
          </Typography>

          <Typography component='ul' variant='body1' sx={{ pl: 2 }}>
            <Typography component='li' sx={{ mb: 1 }}>
              Saunalautan tiedot (nimi, sijainti, hinnat, varusteet, kuvat)
            </Typography>
            <Typography component='li' sx={{ mb: 1 }}>
              Yhteystiedot (sähköposti, puhelinnumero, verkkosivut)
            </Typography>
            <Typography component='li' sx={{ mb: 1 }}>
              Omistajan nimi ja yhteystiedot kirjautumista varten
            </Typography>
          </Typography>

          <Typography variant='h6' component='h3' gutterBottom sx={{ mt: 3 }}>
            Miten käytämme tietoja:
          </Typography>

          <Typography component='ul' variant='body1' sx={{ pl: 2 }}>
            <Typography component='li' sx={{ mb: 1 }}>
              Saunalautan esittely sivustolla potentiaalisille asiakkaille
            </Typography>
            <Typography component='li' sx={{ mb: 1 }}>
              Yhteydenottojen välittäminen sinulle kiinnostuneilta asiakkailta
            </Typography>
            <Typography component='li' sx={{ mb: 1 }}>
              Tiedottaminen palvelun muutoksista tai tärkeistä ilmoituksista
            </Typography>
          </Typography>

          <Typography variant='h6' component='h3' gutterBottom sx={{ mt: 3 }}>
            Tietojen jakaminen:
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>
              Emme jaa tietojasi kolmansille osapuolille kaupallisiin
              tarkoituksiin.
            </strong>
            Yhteystietosi näytetään sivustolla ainoastaan siinä laajuudessa kuin
            haluat, jotta kiinnostuneet asiakkaat voivat ottaa sinuun yhteyttä.
          </Typography>

          <Typography variant='h6' component='h3' gutterBottom sx={{ mt: 3 }}>
            Tietojesi hallinta:
          </Typography>

          <Typography component='ul' variant='body1' sx={{ pl: 2 }}>
            <Typography component='li' sx={{ mb: 1 }}>
              Voit muokata tietojasi milloin tahansa kirjautumalla palveluun
            </Typography>
            <Typography component='li' sx={{ mb: 1 }}>
              Voit piilottaa saunalautan sivustolta tilapäisesti
            </Typography>
            <Typography component='li' sx={{ mb: 1 }}>
              Voit poistaa saunalautan kokonaan palvelusta ottamalla yhteyttä
              ylläpitoon
            </Typography>
          </Typography>

          <Typography variant='h6' component='h3' gutterBottom sx={{ mt: 3 }}>
            Yhteystiedot:
          </Typography>

          <Typography variant='body1' paragraph>
            Jos sinulla on kysymyksiä käyttöehdoista tai haluat poistaa tietosi
            palvelusta, ota yhteyttä:{' '}
            <a href='mailto:antti@anttituomola.fi'>antti@anttituomola.fi</a>
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mt: 4 }}>
            Käyttöehdot päivitetty: {new Date().toLocaleDateString('fi-FI')}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Terms;
