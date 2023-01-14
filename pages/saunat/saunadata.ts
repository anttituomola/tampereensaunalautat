export interface Saunalautta {
    id: string
    name: string
    location: string
    capacity: number
    pricemin: number
    pricemax: number
    equipment: string[]
    images: string[]
    mainImage: string
    email: string
    phone: string
    url: string
    notes?: string
    url_name: string
    eventLength: number
    urlArray: string[]
}

export const saunas = [
    {
        "id": "cl5jklabw0042xcudg4l6d76z",
        "name": "M/S BlackBox",
        "url_name": "ms-blackbox",
        "location": "Pyhäjärvi",
        "capacity": 15,
        "eventLength": 3,
        "pricemin": 525,
        "pricemax": 600,
        "equipment": [
            "Kattoterassi",
            "Palju",
            "Äänentoisto",
            "Kahvinkeitin",
            "TV",
            "WC",
            "Suihku",
            "Grilli",
            "Mikro",
            "Kylmäsäilytys"
        ],
        "images": [
            "ms_blackbox_1.jpg"
        ],
        "mainImage": "ms_blackbox_1.jpg",
        "email": "info@saunalauttaristeilyt.fi",
        "phone": "+358400379160",
        "url": "https://saunalauttaristeilyt.fi/#blackbox",
        "urlArray": [
            "https://saunalauttaristeilyt.fi/#blackbox",
            "https://www.facebook.com/saunalauttaristeilyt",
            "https://www.instagram.com/saunalauttaristeilyt/"
        ],
        "notes": ""
    },
    {
        "id": "cl5jkaesh0007xcud0qwpnltz",
        "name": "M/S Palju",
        "url_name": "ms-palju",
        "location": "Pyhäjärvi",
        "capacity": 12,
        "eventLength": 3,
        "pricemin": 500,
        "pricemax": 500,
        "equipment": [
            "WC",
            "Grilli",
            "Kylmäsäilytys",
            "Suihku",
            "Pukuhuone",
            "Puulämmitteinen kiuas",
            "Jääkaappi",
            "Kaasugrilli",
            "Äänentoisto",
            "Palju",
            ""
        ],
        "images": [
            "ms_palju_1.jpg"
        ],
        "mainImage": "ms_palju_1.jpg",
        "email": "info@paljulautta.fi",
        "phone": "+358449481695",
        "url": "http://www.paljulautta.fi/428320069",
        "urlArray": [
            "http://www.paljulautta.fi/428320069"
        ],
        "notes": ""
    },
    {
        "id": "cl5jn45iw0007r4udodq83h59",
        "name": "Vertical",
        "url_name": "vertical",
        "location": "Pyhäjärvi",
        "capacity": 20,
        "eventLength": 3,
        "pricemin": 675,
        "pricemax": 750,
        "equipment": [
            "Kahvinkeitin",
            "Mikro",
            "Äänentoisto",
            "TV",
            "Kylmäsäilytys",
            "WC",
            "Suihku",
            "Grilli",
            "Pukuhuone"
        ],
        "images": [
            "vertical_1.jpg"
        ],
        "mainImage": "vertical_1.jpg",
        "email": "info@saunalauttaristeilyt.fi",
        "phone": "+358400379160",
        "url": "https://saunalauttaristeilyt.fi/#vertical",
        "urlArray": [
            "https://saunalauttaristeilyt.fi/#vertical",
            "https://www.instagram.com/saunalauttaristeilyt/",
            "https://www.facebook.com/saunalauttaristeilyt"
        ],
        "notes": ""
    },
    {
        "id": "cl5kpp47w0007foudohpvyy7l",
        "name": "Saunalautta (Tampereen vesijettivuokraus)",
        "url_name": "saunalautta-tampereen-vesijettivuokraus",
        "location": "Pyhäjärvi",
        "capacity": 16,
        "eventLength": 4,
        "pricemin": 300,
        "pricemax": 300,
        "equipment": [
            "Grilli",
            "WC",
            "Äänentoisto",
            "Kattoterassi",
            "Kylmäsäilytys"
        ],
        "images": [
            "saunalautta_1.jpg"
        ],
        "mainImage": "saunalautta_1.jpg",
        "email": "info@tampereenvesijettivuokraus.fi",
        "phone": "+358505555913",
        "url": "https://www.tampereenvesijettivuokraus.fi/tuote/saunalautta/",
        "urlArray": [
            "https://www.tampereenvesijettivuokraus.fi/tuote/saunalautta/"
        ],
        "notes": "Ei liiku, kiinteästi laiturissa."
    },
    {
        "id": "cl5kqndgz0041xgudmso68l8t",
        "name": "M/S Suvanto",
        "url_name": "ms-suvanto",
        "location": "Pyhäjärvi",
        "capacity": 12,
        "eventLength": 3,
        "pricemin": 500,
        "pricemax": 500,
        "equipment": [
            "Suihku",
            "WC",
            "Pukuhuone",
            "Poreallas",
            "Äänentoisto",
            "Grilli",
            "Kylmäsäilytys",
            "Kahvinkeitin",
            "Jääpalakone",
            "Takka",
            "Kattoterassi"
        ],
        "images": [
            "ms_suvanto_1.jpg"
        ],
        "mainImage": "ms_suvanto_1.jpg",
        "email": "jukka.oksala7@gmail.com",
        "phone": "+358405888859",
        "url": "http://www.lauttasauna.fi/434798059",
        "urlArray": [
            "http://www.lauttasauna.fi/434798059",
            "https://calendar.google.com/calendar/u/0/embed?src=jukka.oksala7@gmail.com&ctz=Europe/Helsinki"
        ],
        "notes": ""
    },
    {
        "id": "cl5kqndh00043xgudju3f0biq",
        "name": "M/S Vanaja",
        "url_name": "ms-vanaja",
        "location": "Pyhäjärvi",
        "capacity": 12,
        "eventLength": 3,
        "pricemin": 500,
        "pricemax": 500,
        "equipment": [
            "Suihku",
            "WC",
            "Pukuhuone",
            "Poreallas",
            "Äänentoisto",
            "Grilli",
            "Kylmäsäilytys",
            "Kahvinkeitin",
            "Kattoterassi"
        ],
        "images": [],
        "mainImage": "ms_vanaja.jpg",
        "email": "jukka.oksala7@gmail.com",
        "phone": "+358405888859",
        "url": "http://www.lauttasauna.fi/434798059",
        "urlArray": [
            "http://www.lauttasauna.fi/434798059",
            "https://calendar.google.com/calendar/u/0/embed?height=400&wkst=2&bgcolor=%23FFFFFF&src=qd8n50oht4udrf0o3p4rbbekv8@group.calendar.google.com&color=%23125A12&src=fi.finnish%23holiday@group.v.calendar.google.com&color=%23125A12&ctz=Europe/Helsinki"
        ],
        "notes": ""
    },
    {
        "id": "cl5ksjc940212xgudvm32lpsa",
        "name": "Laineilla.fi saunalautta",
        "url_name": "laineilla-fi-saunalautta",
        "location": "Näsijärvi",
        "capacity": 20,
        "eventLength": 3,
        "pricemin": 750,
        "pricemax": 750,
        "equipment": [
            "Palju",
            "Kattoterassi",
            "Pukuhuone",
            "WC",
            "Suihku",
            "Kylmäsäilytys",
            "TV",
            "Äänentoisto",
            "Grilli",
            "Kahvinkeitin"
        ],
        "images": [
            "laineilla_1.jpg",
            "laineilla_fi_saunalautta_tampere.jpg",
            "laineilla_fi_saunalautta_tampere2.jpg",
            "laineilla_fi_saunalautta_tampere3.jpg",
            "laineilla_fi_saunalautta_tampere4.jpg",
            "laineilla_fi_saunalautta_tampere5.jpg",
            "laineilla_fi_saunalautta_tampere6.jpg",
            "laineilla_fi_saunalautta_tampere7.jpg",
            "laineilla_fi_saunalautta_tampere8.jpg",
            "laineilla_fi_saunalautta_tampere9.jpg",
        ],
        "mainImage": "laineilla_1.jpg",
        "email": "santeri@laineille.fi",
        "phone": "+358442122757",
        "url": "https://laineille.fi/",
        "urlArray": [
            "https://laineille.fi/",
            "https://www.instagram.com/laineillefi/",
            "https://www.varaaheti.fi/laineillesaunalautta/fi/laineille/varaa"
        ],
        "notes": "Myös talvivuokrausmahdollisuus ja avantouinti!"
    },
    {
        "id": "cl5kqu1160065xgudjsdkr2o6",
        "name": "Saunalautta Tampere",
        "url_name": "saunalautta-tampere",
        "location": "Näsijärvi",
        "capacity": 12,
        "eventLength": 3,
        "pricemin": 320,
        "pricemax": 410,
        "equipment": [
            "Grilli",
            "WC",
            "Kylmäsäilytys",
            "Pukuhuone"
        ],
        "images": [
            "tampereen_saunalautta.jpg"
        ],
        "mainImage": "tampereen_saunalautta.jpg",
        "email": "info@saunalauttatampere.fi",
        "phone": "+358447917085",
        "url": "https://www.saunalauttatampere.fi/",
        "urlArray": [
            "https://www.saunalauttatampere.fi/"
        ],
        "notes": ""
    },
    {
        "id": "cl5krawua0125xgudkr4tkvcd",
        "name": "Tampereen Saunalautta",
        "url_name": "tampereen-saunalautta",
        "location": "Näsijärvi",
        "capacity": 8,
        "eventLength": 3,
        "pricemin": 220,
        "pricemax": 270,
        "equipment": [
            "Grilli",
            "Kylmäsäilytys",
            "Kattoterassi"
        ],
        "images": [
            "tampereen_saunalautta_hiltunen.jpg"
        ],
        "mainImage": "tampereen_saunalautta_hiltunen.jpg",
        "email": "tmi.hiltunen.lari@gmail.com",
        "phone": "+358451139694",
        "url": "https://www.tampereensaunalautta.com/",
        "urlArray": [
            "https://www.tampereensaunalautta.com/"
        ],
        "notes": ""
    },
    {
        "id": "cl5krnvob0160xgudyiep2r1p",
        "name": "Saunakatamaraani",
        "url_name": "saunakatamaraani",
        "location": "Näsijärvi",
        "capacity": 12,
        "eventLength": 3,
        "pricemin": 400,
        "pricemax": 450,
        "equipment": [
            "Kylmäsäilytys",
            "WC",
            "Äänentoisto",
            "Grilli",
            "Kattoterassi"
        ],
        "images": [
            "saunakatamaraani.jpg"
        ],
        "mainImage": "saunakatamaraani.jpg",
        "email": "kippari@suomenkatamaraani.fi",
        "phone": "+358408317705",
        "url": "https://suomenkatamaraani.fi/saunakatamaraani/",
        "urlArray": [
            "https://suomenkatamaraani.fi/saunakatamaraani/",
            "https://www.facebook.com/SuomenKatamaraani/",
            "https://www.instagram.com/suomenkatamaraanioy/"
        ],
        "notes": ""
    },
    {
        "id": "cl5ks5faz0177xgudn1mt4jl3",
        "name": "Saunalautta Tyyne",
        "url_name": "saunalautta-tyyne",
        "location": "Näsijärvi",
        "capacity": 9,
        "eventLength": 3,
        "pricemin": 250,
        "pricemax": 250,
        "equipment": [
            "Kattoterassi",
            "Grilli",
            "WC",
            "Kylmäsäilytys",
            "Äänentoisto"
        ],
        "images": [
            "saunalautta_tyyne.png"
        ],
        "mainImage": "saunalautta_tyyne.png",
        "email": "korentoartofficial@gmail.com",
        "phone": "+358415116853",
        "url": "https://www.korentoart.fi/saunalautta-tyyne/",
        "urlArray": [
            "https://www.korentoart.fi/saunalautta-tyyne/",
            "https://www.instagram.com/saunalauttatyyne/"
        ],
        "notes": ""
    },
    {
        "id": "cl66bty490014l4udtjjje71y",
        "name": "Saunalautta Auroora",
        "url_name": "saunalautta-auroora",
        "location": "Pyhäjärvi",
        "capacity": 12,
        "eventLength": 3,
        "pricemin": 500,
        "pricemax": 500,
        "equipment": [
            "Kattoterassi",
            "Palju",
            "Grilli"
        ],
        "images": [],
        "mainImage": "saunalautta_auroora.jpg",
        "email": "info@saunalauttaauroora.fi",
        "phone": "+358452078899",
        "url": "http://www.saunalauttaauroora.fi/index.html",
        "urlArray": [
            "http://www.saunalauttaauroora.fi/index.html",
            "https://www.facebook.com/saunalauttaauroora/",
            "https://www.instagram.com/saunalauttaauroora/"
        ],
        "notes": ""
    }
] as Saunalautta[]

