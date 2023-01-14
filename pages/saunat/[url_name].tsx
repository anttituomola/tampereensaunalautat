/* eslint-disable @next/next/no-img-element */
import dayjs from 'dayjs'
import styles from 'styles/[url_name].module.css'
import Image from 'next/image'
import Head from 'next/head'
import { Saunalautta } from 'pages/saunat/saunadata'
import { saunas } from 'pages/saunat/saunadata'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { useState } from 'react';

type Props = {
    sauna: Saunalautta
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const Name = ({ sauna }: Props) => {
    const [open, setOpen] = useState(false);
    const [modalImage, setModalImage] = useState("")
    const handleOpen = (image: string) => {
        setModalImage(image)
        setOpen(true)
    }
    const handleClose = () => setOpen(false);

    const pricing = sauna.pricemin === sauna.pricemax ? sauna.pricemin : `${sauna.pricemin} - ${sauna.pricemax}`
    const sortedEquipment = sauna.equipment.sort((a, b) => a.localeCompare(b))
    const saunaName = sauna.name
    const saunaLocation = sauna.location
    const title = `Saunalautta Tampere: ${saunaName}, ${saunaLocation}`

    return (
        <>
            <Head key={sauna.name}>
                <title>{title}</title>
                <meta name="description" content={`${sauna.name} sijainti on ${sauna.location} ja vuokrahinta on alkaen ${sauna.pricemin}`} />
            </Head>
            <div className={styles.container}>
                <h1>Saunalautta Tampere: {sauna.name}</h1>
                <div className={styles.mainImageHolder}>
                    <Image className={styles.mainImage} src={`/images/${sauna.mainImage}`} alt={sauna.name} layout="fill" priority />
                </div>
                <h3>{sauna.location}</h3>
                <small>{sauna.name} pystyy {sauna.name === "Saunalautta (Tampereen vesijettivuokraus)" ? "saunottamaan" : "kuljettamaan risteilyllä"} maksimissaan {sauna.capacity} henkilöä.</small>
                <div className="pricing">
                    <h2>Hinnoittelu</h2>
                    <p>Vuonna {dayjs().format("YYYY")} tyypillinen <strong>{sauna.eventLength} tunnin {sauna.name === "Saunalautta (Tampereen vesijettivuokraus)" ? "sauna" : "risteily"}</strong> saunalautalla {sauna.name} maksaa <strong>noin {pricing} €</strong>. {sauna.notes}</p>
                </div>
                <div className="contact">
                    <h2>Yhteystiedot</h2>
                    {sauna.urlArray.map(url => (
                        <li key={url}><a key={url} href={url}>{url}</a></li>
                    ))}
                    <p>Puhelinnumero: <a href={`tel:${sauna.phone}`}>{sauna.phone}</a></p>
                    <p>Sähköposti: <a href={`mailto:${sauna.email}`}>{sauna.email}</a></p>
                </div>
                <div className="equipment">
                    <h2>Varusteet</h2>
                    {sauna.equipment.map(thing => <li key={thing}>{thing}</li>)}
                </div>
                <div className="images">
                    <h2>Kuvia</h2>
                    <div>
                        <ImageList sx={{ width: 500 }} cols={3} rowHeight={164}>
                            {sauna.images.map((image) => (
                                <ImageListItem key={image}>
                                    <img
                                        src={`/images/${image}?w=164&h=164&fit=crop&auto=format`}
                                        alt={image}
                                        loading="lazy"
                                        onClick={() => handleOpen(image)}
                                    />
                                </ImageListItem>
                            ))
                            }
                        </ImageList>
                    </div>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>
                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <img src={`/images/${modalImage}`} alt={modalImage} width="300px" />
                            </div>
                        </Box>
                    </Modal>
                </div>
            </div>
        </>
    )
}

export default Name

export const getStaticPaths = async () => {
    const paths = saunas.map(sauna => ({
        params: {
            url_name: sauna.url_name,
        },

    }))

    return {
        paths,
        fallback: false
    }
}

export const getStaticProps = async (context: any) => {
    const sauna = saunas.find(sauna => sauna.url_name === context.params.url_name)

    return {
        props: {
            sauna,
        },
    }
}
